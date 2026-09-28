import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getOrderById, updateOrderCustomer } from "@/lib/orders-db";
import { isAdminRequest } from "@/lib/admin-auth";
import { newEventId, nowIso } from "@/lib/order-events";
import { CustomerFieldChange, OrderCustomer } from "@/types/order";

const FIELDS: (keyof OrderCustomer)[] = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "address1",
  "address2",
  "city",
  "state",
  "zip",
  "country",
];
const REQUIRED: (keyof OrderCustomer)[] = [
  "firstName",
  "lastName",
  "email",
  "address1",
  "city",
  "state",
  "zip",
];

// PATCH /api/orders/[orderId]/customer — admin edit of the customer's name,
// contact and shipping address. The before/after of every changed field is
// logged to order.history in the same write. Sends no email; use a history
// row's "Resend email" afterwards if the customer should get one.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orderId } = await params;
    const body = (await req.json().catch(() => ({}))) as Partial<
      Record<keyof OrderCustomer, unknown>
    >;

    const existing = await getOrderById(orderId);
    if (!existing) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const next: OrderCustomer = { ...existing.customer };
    for (const field of FIELDS) {
      const raw = body[field];
      if (raw === undefined) continue;
      const value = typeof raw === "string" ? raw.trim() : "";
      if (value) {
        next[field] = value;
      } else {
        delete next[field];
      }
    }

    const missing = REQUIRED.filter((f) => !next[f]);
    if (missing.length) {
      return NextResponse.json(
        { message: `Required: ${missing.join(", ")}` },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email)) {
      return NextResponse.json(
        { message: "Enter a valid email address" },
        { status: 400 }
      );
    }

    const changes: CustomerFieldChange[] = FIELDS.filter(
      (f) => (existing.customer[f] ?? "") !== (next[f] ?? "")
    ).map((f) => ({
      field: f,
      from: existing.customer[f] ?? "",
      to: next[f] ?? "",
    }));

    if (!changes.length) {
      return NextResponse.json({ message: "No changes to save" }, { status: 400 });
    }

    const updated = await updateOrderCustomer(orderId, next, {
      id: newEventId(),
      at: nowIso(),
      type: "customer_updated",
      changes,
    });

    return NextResponse.json(updated);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("Failed to update customer:", detail);
    return NextResponse.json(
      { message: "Failed to update customer", detail },
      { status: 500 }
    );
  }
}
