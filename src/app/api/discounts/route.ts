import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  listDiscounts,
  createDiscount,
  TableInitializingError,
  DuplicateCodeError,
} from "@/lib/discounts-db";
import { normalizeCode } from "@/lib/discount-logic";
import { DiscountType } from "@/types/discount";

export const dynamic = "force-dynamic";

const ORDERS_PASSWORD = process.env.ORDERS_PASSWORD ?? "061970";
const COOKIE_NAME = "orders_auth";

function isAuthed(req: NextRequest): boolean {
  return req.cookies.get(COOKIE_NAME)?.value === ORDERS_PASSWORD;
}

const VALID_TYPES: DiscountType[] = ["percent", "fixed"];

// GET /api/discounts — list all codes (admin).
export async function GET(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const discounts = await listDiscounts();
    return NextResponse.json(discounts);
  } catch (err) {
    if (err instanceof TableInitializingError) {
      return NextResponse.json(
        { message: "Discounts are initializing — refresh in ~30 seconds." },
        { status: 503 },
      );
    }
    const detail = err instanceof Error ? err.message : String(err);
    console.error("Failed to list discounts:", detail);
    return NextResponse.json(
      { message: "Failed to load discounts", detail },
      { status: 500 },
    );
  }
}

// POST /api/discounts — create a code (admin).
export async function POST(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as {
      code?: string;
      type?: string;
      value?: number;
      active?: boolean;
      maxRedemptions?: number | null;
      minSubtotal?: number | null;
      expiresAt?: string | null;
      description?: string;
    };

    const code = normalizeCode(body.code);
    if (!code) {
      return NextResponse.json({ message: "Code is required." }, { status: 400 });
    }
    if (!/^[A-Z0-9][A-Z0-9-]{0,31}$/.test(code)) {
      return NextResponse.json(
        { message: "Code must be letters, numbers, or dashes (max 32)." },
        { status: 400 },
      );
    }
    if (!body.type || !VALID_TYPES.includes(body.type as DiscountType)) {
      return NextResponse.json(
        { message: "Type must be 'percent' or 'fixed'." },
        { status: 400 },
      );
    }
    const value = Number(body.value);
    if (!Number.isFinite(value) || value <= 0) {
      return NextResponse.json(
        { message: "Value must be a positive number." },
        { status: 400 },
      );
    }
    if (body.type === "percent" && value > 100) {
      return NextResponse.json(
        { message: "Percent value can't exceed 100." },
        { status: 400 },
      );
    }

    const maxRedemptions =
      body.maxRedemptions == null || Number(body.maxRedemptions) <= 0
        ? null
        : Math.floor(Number(body.maxRedemptions));
    const minSubtotal =
      body.minSubtotal == null || Number(body.minSubtotal) <= 0
        ? null
        : Number(body.minSubtotal);
    const expiresAt =
      body.expiresAt && !Number.isNaN(Date.parse(body.expiresAt))
        ? new Date(body.expiresAt).toISOString()
        : null;

    const discount = await createDiscount({
      code,
      type: body.type as DiscountType,
      value,
      active: body.active ?? true,
      maxRedemptions,
      minSubtotal,
      expiresAt,
      description: body.description,
    });

    return NextResponse.json(discount, { status: 201 });
  } catch (err) {
    if (err instanceof TableInitializingError) {
      return NextResponse.json(
        { message: "Discounts are initializing — try again in ~30 seconds." },
        { status: 503 },
      );
    }
    if (err instanceof DuplicateCodeError) {
      return NextResponse.json(
        { message: "That code already exists." },
        { status: 409 },
      );
    }
    const detail = err instanceof Error ? err.message : String(err);
    console.error("Failed to create discount:", detail);
    return NextResponse.json(
      { message: "Failed to create discount", detail },
      { status: 500 },
    );
  }
}
