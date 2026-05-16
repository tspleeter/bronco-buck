import { NextResponse } from "next/server";
import { createOrder, getOrders } from "@/lib/orders-db";
import { Order } from "@/types/order";

export async function GET() {
  try {
    const orders = await getOrders();
    return NextResponse.json(orders);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("Failed to fetch orders:", detail);
    return NextResponse.json(
      { message: "Failed to fetch orders", detail },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const order = (await req.json()) as Order;

    if (!order.orderId || !order.customer || !order.items) {
      return NextResponse.json(
        { message: "Invalid order payload" },
        { status: 400 }
      );
    }

    // Debug: log whether env vars are present (not their values)
    console.log("DYNAMO_ACCESS_KEY_ID present:", !!process.env.DYNAMO_ACCESS_KEY_ID);
    console.log("DYNAMO_SECRET_KEY present:", !!process.env.DYNAMO_SECRET_KEY);
    console.log("DYNAMO_REGION:", process.env.DYNAMO_REGION);
    console.log("DYNAMO_ORDERS_TABLE:", process.env.DYNAMO_ORDERS_TABLE);

    await createOrder(order);

    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("Failed to create order:", detail);
    return NextResponse.json(
      { message: "Failed to create order", detail },
      { status: 500 }
    );
  }
}
