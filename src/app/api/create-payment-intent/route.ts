import { NextResponse } from "next/server";
import Stripe from "stripe";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const ssm = new SSMClient({ region: process.env.DYNAMO_REGION ?? "us-east-1" });

async function getStripeKey(): Promise<string> {
  // Try env var first (local dev)
  if (process.env.STRIPE_SECRET_KEY) {
    return process.env.STRIPE_SECRET_KEY;
  }

  // Fall back to SSM Parameter Store (production)
  const result = await ssm.send(
    new GetParameterCommand({
      Name: "/bronco-buck/stripe-secret-key",
      WithDecryption: true,
    })
  );

  return result.Parameter?.Value ?? "";
}

export async function POST(req: Request) {
  try {
    const stripeKey = await getStripeKey();

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
