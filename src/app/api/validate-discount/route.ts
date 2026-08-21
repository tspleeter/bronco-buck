import { NextResponse } from "next/server";
import { getDiscount } from "@/lib/discounts-db";
import { evaluateDiscount, normalizeCode } from "@/lib/discount-logic";

export const dynamic = "force-dynamic";

// Public endpoint — the checkout "Apply code" button calls this for immediate
// valid/invalid + preview-amount feedback. It NEVER mutates anything and never
// sets the charge amount; the authoritative discount is re-derived server-side
// in /api/calculate-tax when the PaymentIntent amount is updated.
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { code?: string; subtotal?: number };
    const code = normalizeCode(body.code);
    const subtotal = Number(body.subtotal) || 0;

    if (!code) {
      return NextResponse.json(
        { valid: false, code: "", discount: 0, reason: "Enter a code." },
        { status: 200 },
      );
    }

    const discount = await getDiscount(code);
    const evaluation = evaluateDiscount(discount, subtotal);

    return NextResponse.json({
      valid: evaluation.valid,
      code,
      discount: evaluation.amount,
      reason: evaluation.reason,
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("validate-discount error:", detail);
    // Fail safe: report invalid rather than blocking checkout.
    return NextResponse.json({
      valid: false,
      code: "",
      discount: 0,
      reason: "Couldn't check that code. Try again.",
    });
  }
}
