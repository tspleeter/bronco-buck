import { NextResponse } from "next/server";
import { fulfillGiftPurchase } from "@/lib/gift-codes-server";

export const dynamic = "force-dynamic";

/**
 * Called by /gift-card after Stripe confirms payment (and again on a 3-D Secure
 * redirect return). Verifies the PaymentIntent with Stripe, then creates the
 * code + emails it once. Idempotent — repeat calls return the same code.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const id = typeof body?.paymentIntentId === "string" ? body.paymentIntentId : "";
  if (!/^pi_[A-Za-z0-9]+$/.test(id)) {
    return NextResponse.json({ message: "Missing payment." }, { status: 400 });
  }
  try {
    const result = await fulfillGiftPurchase(id);
    return NextResponse.json(result);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("Gift fulfill error:", detail);
    return NextResponse.json(
      { message: "We couldn't confirm that payment. Email orders@buckthatduck.com and we'll sort it out." },
      { status: 400 },
    );
  }
}
