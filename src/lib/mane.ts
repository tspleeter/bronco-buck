import type { ManeContext } from "@/lib/assets";

// Mane style option (G2) -> asset filename token.
// V5 Punk has no renders yet (stays "reg"). V28 Long is LIVE for ALL 11 body
// colors (complete render sets); LONG_SUPPORTED_G1 now covers every G1 id.
const MANE_STYLE_MAP: Record<string, string> = { V4: "reg", V5: "reg", V28: "long" };
const MANE_COLOR_MAP: Record<string, string> = { V6: "black", V7: "white" };

// G1 body-color option ids that have a COMPLETE Long-mane render set
// (all 4 views × both mane colors). Now ALL 11 colors: Ruby Red (V1),
// Velocity Blue (V2), Shadow Black (V3), Eruption Green (V15), Oxford White (V16),
// Cyber Orange (V17), Carbonized Gray (V18), Cactus Gray (V19), Desert Sand (V20),
// Azure Gray (V21), Robin's Egg Blue (V23). Cyber Orange + Robin's Egg Blue
// completed the 88/88 Long batch.
export const LONG_SUPPORTED_G1 = new Set<string>([
  "V1",
  "V2",
  "V3",
  "V15",
  "V16",
  "V17",
  "V18",
  "V19",
  "V20",
  "V21",
  "V23",
]);

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
