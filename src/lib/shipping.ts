import { Carrier } from "@/types/order";

export const CARRIER_LABELS: Record<Carrier, string> = {
  usps: "USPS",
  ups: "UPS",
  fedex: "FedEx",
  dhl: "DHL",
  other: "Other",
};

export const CARRIERS: Carrier[] = ["usps", "ups", "fedex", "dhl", "other"];

/**
 * Build a public tracking URL for a carrier + tracking number.
 * Returns undefined when the carrier is unknown/"other" or no number is given —
 * callers should fall back to showing the bare tracking number.
 */
export function buildTrackingUrl(
  carrier: Carrier | undefined,
  trackingNumber: string | undefined,
): string | undefined {
  if (!carrier || !trackingNumber) return undefined;
  const n = encodeURIComponent(trackingNumber.trim());
  if (!n) return undefined;

  switch (carrier) {
    case "usps":
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${n}`;
    case "ups":
      return `https://www.ups.com/track?tracknum=${n}`;
    case "fedex":
      return `https://www.fedex.com/fedextrack/?trknbr=${n}`;
    case "dhl":
      return `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${n}`;
    default:
      return undefined;
  }
}
