import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { Order } from "@/types/order";

const ses = new SESClient({ region: "us-east-1" });
const FROM_ADDRESS = "orders@buckthatduck.com";

export async function sendOrderConfirmationEmail(order: Order): Promise<void> {
  const itemsList = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #2a2520; color: #FAFAF9; font-size: 14px;">${item.productName}</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #2a2520; text-align: center; color: #FAFAF9; font-size: 14px;">x${item.quantity}</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #2a2520; text-align: right; color: #FAFAF9; font-size: 14px;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#0C0A09;font-family:system-ui,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:40px;">
      <h1 style="color:#CA8A04;font-size:28px;font-weight:900;margin:0;">%uck<span style="color:#FAFAF9;">ThatDuck</span></h1>
    </div>
    <div style="background:#1C1917;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;margin-bottom:24px;">
      <p style="color:#CA8A04;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 12px;">Order Confirmed</p>
      <h2 style="color:#FAFAF9;font-size:24px;font-weight:800;margin:0 0 16px;">Thank you, ${order.customer.firstName}!</h2>
      <p style="color:#A8A29E;margin:0;line-height:1.6;">Your %uckThatDuck order has been placed and is being processed.</p>
    </div>
    <div style="background:#1C1917;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;margin-bottom:24px;">
      <h3 style="color:#FAFAF9;font-size:16px;font-weight:700;margin:0 0 20px;">Order Details</h3>
      <p style="color:#A8A29E;font-size:14px;margin:0 0 4px;">Order ID</p>
      <p style="color:#FAFAF9;font-size:14px;font-family:monospace;margin:0 0 16px;">${order.orderId}</p>
      <p style="color:#A8A29E;font-size:14px;margin:0 0 4px;">Placed</p>
      <p style="color:#FAFAF9;font-size:14px;margin:0 0 16px;">${new Date(order.createdAt).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" })}</p>
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
      <div style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="color:#CA8A04;font-size:14px;"><svg width="22" height="18" viewBox="0 0 200 165" xmlns="http://www.w3.org/2000/svg" style="display:inline;vertical-align:middle;margin-right:6px">
  <path d="M18 138 C8 110,12 80,32 62 C48 48,72 38,96 38 C122 38,150 48,164 68 C178 90,176 125,164 142 C144 165,52 168,18 138Z" fill="#F5C800"/>
  <path d="M20 118 C2 106,-4 88,6 74 C12 66,22 70,18 80 C14 90,18 102,28 108" fill="#F5C800" stroke="#D4A800" stroke-width="1"/>
  <ellipse cx="118" cy="44" rx="18" ry="20" fill="#F5C800"/>
  <circle cx="126" cy="26" r="26" fill="#F5C800"/>
  <path d="M146 22 Q178 14 176 26 Q178 34 146 32Z" fill="#E86000"/>
  <path d="M146 32 Q178 34 174 44 Q170 50 146 40Z" fill="#C84800"/>
  <circle cx="140" cy="18" r="6" fill="#111"/>
  <circle cx="142" cy="15" r="2" fill="white"/>
</svg>Free rubber duck</span>
          <span style="color:#CA8A04;font-size:14px;font-weight:700;">FREE</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="color:#A8A29E;font-size:14px;">Subtotal</span>
          <span style="color:#FAFAF9;font-size:14px;">$${order.pricing.subtotal.toFixed(2)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="color:#A8A29E;font-size:14px;">Shipping</span>
          <span style="color:#FAFAF9;font-size:14px;">${order.pricing.shipping === 0 ? "Free" : "$" + order.pricing.shipping.toFixed(2)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.08);">
          <span style="color:#FAFAF9;font-size:16px;font-weight:700;">Total</span>
          <span style="color:#CA8A04;font-size:16px;font-weight:700;">$${order.pricing.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
    <div style="background:#1C1917;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;margin-bottom:24px;">
      <h3 style="color:#FAFAF9;font-size:16px;font-weight:700;margin:0 0 16px;">Shipping To</h3>
      <p style="color:#A8A29E;font-size:14px;line-height:1.8;margin:0;">
        ${order.customer.firstName} ${order.customer.lastName}<br>
        ${order.customer.address1}${order.customer.address2 ? "<br>" + order.customer.address2 : ""}<br>
        ${order.customer.city}, ${order.customer.state} ${order.customer.zip}
      </p>
    </div>
    <div style="text-align:center;padding-top:24px;">
      <p style="color:#78716C;font-size:13px;margin:0 0 8px;">Questions? Reply to this email or visit</p>
      <a href="https://www.buckthatduck.com" style="color:#CA8A04;font-size:13px;">www.buckthatduck.com</a>
    </div>
  </div>
</body>
</html>`;

  await ses.send(
    new SendEmailCommand({
      Source: FROM_ADDRESS,
      Destination: { ToAddresses: [order.customer.email] },
      Message: {
        Subject: {
          Data: `Order Confirmed - %uckThatDuck #${order.orderId.slice(0, 8).toUpperCase()}`,
          Charset: "UTF-8",
        },
        Body: {
          Html: { Data: html, Charset: "UTF-8" },
          Text: {
            Data: `Order Confirmed\n\nThank you ${order.customer.firstName}!\n\nOrder ID: ${order.orderId}\nTotal: $${order.pricing.total.toFixed(2)}\n\nwww.buckthatduck.com`,
            Charset: "UTF-8",
          },
        },
      },
    })
  );
}
