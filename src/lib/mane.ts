import type { ManeContext } from "@/lib/assets";

const MANE_STYLE_MAP: Record<string, string> = { V4: "reg", V5: "reg" };
const MANE_COLOR_MAP: Record<string, string> = { V6: "black", V7: "white" };

/**
 * Derive the mane context from a build's selected options.
 * Falls back to regular/black (the defaults) when selections are missing,
 * because body renders only exist with a mane baked in.
 */
export function getManeContext(
  selectedOptions: Record<string, string | string[]> | undefined,
): ManeContext {
  const styleId = selectedOptions?.["G2"];
  const colorId = selectedOptions?.["G3"];
  const style =
    (typeof styleId === "string" ? MANE_STYLE_MAP[styleId] : undefined) ?? "reg";
  const color =
    (typeof colorId === "string" ? MANE_COLOR_MAP[colorId] : undefined) ??
    "black";
  return { style, color };
}
