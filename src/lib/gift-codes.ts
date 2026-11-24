/**
 * Buyable gift codes ("Gift a Buck", Nov 2026). Client-safe constants only —
 * server logic lives in gift-codes-server.ts.
 *
 * The buyer pays GIFT_CODE_PRICE and receives a single-use fixed discount code
 * worth GIFT_CODE_VALUE, emailed to them to pass on. The code is an ordinary
 * BroncoBuckDiscounts row with `freeBuck` + `coversShipping`: it pays for one
 * plain Buck at whatever the current price is, plus shipping. Upgrades are
 * paid by the recipient at checkout. Buyer always pays GIFT_CODE_PRICE.
 */
export const GIFT_CODE_PRICE = 28;
export const GIFT_CODE_VALUE = 28;
export const GIFT_CODE_PREFIX = "BUCKGIFT";
export const GIFT_NAME_MAX = 60;
