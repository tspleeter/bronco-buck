import { createHmac } from "crypto";
import Stripe from "stripe";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { STRIPE_SECRET_PARAM, STRIPE_SECRET_PREFIX } from "@/lib/stripe-mode";
import { GIFT_MESSAGE_MAX } from "@/lib/gift";
import {
  GIFT_CODE_PREFIX,
  GIFT_CODE_PRICE,
  GIFT_CODE_VALUE,
  GIFT_NAME_MAX,
} from "@/lib/gift-codes";
import {
  createDiscount,
  getDiscount,
  DuplicateCodeError,
} from "@/lib/discounts-db";
import { sendGiftCodeEmail, sendGiftMailTaskEmail } from "@/lib/email";

const ssm = new SSMClient({ region: "us-east-1" });
let cachedKey = "";

async function stripeKey(): Promise<string> {
  if (cachedKey) return cachedKey;
  const res = await ssm.send(
    new GetParameterCommand({ Name: STRIPE_SECRET_PARAM, WithDecryption: true }),
  );
  const key = res.Parameter?.Value ?? "";
  if (!key.startsWith(STRIPE_SECRET_PREFIX)) {
    throw new Error("Wrong Stripe key type in SSM");
  }
  cachedKey = key;
  return key;
}

export async function getStripe(): Promise<Stripe> {
  return new Stripe(await stripeKey(), { apiVersion: "2026-04-22.dahlia" });
}

export const GIFT_PRICE_CENTS = Math.round(GIFT_CODE_PRICE * 100);

export interface GiftPurchaseInput {
  buyerName: string;
  buyerEmail: string;
  recipientName: string;
  /** One-line US mailing address the printed gift note is mailed to. */
  recipientAddress: string;
  message?: string;
}

/** Trim/cap client input. Returns null when name or email is unusable. */
export function sanitizeGiftPurchase(raw: unknown): GiftPurchaseInput | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const str = (v: unknown, max: number) =>
    typeof v === "string" ? v.replace(/\r\n/g, "\n").trim().slice(0, max) : "";
  const buyerName = str(r.buyerName, GIFT_NAME_MAX);
  const buyerEmail = str(r.buyerEmail, 254);
  if (!buyerName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail)) return null;
  const recipientName = str(r.recipientName, GIFT_NAME_MAX);
  const address1 = str(r.address1, 100);
  const address2 = str(r.address2, 100);
  const city = str(r.city, 60);
  const state = str(r.state, 2).toUpperCase();
  const zip = str(r.zip, 10);
  if (!recipientName || !address1 || !city || !/^[A-Z]{2}$/.test(state) || !/^\d{5}(-\d{4})?$/.test(zip)) {
    return null;
  }
  const recipientAddress = [address1, address2, `${city}, ${state} ${zip}`].filter(Boolean).join(", ");
  const message = str(r.message, GIFT_MESSAGE_MAX);
  return {
    buyerName,
    buyerEmail,
    recipientName,
    recipientAddress,
    ...(message ? { message } : {}),
  };
}

/**
 * The code is derived from the PaymentIntent id with an HMAC keyed by the
 * Stripe secret, so (a) a retried fulfill call always lands on the same code
 * (idempotent, no double codes) and (b) nobody can guess a code from an id.
 * Alphabet skips 0/O/1/I.
 */
export function codeForPaymentIntent(piId: string, secret: string): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const digest = createHmac("sha256", secret).update(`gift:${piId}`).digest();
  let out = "";
  for (let i = 0; i < 8; i++) out += alphabet[digest[i] % alphabet.length];
  return `${GIFT_CODE_PREFIX}${out}`;
}

export interface GiftFulfillment {
  code: string;
  value: number;
  buyerEmail: string;
  recipientName?: string;
  recipientAddress?: string;
  emailed: boolean;
}

/**
 * Turn a paid gift PaymentIntent into its code. Safe to call repeatedly: the
 * first call creates the discount row and emails the buyer; later calls just
 * return the same code.
 */
export async function fulfillGiftPurchase(
  paymentIntentId: string,
): Promise<GiftFulfillment> {
  const stripe = await getStripe();
  const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
  const md = pi.metadata ?? {};
  if (md.kind !== "gift_code") throw new Error("Not a gift purchase");
  if (pi.status !== "succeeded") throw new Error("Payment not completed");
  if (pi.amount !== GIFT_PRICE_CENTS) throw new Error("Unexpected amount");

  const code = codeForPaymentIntent(pi.id, await stripeKey());
  const recipientName = md.recipientName || undefined;
  const recipientAddress = md.recipientAddress || undefined;
  const buyerEmail = md.buyerEmail ?? "";

  let created = false;
  if (!(await getDiscount(code))) {
    try {
      await createDiscount({
        code,
        type: "fixed",
        value: GIFT_CODE_VALUE,
        active: true,
        maxRedemptions: 1,
        description: `Gift purchase ${pi.id} by ${md.buyerName ?? ""} <${buyerEmail}>${recipientName ? ` for ${recipientName}` : ""}${recipientAddress ? ` | MAIL CARD TO: ${recipientAddress}` : ""}`,
      });
      created = true;
    } catch (err) {
      if (!(err instanceof DuplicateCodeError)) throw err;
    }
  }

  let emailed = false;
  if (created && buyerEmail) {
    try {
      await sendGiftCodeEmail({
        code,
        value: GIFT_CODE_VALUE,
        buyerName: md.buyerName ?? "",
        buyerEmail,
        recipientName,
        recipientAddress,
        message: md.message || undefined,
      });
      emailed = true;
    } catch (err) {
      console.error("Gift code email failed:", err);
    }
    try {
      await sendGiftMailTaskEmail({
        code,
        value: GIFT_CODE_VALUE,
        buyerName: md.buyerName ?? "",
        buyerEmail,
        recipientName,
        recipientAddress,
        message: md.message || undefined,
        paymentIntentId: pi.id,
      });
    } catch (err) {
      console.error("Gift mail-task email failed:", err);
    }
  }

  return { code, value: GIFT_CODE_VALUE, buyerEmail, recipientName, recipientAddress, emailed };
}
