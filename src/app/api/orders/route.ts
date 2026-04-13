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
