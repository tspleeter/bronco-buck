import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeKey) {
      console.error("STRIPE_SECRET_KEY is not set");
      return NextResponse.json(
        { message: "Stripe not configured", detail: "STRIPE_SECRET_KEY missing" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2026-04-22.dahlia",
    });

    const { amount } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { message: "Invalid amount" },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("Failed to create payment intent:", detail);
    return NextResponse.json(
      { message: "Failed to create payment intent", detail },
      { status: 500 }
    );
  }
}
