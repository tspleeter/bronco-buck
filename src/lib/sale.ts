// Site-wide sale — single source (Oct 2026: matches the Etsy FIRSTEDITION20 sale).
// The sale price is baked into the cart item price when a Buck is added to the
// cart, so checkout, tax, the PaymentIntent and the order record need no changes.
// To end early or run another sale, edit SALE (or set it to null) and push.

export interface Sale {
  name: string;
  percent: number;
  /** ISO start (inclusive) and end (exclusive), Eastern time. */
  start: string;
  end: string;
  /** Short human end date for banners, e.g. "Nov 13". */
  endsLabel: string;
  /** Last day of the sale (YYYY-MM-DD), for structured data priceValidUntil. */
  lastDay: string;
}

export const SALE: Sale | null = {
  name: "First Edition Sale",
  percent: 20,
  start: "2026-10-14T00:00:00-04:00",
  end: "2026-11-14T00:00:00-05:00",
  endsLabel: "Nov 13",
  lastDay: "2026-11-13",
};

export function isSaleActive(now: number = Date.now()): boolean {
  if (!SALE) return false;
  return now >= Date.parse(SALE.start) && now < Date.parse(SALE.end);
}

/** Sale price for a list price (rounded to cents), or the list price when no sale is on. */
export function salePrice(listPrice: number, now: number = Date.now()): number {
  if (!SALE || !isSaleActive(now)) return listPrice;
  return Math.round(listPrice * (100 - SALE.percent)) / 100;
}
