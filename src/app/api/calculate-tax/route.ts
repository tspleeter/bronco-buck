import { NextResponse } from "next/server";
import Stripe from "stripe";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { STRIPE_SECRET_PARAM, STRIPE_SECRET_PREFIX } from "@/lib/stripe-mode";
import { getDiscount } from "@/lib/discounts-db";
import { evaluateDiscount, normalizeCode } from "@/lib/discount-logic";
import { shippingFor } from "@/lib/shipping-rules";

export const dynamic = "force-dynamic";

const ssm = new SSMClient({ region: "us-east-1" });


let cachedStripe: Stripe | null = null;

async function getStripe(): Promise<Stripe> {
  if (cachedStripe) return cachedStripe;

  const result = await ssm.send(
    new GetParameterCommand({
      Name: STRIPE_SECRET_PARAM,
      WithDecryption: true,
    })
  );

  const stripeKey = result.Parameter?.Value ?? "";
  if (!stripeKey.startsWith(STRIPE_SECRET_PREFIX)) {
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
  subtotal: number; // dollars — merchandise subtotal BEFORE discount
  itemCount?: number; // total quantity of Bucks in the cart (2+ ships free)
  discountCode?: string;
  address: CalcTaxAddress;
}

const toCents = (dollars: number) => Math.round(dollars * 100);

function deriveShipping(subtotal: number, itemCount: number): number {
  if (subtotal <= 0) return 0;
  // Older clients don't send itemCount; treat that as a single item.
  return shippingFor(Math.max(1, Math.floor(itemCount) || 1));
}

export async function POST(req: Request) {
  let subtotal = 0;
  let shipping = 0;
  let discount = 0;

  try {
    const body = (await req.json()) as CalcTaxBody;
    const { paymentIntentId, address } = body;
    subtotal = Number(body.subtotal) || 0;
    // Re-derive shipping server-side from the item count (2+ Bucks ship free).
    // A discount code never changes shipping.
    shipping = deriveShipping(subtotal, Number(body.itemCount) || 1);

    if (!paymentIntentId || subtotal <= 0) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    // Server-authoritative discount: re-validate the code here (the client is
    // never trusted with the amount) and apply it to the taxable line item.
    const code = normalizeCode(body.discountCode);
    if (code) {
      const found = await getDiscount(code);
      const evaluation = evaluateDiscount(found, subtotal);
      if (evaluation.valid) discount = evaluation.amount;
    }
    const discountedSubtotal = Math.max(
      0,
      Math.round((subtotal - discount) * 100) / 100,
    );

    const stripe = await getStripe();
    const subtotalCents = toCents(discountedSubtotal);
    const shippingCents = toCents(shipping);
    const untaxedTotal = discountedSubtotal + shipping;

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
        discount,
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
        discount,
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
      discount,
      shipping,
      tax: 0,
      total: Math.max(0, subtotal - discount) + shipping,
      taxUnavailable: true,
    });
  }
}
