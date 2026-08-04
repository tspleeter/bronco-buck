import { NextResponse } from "next/server";
import Stripe from "stripe";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

export const dynamic = "force-dynamic";

const ssm = new SSMClient({ region: "us-east-1" });

// Keep shipping logic in sync with the checkout page + cart.
const FREE_SHIPPING_THRESHOLD = 75;
const FLAT_SHIPPING = 8.95;

let cachedStripe: Stripe | null = null;

async function getStripe(): Promise<Stripe> {
  if (cachedStripe) return cachedStripe;

  const result = await ssm.send(
    new GetParameterCommand({
      Name: "/bronco-buck/stripe-secret-key",
      WithDecryption: true,
    })
  );

  const stripeKey = result.Parameter?.Value ?? "";
  if (!stripeKey.startsWith("sk_")) {
    throw new Error(
      `Wrong key type in SSM: starts with ${stripeKey.substring(0, 7)}`
    );
  }

  cachedStripe = new Stripe(stripeKey, { apiVersion: "2026-04-22.dahlia" });
  return cachedStripe;
}

interface CalcTaxAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

interface CalcTaxBody {
  paymentIntentId: string;
  subtotal: number; // dollars
  address: CalcTaxAddress;
}

const toCents = (dollars: number) => Math.round(dollars * 100);

function deriveShipping(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
}

export async function POST(req: Request) {
  let subtotal = 0;
  let shipping = 0;

  try {
    const body = (await req.json()) as CalcTaxBody;
    const { paymentIntentId, address } = body;
    subtotal = Number(body.subtotal) || 0;
    // Re-derive shipping server-side rather than trusting the client.
    shipping = deriveShipping(subtotal);

    if (!paymentIntentId || subtotal <= 0) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const stripe = await getStripe();
    const subtotalCents = toCents(subtotal);
    const shippingCents = toCents(shipping);
    const untaxedTotal = subtotal + shipping;

    try {
      // Product + shipping tax codes come from the account's preset codes
      // (set in the Stripe Dashboard); tax_behavior defaults to exclusive (USD).
      const calculation = await stripe.tax.calculations.create({
        currency: "usd",
        line_items: [{ amount: subtotalCents, reference: "bronco_buck" }],
        shipping_cost: { amount: shippingCents },
        customer_details: {
          address: {
            line1: address?.line1 || undefined,
            line2: address?.line2 || undefined,
            city: address?.city || undefined,
            state: address?.state || undefined,
            postal_code: address?.postal_code || undefined,
            country: address?.country || "US",
          },
          address_source: "shipping",
        },
      });

      if (!calculation.id) {
        throw new Error("Tax calculation returned no id");
      }

      // Link the calculation to the PaymentIntent. On the pinned API version
      // (dahlia), Stripe auto-creates the tax transaction when the intent
      // succeeds and auto-reverses it on refund — no webhook required.
      await stripe.paymentIntents.update(paymentIntentId, {
        amount: calculation.amount_total,
        hooks: { inputs: { tax: { calculation: calculation.id } } },
      });

      return NextResponse.json({
        subtotal,
        shipping,
        tax: calculation.tax_amount_exclusive / 100,
        total: calculation.amount_total / 100,
      });
    } catch (calcErr) {
      // Tax unavailable (Stripe Tax not enabled, no registration for the
      // customer's location, or an unusable address). Fall back to charging
      // subtotal + shipping with no tax so the live checkout never breaks.
      // Reset the intent amount and clear any tax link left by a prior address.
      const detail =
        calcErr instanceof Error ? calcErr.message : String(calcErr);
      console.error("Tax calc unavailable, falling back to no tax:", detail);

      try {
        await stripe.paymentIntents.update(paymentIntentId, {
          amount: toCents(untaxedTotal),
          hooks: { inputs: { tax: { calculation: "" } } },
        });
      } catch (resetErr) {
        console.error("Failed to reset intent after tax fallback:", resetErr);
      }

      return NextResponse.json({
        subtotal,
        shipping,
        tax: 0,
        total: untaxedTotal,
        taxUnavailable: true,
      });
    }
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("calculate-tax error:", detail);
    // Last-resort: report no tax so the client can still charge the base total.
    return NextResponse.json({
      subtotal,
      shipping,
      tax: 0,
      total: subtotal + shipping,
      taxUnavailable: true,
    });
  }
}
