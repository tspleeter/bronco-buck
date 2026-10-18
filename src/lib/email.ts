import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { Order, OrderItem } from "@/types/order";
import { shipToName } from "@/lib/gift";
import { getGroupName, getOptionName } from "@/lib/product-display";
import { isHiddenSelection } from "@/lib/summary";
import broncoConfigJson from "@/data/bronco-config.json";
import type { ProductConfig } from "@/types/product";

const broncoConfig = broncoConfigJson as ProductConfig;
import { CARRIER_LABELS, buildTrackingUrl } from "@/lib/shipping";

const ses = new SESClient({ region: "us-east-1" });
const FROM_ADDRESS = "orders@buckthatduck.com";

function renderItemRows(order: Order): string {
  return order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #2a2520; color: #FAFAF9; font-size: 14px;">${item.productName}</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #2a2520; text-align: center; color: #FAFAF9; font-size: 14px;">x${item.quantity}</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #2a2520; text-align: right; color: #FAFAF9; font-size: 14px;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`
    )
    .join("");
}

function esc(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shippingAddressBlock(order: Order): string {
  return `<p style="color:#A8A29E;font-size:14px;line-height:1.8;margin:0;">
        ${esc(shipToName(order))}<br>
        ${esc(order.customer.address1)}${order.customer.address2 ? "<br>" + esc(order.customer.address2) : ""}<br>
        ${esc(order.customer.city)}, ${esc(order.customer.state)} ${esc(order.customer.zip)}
      </p>`;
}

/** Customer-facing invoice number. Same short id the emails always used. */
export function invoiceNumber(order: Order): string {
  return `BTD-${order.orderId.slice(0, 8).toUpperCase()}`;
}

const SELLER_LINES = [
  "Pleeter LLC (BuckThatDuck)",
  "8 Nelke Ct",
  "Hawthorne, NJ 07506",
  "orders@buckthatduck.com",
];

function itemDetailLines(item: OrderItem): string[] {
  const lines: string[] = [];
  for (const [groupId, value] of Object.entries(item.selectedOptions ?? {})) {
    if (isHiddenSelection(broncoConfig, groupId, value)) continue;
    const name = Array.isArray(value)
      ? value.map((v) => getOptionName(v, groupId)).join(", ")
      : getOptionName(value, groupId);
    if (name) lines.push(`${getGroupName(groupId)}: ${name}`);
  }
  const plate = item.customFields?.nameplateText;
  if (typeof plate === "string" && plate.trim()) lines.push(`Nameplate Text: ${plate}`);
  return lines;
}

function invoiceItemRows(order: Order): string {
  return order.items
    .map((item) => {
      const details = itemDetailLines(item)
        .map((l) => `<div style="color:#78716C;font-size:12px;line-height:1.5;">${esc(l)}</div>`)
        .join("");
      return `<tr>
          <td style="padding:10px 0;border-bottom:1px solid #2a2520;color:#FAFAF9;font-size:14px;vertical-align:top;">${esc(item.productName)}${details}</td>
          <td style="padding:10px 0;border-bottom:1px solid #2a2520;text-align:center;color:#FAFAF9;font-size:14px;vertical-align:top;">${item.quantity}</td>
          <td style="padding:10px 0;border-bottom:1px solid #2a2520;text-align:right;color:#FAFAF9;font-size:14px;vertical-align:top;">$${item.price.toFixed(2)}</td>
          <td style="padding:10px 0;border-bottom:1px solid #2a2520;text-align:right;color:#FAFAF9;font-size:14px;vertical-align:top;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`;
    })
    .join("");
}

function totalRow(label: string, value: string, opts: { strong?: boolean; gold?: boolean } = {}): string {
  const size = opts.strong ? 16 : 14;
  const weight = opts.strong ? 700 : 400;
  const border = opts.strong ? "border-top:1px solid rgba(255,255,255,0.08);" : "";
  const pad = opts.strong ? "padding-top:12px;" : "padding:4px 0;";
  return `<tr>
          <td style="${pad}${border}color:${opts.strong ? "#FAFAF9" : "#A8A29E"};font-size:${size}px;font-weight:${weight};">${label}</td>
          <td style="${pad}${border}text-align:right;color:${opts.gold || opts.strong ? "#CA8A04" : "#FAFAF9"};font-size:${size}px;font-weight:${weight};">${value}</td>
        </tr>`;
}

const CARD = "background:#1C1917;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;margin-bottom:24px;";
const LABEL = "color:#CA8A04;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 10px;";

/**
 * Order confirmation = the customer's INVOICE (Oct 2026). This email is the
 * only place prices appear: there's no packing slip or receipt in the box,
 * which is what lets an order ship as a gift.
 */
export async function sendOrderConfirmationEmail(order: Order): Promise<void> {
  const inv = invoiceNumber(order);
  const issued = new Date(order.createdAt).toLocaleDateString("en-US", { dateStyle: "long" });
  const p = order.pricing;
  const gift = order.gift;
  const c = order.customer;

  const giftCard = gift
    ? `<div style="${CARD}border-color:rgba(202,138,4,0.45);">
      <p style="${LABEL}">🎁 Gift order</p>
      <p style="color:#FAFAF9;font-size:15px;margin:0 0 12px;">Shipping to <strong>${esc(shipToName(order))}</strong>. No prices or receipt are included in the box.</p>
      ${
        gift.message
          ? `<p style="color:#A8A29E;font-size:13px;margin:0 0 6px;">Your note (printed on a card in the box):</p>
      <p style="color:#FAFAF9;font-size:15px;line-height:1.6;font-style:italic;white-space:pre-line;margin:0;padding:12px 16px;border-left:3px solid #CA8A04;background:#0C0A09;border-radius:6px;">${esc(gift.message)}</p>`
          : `<p style="color:#A8A29E;font-size:13px;margin:0;">No gift message. Reply to this email if you'd like to add one before it ships.</p>`
      }
    </div>`
    : "";

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#0C0A09;font-family:system-ui,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:40px;">
      <h1 style="color:#CA8A04;font-size:28px;font-weight:900;margin:0;">%uck<span style="color:#FAFAF9;">ThatDuck</span></h1>
      <p style="color:#78716C;font-size:13px;font-weight:600;letter-spacing:0.06em;margin:8px 0 0;">Broncos don't duck, they buck.</p>
    </div>
    <div style="${CARD}">
      <p style="${LABEL}">Order confirmed</p>
      <h2 style="color:#FAFAF9;font-size:24px;font-weight:800;margin:0 0 16px;">Thank you, ${esc(c.firstName)}!</h2>
      <p style="color:#A8A29E;margin:0;line-height:1.6;">Your order is paid and in the print queue. Your invoice is below. Keep this email for your records.</p>
    </div>
    ${giftCard}
    <div style="${CARD}">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="vertical-align:top;">
            <p style="color:#FAFAF9;font-size:22px;font-weight:800;margin:0 0 4px;">Invoice</p>
            <p style="color:#FAFAF9;font-size:14px;font-family:monospace;margin:0;">${inv}</p>
          </td>
          <td style="vertical-align:top;text-align:right;">
            <span style="display:inline-block;background:#14532D;color:#86EFAC;font-size:12px;font-weight:700;letter-spacing:0.1em;padding:4px 10px;border-radius:6px;">PAID</span>
            <p style="color:#A8A29E;font-size:13px;margin:8px 0 0;">Issued ${issued}</p>
          </td>
        </tr>
      </table>
      <table style="width:100%;border-collapse:collapse;margin-top:24px;">
        <tr>
          <td style="vertical-align:top;width:50%;padding-right:12px;">
            <p style="color:#78716C;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 6px;">From</p>
            <p style="color:#A8A29E;font-size:13px;line-height:1.6;margin:0;">${SELLER_LINES.map(esc).join("<br>")}</p>
          </td>
          <td style="vertical-align:top;width:50%;">
            <p style="color:#78716C;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 6px;">Bill to</p>
            <p style="color:#A8A29E;font-size:13px;line-height:1.6;margin:0;">${esc(`${c.firstName} ${c.lastName}`)}<br>${esc(c.email)}${c.phone ? "<br>" + esc(c.phone) : ""}</p>
          </td>
        </tr>
      </table>
      <table style="width:100%;border-collapse:collapse;margin-top:24px;">
        <thead>
          <tr>
            <th style="color:#A8A29E;font-size:12px;font-weight:600;text-align:left;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.08);">Item</th>
            <th style="color:#A8A29E;font-size:12px;font-weight:600;text-align:center;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.08);">Qty</th>
            <th style="color:#A8A29E;font-size:12px;font-weight:600;text-align:right;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.08);">Unit</th>
            <th style="color:#A8A29E;font-size:12px;font-weight:600;text-align:right;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.08);">Amount</th>
          </tr>
        </thead>
        <tbody>${invoiceItemRows(order)}</tbody>
      </table>
      <table style="width:100%;border-collapse:collapse;margin-top:12px;">
        ${totalRow("🦆 Free rubber duck", "FREE", { gold: true })}
        ${totalRow("Subtotal", `$${p.subtotal.toFixed(2)}`)}
        ${p.discount && p.discount > 0 ? totalRow(`Discount${p.discountCode ? ` (${esc(p.discountCode)})` : ""}`, `&minus;$${p.discount.toFixed(2)}`, { gold: true }) : ""}
        ${totalRow("Shipping", p.shipping === 0 ? "Free" : `$${p.shipping.toFixed(2)}`)}
        ${p.tax && p.tax > 0 ? totalRow("Sales tax", `$${p.tax.toFixed(2)}`) : ""}
        ${totalRow("Total paid", `$${p.total.toFixed(2)}`, { strong: true })}
      </table>
      <p style="color:#78716C;font-size:12px;margin:16px 0 0;">Paid by card on ${issued}. Order ID ${order.orderId}</p>
    </div>
    <div style="${CARD}">
      <h3 style="color:#FAFAF9;font-size:16px;font-weight:700;margin:0 0 16px;">Shipping To</h3>
      ${shippingAddressBlock(order)}
    </div>
    <div style="text-align:center;padding-top:24px;">
      <p style="color:#78716C;font-size:13px;margin:0 0 8px;">Questions? Reply to this email or visit</p>
      <a href="https://www.buckthatduck.com" style="color:#CA8A04;font-size:13px;">www.buckthatduck.com</a>
    </div>
  </div>
</body>
</html>`;

  const text: string[] = [
    `Order confirmed. Thank you, ${c.firstName}!`,
    "",
    `INVOICE ${inv} (PAID)`,
    `Issued: ${issued}`,
    "",
    `From: ${SELLER_LINES.join(", ")}`,
    `Bill to: ${c.firstName} ${c.lastName}, ${c.email}`,
    `Ship to: ${shipToName(order)}, ${c.address1}${c.address2 ? ", " + c.address2 : ""}, ${c.city}, ${c.state} ${c.zip}`,
    "",
  ];
  for (const item of order.items) {
    text.push(`${item.productName} x${item.quantity} @ $${item.price.toFixed(2)} = $${(item.price * item.quantity).toFixed(2)}`);
    for (const l of itemDetailLines(item)) text.push(`  ${l}`);
  }
  text.push("", "Free rubber duck: FREE", `Subtotal: $${p.subtotal.toFixed(2)}`);
  if (p.discount && p.discount > 0) text.push(`Discount${p.discountCode ? ` (${p.discountCode})` : ""}: -$${p.discount.toFixed(2)}`);
  text.push(`Shipping: ${p.shipping === 0 ? "Free" : "$" + p.shipping.toFixed(2)}`);
  if (p.tax && p.tax > 0) text.push(`Sales tax: $${p.tax.toFixed(2)}`);
  text.push(`Total paid: $${p.total.toFixed(2)}`);
  if (gift) {
    text.push("", `GIFT ORDER: shipping to ${shipToName(order)}. No prices or receipt in the box.`);
    if (gift.message) text.push(`Your note (printed on a card in the box): ${gift.message}`);
  }
  text.push("", `Order ID: ${order.orderId}`, "www.buckthatduck.com");

  await ses.send(
    new SendEmailCommand({
      Source: FROM_ADDRESS,
      Destination: { ToAddresses: [c.email] },
      Message: {
        Subject: {
          Data: `Order Confirmed + Invoice ${inv} - %uckThatDuck`,
          Charset: "UTF-8",
        },
        Body: {
          Html: { Data: html, Charset: "UTF-8" },
          Text: { Data: text.join("\n"), Charset: "UTF-8" },
        },
      },
    })
  );
}

export async function sendShipmentEmail(order: Order): Promise<void> {
  const itemsList = renderItemRows(order);
  const carrierLabel = order.carrier ? CARRIER_LABELS[order.carrier] : undefined;
  // Self-heal: rebuild the tracking URL from carrier + number when it wasn't
  // persisted on the order (legacy orders, or saved with a valid carrier but
  // no stored URL). Guarantees a "Track your package" link whenever we can
  // form one, for both the auto shipment email and the manual resend.
  const trackingUrl =
    order.trackingUrl ?? buildTrackingUrl(order.carrier, order.trackingNumber);
  const shippedDate = order.shippedAt
    ? new Date(order.shippedAt).toLocaleString("en-US", { dateStyle: "long" })
    : new Date().toLocaleString("en-US", { dateStyle: "long" });

  // Tracking card — only rendered when we have a tracking number
  const trackingCard = order.trackingNumber
    ? `<div style="background:#1C1917;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;margin-bottom:24px;">
      <h3 style="color:#FAFAF9;font-size:16px;font-weight:700;margin:0 0 16px;">Tracking</h3>
      ${carrierLabel ? `<p style="color:#A8A29E;font-size:14px;margin:0 0 4px;">Carrier</p>
      <p style="color:#FAFAF9;font-size:14px;margin:0 0 16px;">${carrierLabel}</p>` : ""}
      <p style="color:#A8A29E;font-size:14px;margin:0 0 4px;">Tracking number</p>
      <p style="color:#FAFAF9;font-size:14px;font-family:monospace;margin:0 0 20px;">${order.trackingNumber}</p>
      ${
        trackingUrl
          ? `<a href="${trackingUrl}" style="display:inline-block;background:#CA8A04;color:#0C0A09;font-size:14px;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:10px;">Track your package →</a>`
          : ""
      }
    </div>`
    : "";

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#0C0A09;font-family:system-ui,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:40px;">
      <h1 style="color:#CA8A04;font-size:28px;font-weight:900;margin:0;">%uck<span style="color:#FAFAF9;">ThatDuck</span></h1>
      <p style="color:#78716C;font-size:13px;font-weight:600;letter-spacing:0.06em;margin:8px 0 0;">Broncos don't duck, they buck.</p>
    </div>
    <div style="background:#1C1917;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;margin-bottom:24px;">
      <p style="color:#CA8A04;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 12px;">Your order is on its way</p>
      <h2 style="color:#FAFAF9;font-size:24px;font-weight:800;margin:0 0 16px;">It shipped, ${esc(order.customer.firstName)}! 🦆</h2>
      <p style="color:#A8A29E;margin:0;line-height:1.6;">${
        order.gift
          ? `Your gift for ${esc(shipToName(order))} shipped on ${shippedDate}. No prices or receipt are in the box.`
          : `Your %uckThatDuck order shipped on ${shippedDate} and is headed your way.`
      }</p>
    </div>
    ${trackingCard}
    <div style="background:#1C1917;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;margin-bottom:24px;">
      <h3 style="color:#FAFAF9;font-size:16px;font-weight:700;margin:0 0 20px;">In this shipment</h3>
      <p style="color:#A8A29E;font-size:14px;margin:0 0 4px;">Order ID</p>
      <p style="color:#FAFAF9;font-size:14px;font-family:monospace;margin:0 0 16px;">${order.orderId}</p>
      <table style="width:100%;border-collapse:collapse;margin-top:8px;">
        <thead>
          <tr>
            <th style="color:#A8A29E;font-size:12px;font-weight:600;text-align:left;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.08);">Item</th>
            <th style="color:#A8A29E;font-size:12px;font-weight:600;text-align:center;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.08);">Qty</th>
            <th style="color:#A8A29E;font-size:12px;font-weight:600;text-align:right;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.08);">Price</th>
          </tr>
        </thead>
        <tbody>${itemsList}</tbody>
      </table>
    </div>
    <div style="background:#1C1917;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;margin-bottom:24px;">
      <h3 style="color:#FAFAF9;font-size:16px;font-weight:700;margin:0 0 16px;">Shipping To</h3>
      ${shippingAddressBlock(order)}
    </div>
    <div style="text-align:center;padding-top:24px;">
      <p style="color:#78716C;font-size:13px;margin:0 0 8px;">Questions? Reply to this email or visit</p>
      <a href="https://www.buckthatduck.com" style="color:#CA8A04;font-size:13px;">www.buckthatduck.com</a>
    </div>
  </div>
</body>
</html>`;

  const textLines = [
    "Your order shipped!",
    "",
    order.gift
      ? `Hi ${order.customer.firstName}, your gift for ${shipToName(order)} is on its way. No prices or receipt are in the box.`
      : `Hi ${order.customer.firstName}, your %uckThatDuck order is on its way.`,
    "",
    `Order ID: ${order.orderId}`,
  ];
  if (carrierLabel) textLines.push(`Carrier: ${carrierLabel}`);
  if (order.trackingNumber) textLines.push(`Tracking: ${order.trackingNumber}`);
  if (trackingUrl) textLines.push(`Track: ${trackingUrl}`);
  textLines.push("", "www.buckthatduck.com");

  await ses.send(
    new SendEmailCommand({
      Source: FROM_ADDRESS,
      Destination: { ToAddresses: [order.customer.email] },
      Message: {
        Subject: {
          Data: `Your %uckThatDuck order has shipped - #${order.orderId.slice(0, 8).toUpperCase()}`,
          Charset: "UTF-8",
        },
        Body: {
          Html: { Data: html, Charset: "UTF-8" },
          Text: { Data: textLines.join("\n"), Charset: "UTF-8" },
        },
      },
    })
  );
}
