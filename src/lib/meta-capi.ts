import crypto from "crypto";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import {
  META_PIXEL_ID,
  META_CAPI_TOKEN_PARAM,
  META_GRAPH_VERSION,
} from "./meta-config";
import { Order } from "@/types/order";

// NOTE: server-only. Do not import this from a client component — it reads SSM
// and the CAPI token. The base pixel + browser events live in meta-pixel.ts.

const ssm = new SSMClient({ region: "us-east-1" });

// Cache the token across warm Lambda invocations to avoid an SSM call per order.
let cachedToken: string | null = null;

async function getCapiToken(): Promise<string> {
  if (cachedToken !== null) return cachedToken;
  try {
    const res = await ssm.send(
      new GetParameterCommand({
        Name: META_CAPI_TOKEN_PARAM,
        WithDecryption: true,
      })
    );
    cachedToken = res.Parameter?.Value ?? "";
  } catch {
    // Parameter not created yet (inert deploy) or access issue — treat as unset.
    cachedToken = "";
  }
  return cachedToken;
}

// SHA-256 hex of a normalized value per Meta's Advanced Matching spec
// (trim + lowercase). Returns undefined for empties so the field is omitted.
function hash(value?: string): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

function compact(
  obj: Record<string, unknown>
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, v]) => v !== undefined && v !== null && v !== ""
    )
  );
}

export interface CapiContext {
  clientIp?: string;
  userAgent?: string;
  sourceUrl?: string;
}

/**
 * Send a server-side Purchase event to the Meta Conversions API.
 *
 * Deploys INERT: no-ops if META_PIXEL_ID is empty or the SSM token is unset.
 * event_id = order.orderId so it deduplicates against the browser Pixel
 * Purchase fired on the confirmation page. Never throws (the call site also
 * wraps it in .catch) — analytics must never fail an order.
 */
export async function sendPurchaseEvent(
  order: Order,
  ctx: CapiContext = {}
): Promise<void> {
  if (!META_PIXEL_ID) return;

  const token = await getCapiToken();
  if (!token) return;

  const c = order.customer;
  const userData = compact({
    em: hash(c.email),
    ph: hash(c.phone?.replace(/[^0-9]/g, "")),
    fn: hash(c.firstName),
    ln: hash(c.lastName),
    ct: hash(c.city),
    st: hash(c.state),
    zp: hash(c.zip),
    country: hash(c.country ?? "US"),
    client_ip_address: ctx.clientIp,
    client_user_agent: ctx.userAgent,
  });

  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: order.orderId,
        action_source: "website",
        ...(ctx.sourceUrl ? { event_source_url: ctx.sourceUrl } : {}),
        user_data: userData,
        custom_data: {
          currency: "usd",
          value: Number(order.pricing.total.toFixed(2)),
          num_items: order.items.reduce((n, i) => n + i.quantity, 0),
          order_id: order.orderId,
          content_type: "product",
          contents: order.items.map((i) => ({
            id: i.productId,
            quantity: i.quantity,
            item_price: i.price,
          })),
        },
      },
    ],
  };

  const url = `https://graph.facebook.com/${META_GRAPH_VERSION}/${META_PIXEL_ID}/events?access_token=${encodeURIComponent(
    token
  )}`;

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const detail = await resp.text().catch(() => "");
    console.error("Meta CAPI Purchase failed:", resp.status, detail);
  }
}
