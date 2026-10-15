// Google Merchant Center product feed (RSS 2.0 + g: namespace).
// Merchant Center → Products → "Add products from a file" → "Enter a link to your file":
//   https://www.buckthatduck.com/google-merchant-feed.xml  (fetched every 24h)
// One item per body color, grouped as variants of BB001. Price, sale price and
// shipping derive from the same sources as checkout, so the feed never drifts.
import config from "@/data/bronco-config.json";
import { SITE_URL, PRODUCT_PATH, PRODUCT_COLORS, PRODUCT_DESCRIPTION, SITE_NAME, productImage } from "@/lib/seo";
import { FLAT_SHIPPING } from "@/lib/shipping-rules";
import { SALE, isSaleActive, salePrice } from "@/lib/sale";

// Rendered per request so the sale price switches on/off by date without a deploy.
export const dynamic = "force-dynamic";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const money = (n: number) => `${n.toFixed(2)} ${config.currency}`;

export function GET() {
  const list = config.basePrice;
  const onSale = !!SALE && isSaleActive();
  const items = PRODUCT_COLORS.map((c) => {
    const fields: [string, string][] = [
      ["g:id", `${config.productId}-${c.id}`],
      ["g:item_group_id", config.productId],
      ["g:title", `${config.name} Horse Bust Figurine – ${c.name}, Custom Nameplate`],
      ["g:description", PRODUCT_DESCRIPTION],
      ["g:link", `${SITE_URL}${PRODUCT_PATH}?color=${c.id}`],
      ["g:image_link", `${SITE_URL}${productImage(c.slug)}`],
      ["g:availability", "in_stock"],
      ["g:condition", "new"],
      ["g:price", money(list)],
      ["g:brand", SITE_NAME],
      ["g:identifier_exists", "no"],
      ["g:color", c.name],
      ["g:google_product_category", "Home & Garden > Decor > Figurines"],
      ["g:product_type", "Figurines > Horse Busts"],
      ["g:is_bundle", "no"],
    ];
    if (onSale && SALE) {
      fields.push(["g:sale_price", money(salePrice(list))]);
      fields.push(["g:sale_price_effective_date", `${SALE.start}/${SALE.end}`]);
    }
    const body = fields.map(([k, v]) => `      <${k}>${esc(v)}</${k}>`).join("\n");
    const shipping = `      <g:shipping>\n        <g:country>US</g:country>\n        <g:service>Standard</g:service>\n        <g:price>${money(FLAT_SHIPPING)}</g:price>\n      </g:shipping>`;
    return `    <item>\n${body}\n${shipping}\n    </item>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${esc(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${esc(SITE_NAME)} product feed</description>
${items}
  </channel>
</rss>
`;
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
