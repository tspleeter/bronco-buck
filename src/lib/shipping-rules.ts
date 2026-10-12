// Single source for shipping pricing (checkout client + /api/calculate-tax).
// Matches the Etsy shop: flat rate for one Buck, free for 2+ items.
export const FLAT_SHIPPING = 8.95;
export const FREE_SHIPPING_MIN_ITEMS = 2;

export function shippingFor(itemCount: number): number {
  if (itemCount <= 0) return 0;
  return itemCount >= FREE_SHIPPING_MIN_ITEMS ? 0 : FLAT_SHIPPING;
}
