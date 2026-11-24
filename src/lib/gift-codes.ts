/**
 * Buyable gift codes ("Gift a Buck", Nov 2026). Client-safe constants only —
 * server logic lives in gift-codes-server.ts.
 *
 * The buyer pays GIFT_CODE_PRICE and receives a single-use fixed discount code
 * worth GIFT_CODE_VALUE, emailed to them to pass on. The code is an ordinary
 * BroncoBuckDiscounts row, so it redeems through the existing checkout code box
 * and shows up on /discounts. Shipping is charged as normal at redemption.
 */
export const GIFT_CODE_PRICE = 20.9;
export const GIFT_CODE_VALUE = 20.9;
export const GIFT_CODE_PREFIX = "BUCKGIFT";
export const GIFT_NAME_MAX = 60;
