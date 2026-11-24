/**
 * Buyable gift codes ("Gift a Buck", Nov 2026). Client-safe constants only —
 * server logic lives in gift-codes-server.ts.
 *
 * The buyer pays GIFT_CODE_PRICE and receives a single-use fixed discount code
 * worth GIFT_CODE_VALUE, emailed to them to pass on. The code is an ordinary
 * BroncoBuckDiscounts row with `coversShipping: true`, so it pays for the Buck
 * AND shipping (~$21 + ~$7). Anything above $28 (upgrades, full price after a
 * sale) is paid by the recipient at checkout.
 */
export const GIFT_CODE_PRICE = 28;
export const GIFT_CODE_VALUE = 28;
export const GIFT_CODE_PREFIX = "BUCKGIFT";
export const GIFT_NAME_MAX = 60;
