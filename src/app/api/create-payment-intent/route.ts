import { NextResponse } from "next/server";
import Stripe from "stripe";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const ssm = new SSMClient({ region: "us-east-1" });

async function getStripeKey(): Promise<string> {
  try {
    const result = await ssm.send(
      new GetParameterCommand({
        Name: "/bronco-buck/stripe-secret-key",
        WithDecryption: true,
      })
    );
    const key = result.Parameter?.Value ?? "";
    console.log("SSM key prefix:", key.substring(0, 10));
    return key;
  } catch (err) {
    console.error("SSM fetch failed:", err);
    return process.env.STRIPE_SECRET_KEY ?? "";
  }
}

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const stripeKey = await getStripeKey();

    if (!stripeKey) {
      return NextResponse.json(
        { message: "Stripe not configured", detail: "No key found" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2026-04-22.dahlia",
    });

    const { amount } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ message: "Invalid amount" }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });

    const response = NextResponse.json({ clientSecret: paymentIntent.client_secret });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("Failed to create payment intent:", detail);
    return NextResponse.json(
      { message: "Failed to create payment intent", detail },
      { status: 500 }
    );
  }
}
