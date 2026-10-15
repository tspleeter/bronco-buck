// Single source for SEO constants + structured data (JSON-LD).
// Used by layout.tsx (Organization/WebSite), build/[productSlug]/layout.tsx
// (Product), and the /gifts-for-bronco-owners landing page.
import config from "@/data/bronco-config.json";
import { FLAT_SHIPPING } from "@/lib/shipping-rules";
import { SALE, isSaleActive, salePrice } from "@/lib/sale";

// Canonical host is www — the bare domain redirects there. Sitemap, robots,
// canonicals and JSON-LD all derive from this.
export const SITE_URL = "https://www.buckthatduck.com";
export const SITE_NAME = "BuckThatDuck";
export const PRODUCT_PATH = `/build/${config.slug}`;
export const INSTAGRAM_URL = "https://www.instagram.com/buckthatduck/";
export const ETSY_SHOP_URL = "https://buckthatduck.etsy.com";
export const ETSY_LISTING_URL = "https://www.etsy.com/listing/4592549568";

export const FORD_DISCLAIMER =
  "Not affiliated with, sponsored, or endorsed by Ford Motor Company. Bronco® is a trademark of Ford Motor Company.";

export const OG_IMAGE = "/assets/product/og-bronco-buck.jpg";

// Real product photo first, then the 11 front renders with the nameplate.
export const PRODUCT_COLORS = [
  { id: "V1", name: "Ruby Red", slug: "ruby_red" },
  { id: "V2", name: "Velocity Blue", slug: "velocity_blue" },
  { id: "V3", name: "Shadow Black", slug: "shadow_black" },
  { id: "V15", name: "Eruption Green", slug: "eruption_green" },
  { id: "V16", name: "Oxford White", slug: "oxford_white" },
  { id: "V17", name: "Cyber Orange", slug: "cyber_orange" },
  { id: "V18", name: "Carbonized Gray", slug: "carbonized_gray" },
  { id: "V19", name: "Cactus Gray", slug: "cactus_gray" },
  { id: "V20", name: "Desert Sand", slug: "desert_sand" },
  { id: "V21", name: "Azure Gray", slug: "azure_gray" },
  { id: "V23", name: "Robin's Egg Blue", slug: "robins_egg_blue" },
] as const;

export const productImage = (slug: string) => `/assets/product/${slug}.webp`;

const abs = (path: string) => `${SITE_URL}${path}`;

export const PRODUCT_DESCRIPTION =
  "A 3D-printed horse bust collectible for Bronco owners, printed in your choice of 11 Bronco-inspired colors with a regular or long mane in black or white and a custom nameplate. The first 100 are numbered with a certificate of authenticity. Made to order in the USA. A free rubber duck comes with every order.";

export function productJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: config.name,
    sku: config.productId,
    description: PRODUCT_DESCRIPTION,
    brand: { "@type": "Brand", name: SITE_NAME },
    image: [
      abs("/assets/product/bronco-buck-classic.jpg"),
      ...PRODUCT_COLORS.map((c) => abs(productImage(c.slug))),
    ],
    url: abs(PRODUCT_PATH),
    offers: {
      "@type": "Offer",
      url: abs(PRODUCT_PATH),
      price: salePrice(config.basePrice).toFixed(2),
      ...(SALE && isSaleActive() ? { priceValidUntil: SALE.lastDay } : {}),
      priceCurrency: config.currency,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: SITE_NAME },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: FLAT_SHIPPING.toFixed(2), currency: "USD" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "US" },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 3, maxValue: 5, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 2, maxValue: 5, unitCode: "DAY" },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "US",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 30,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/ReturnShippingFees",
      },
    },
  };
}

export function siteJsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      legalName: "Pleeter LLC",
      url: SITE_URL,
      logo: abs("/assets/product/bronco-buck-classic.jpg"),
      email: "orders@buckthatduck.com",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Hawthorne",
        addressRegion: "NJ",
        postalCode: "07506",
        addressCountry: "US",
      },
      sameAs: [INSTAGRAM_URL, ETSY_SHOP_URL],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
  ];
}

// Renders a JSON-LD <script>. `<` is escaped so content can't break out of the tag.
export function jsonLdHtml(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
