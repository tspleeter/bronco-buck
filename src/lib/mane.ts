import type { ManeContext } from "@/lib/assets";

// Mane style option (G2) -> asset filename token.
// V5 Punk has no renders yet (stays "reg"). V28 Long is LIVE, but only for the
// colors listed in LONG_SUPPORTED_G1 (complete render sets); others fall back to "reg".
const MANE_STYLE_MAP: Record<string, string> = { V4: "reg", V5: "reg", V28: "long" };
const MANE_COLOR_MAP: Record<string, string> = { V6: "black", V7: "white" };

// G1 body-color option ids that have a COMPLETE Long-mane render set
// (all 4 views × both mane colors): Ruby Red (V1), Oxford White (V16), Desert Sand (V20).
export const LONG_SUPPORTED_G1 = new Set<string>(["V1", "V16", "V20"]);

/**
 * Derive the mane context from a build's selected options.
 * Falls back to regular/black (the defaults) when selections are missing,
 * because body renders only exist with a mane baked in.
 *
 * Long-mane renders exist for only a subset of body colors, so if "Long" is
 * selected for an unsupported color we fall back to "reg" to avoid 404s in any
 * surface that renders a build (builder, cart, saved, share).
 */
export function getManeContext(
  selectedOptions: Record<string, string | string[]> | undefined,
): ManeContext {
  const styleId = selectedOptions?.["G2"];
  const colorId = selectedOptions?.["G3"];
  const bodyId = selectedOptions?.["G1"];

  let style =
    (typeof styleId === "string" ? MANE_STYLE_MAP[styleId] : undefined) ?? "reg";

  if (
    style === "long" &&
    !(typeof bodyId === "string" && LONG_SUPPORTED_G1.has(bodyId))
  ) {
    style = "reg";
  }

  const color =
    (typeof colorId === "string" ? MANE_COLOR_MAP[colorId] : undefined) ??
    "black";

  return { style, color };
}
