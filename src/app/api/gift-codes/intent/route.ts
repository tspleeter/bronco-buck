import { NextResponse } from "next/server";
import {
  getStripe,
  GIFT_PRICE_CENTS,
  sanitizeGiftPurchase,
} from "@/lib/gift-codes-server";

export const dynamic = "force-dynamic";

/**
 * Create the PaymentIntent for a gift-code purchase. The price is fixed on the
 * server (the client never sends an amount). Buyer details ride in metadata so
 * /api/gift-codes/fulfill can build the code + email from Stripe alone.
 */
export async function POST(req: Request) {
  try {
    const input = sanitizeGiftPurchase(await req.json().catch(() => null));
    if (!input) {
      return NextResponse.json(
        { message: "Please fill in your name, email, and the recipient's name and full US address." },
        { status: 400 },
      );
    }
    const stripe = await getStripe();
    const pi = await stripe.paymentIntents.create({
      amount: GIFT_PRICE_CENTS,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      receipt_email: input.buyerEmail,
      description: "Bronco Buck gift code",
      metadata: {
        kind: "gift_code",
        buyerName: input.buyerName,
        buyerEmail: input.buyerEmail,
        recipientName: input.recipientName,
        recipientAddress: input.recipientAddress,
        message: input.message ?? "",
      },
    });
    return NextResponse.json({
      clientSecret: pi.client_secret,
      paymentIntentId: pi.id,
    });
  } catch (err) {
    console.error("Gift intent error:", err);
    return NextResponse.json(
      { message: "Couldn't start checkout. Please try again." },
      { status: 500 },
    );
  }
}
