import { NextResponse } from "next/server";
import Stripe from "stripe";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { STRIPE_SECRET_PARAM, STRIPE_SECRET_PREFIX } from "@/lib/stripe-mode";

export const dynamic = "force-dynamic";

const ssm = new SSMClient({ region: "us-east-1" });

export async function POST(req: Request) {
  try {
    const result = await ssm.send(
      new GetParameterCommand({
        Name: STRIPE_SECRET_PARAM,
        WithDecryption: true,
      })
    );

    const stripeKey = result.Parameter?.Value ?? "";
    console.log("Key type:", stripeKey.startsWith(STRIPE_SECRET_PREFIX) ? "secret" : "WRONG KEY - starts with: " + stripeKey.substring(0, 7));

    if (!stripeKey.startsWith(STRIPE_SECRET_PREFIX)) {
      return NextResponse.json(
        { message: "Wrong key type in SSM", detail: `Key starts with: ${stripeKey.substring(0, 7)}` },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2026-04-22.dahlia",
    });

    const { amount } = await req.json();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("Payment intent error:", detail);
    return NextResponse.json(
      { message: "Failed to create payment intent", detail },
      { status: 500 }
    );
  }
}
