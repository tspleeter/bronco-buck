import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  updateDiscount,
  deleteDiscount,
  TableInitializingError,
} from "@/lib/discounts-db";
import { DiscountType } from "@/types/discount";

export const dynamic = "force-dynamic";

const ORDERS_PASSWORD = process.env.ORDERS_PASSWORD ?? "061970";
const COOKIE_NAME = "orders_auth";

function isAuthed(req: NextRequest): boolean {
  return req.cookies.get(COOKIE_NAME)?.value === ORDERS_PASSWORD;
}

const VALID_TYPES: DiscountType[] = ["percent", "fixed"];

// PATCH /api/discounts/[code] — update fields (admin). Commonly used to flip
// `active`, but supports editing value/type/limits/expiry/description too.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  if (!isAuthed(req)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const { code } = await params;
    const body = (await req.json()) as {
      type?: string;
      value?: number;
      active?: boolean;
      maxRedemptions?: number | null;
      minSubtotal?: number | null;
      expiresAt?: string | null;
      description?: string | null;
    };

    if (body.type !== undefined && !VALID_TYPES.includes(body.type as DiscountType)) {
      return NextResponse.json({ message: "Invalid type." }, { status: 400 });
    }
    if (
      body.value !== undefined &&
      (!Number.isFinite(Number(body.value)) || Number(body.value) <= 0)
    ) {
      return NextResponse.json(
        { message: "Value must be a positive number." },
        { status: 400 },
      );
    }
    if (
      body.type === "percent" &&
      body.value !== undefined &&
      Number(body.value) > 100
    ) {
      return NextResponse.json(
        { message: "Percent value can't exceed 100." },
        { status: 400 },
      );
    }

    const expiresAt =
      body.expiresAt === undefined
        ? undefined
        : body.expiresAt && !Number.isNaN(Date.parse(body.expiresAt))
          ? new Date(body.expiresAt).toISOString()
          : null;

    const updated = await updateDiscount(code, {
      type: body.type as DiscountType | undefined,
      value: body.value !== undefined ? Number(body.value) : undefined,
      active: body.active,
      maxRedemptions:
        body.maxRedemptions === undefined
          ? undefined
          : body.maxRedemptions == null || Number(body.maxRedemptions) <= 0
            ? null
            : Math.floor(Number(body.maxRedemptions)),
      minSubtotal:
        body.minSubtotal === undefined
          ? undefined
          : body.minSubtotal == null || Number(body.minSubtotal) <= 0
            ? null
            : Number(body.minSubtotal),
      expiresAt,
      description:
        body.description === undefined
          ? undefined
          : (body.description?.trim() || null),
    });

    if (!updated) {
      return NextResponse.json({ message: "Code not found." }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof TableInitializingError) {
      return NextResponse.json(
        { message: "Discounts are initializing — try again in ~30 seconds." },
        { status: 503 },
      );
    }
    const detail = err instanceof Error ? err.message : String(err);
    console.error("Failed to update discount:", detail);
    return NextResponse.json(
      { message: "Failed to update discount", detail },
      { status: 500 },
    );
  }
}

// DELETE /api/discounts/[code] — remove a code (admin).
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  if (!isAuthed(req)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const { code } = await params;
    await deleteDiscount(code);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof TableInitializingError) {
      return NextResponse.json(
        { message: "Discounts are initializing — try again in ~30 seconds." },
        { status: 503 },
      );
    }
    const detail = err instanceof Error ? err.message : String(err);
    console.error("Failed to delete discount:", detail);
    return NextResponse.json(
      { message: "Failed to delete discount", detail },
      { status: 500 },
    );
  }
}
