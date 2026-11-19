// Site-wide sales — single source. The sale price is baked into the cart item
// price when a Buck is added to the cart, so checkout, tax, the PaymentIntent and
// the order record need no changes. To end early or add a sale, edit SALES and push.
//
// Overlaps: when two sales cover the same moment, the one listed LAST wins.

import { STRIPE_TEST_MODE } from "@/lib/stripe-mode";

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

export const SALES: Sale[] = [
  {
    name: "First Edition Sale",
    percent: 20,
    start: "2026-10-14T00:00:00-04:00",
    end: "2026-12-01T00:00:00-05:00",
    endsLabel: "Nov 30",
    lastDay: "2026-11-30",
  },
  {
    // Black Friday → Christmas. Wins over the First Edition Sale from Nov 27.
    // On the test branch it starts now so the 33% price can be checked before launch.
    name: "Holiday Sale",
    percent: 33,
    start: STRIPE_TEST_MODE ? "2026-11-19T00:00:00-05:00" : "2026-11-27T00:00:00-05:00",
    end: "2026-12-26T00:00:00-05:00",
    endsLabel: "Dec 25",
    lastDay: "2026-12-25",
  },
];

/** The sale running at `now` (last-listed wins on overlap), or null. */
export function activeSale(now: number = Date.now()): Sale | null {
  for (let i = SALES.length - 1; i >= 0; i--) {
    const s = SALES[i];
    if (now >= Date.parse(s.start) && now < Date.parse(s.end)) return s;
  }
  return null;
}

export function isSaleActive(now: number = Date.now()): boolean {
  return activeSale(now) !== null;
}

/** Sale price for a list price (rounded to cents), or the list price when no sale is on. */
export function salePrice(listPrice: number, now: number = Date.now()): number {
  const s = activeSale(now);
  if (!s) return listPrice;
  return Math.round(listPrice * (100 - s.percent)) / 100;
}
