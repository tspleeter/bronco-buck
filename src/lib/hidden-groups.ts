import { ProductConfig } from "@/types/product";
import { BuildState } from "@/types/build";
import { getDefaultBuildState } from "@/lib/defaults";

/**
 * Option groups temporarily removed from the builder (Sep 2026):
 * Accessories (G4), Stand Style (G5), Stand Color (G6), Packaging (G8).
 * They stay in bronco-config.json so old builds/orders still price and
 * render; the builder just doesn't show them and forces their defaults
 * (no accessories, Standard stand, Match Body, Standard Box).
 * To bring a group back, remove its id from this set.
 */
export const BUILDER_HIDDEN_GROUPS = new Set(["G4", "G5", "G6", "G8"]);

/** Reset every hidden group to its default selection. */
export function withHiddenGroupDefaults(
  config: ProductConfig,
  state: BuildState,
): BuildState {
  const defaults = getDefaultBuildState(config).selectedOptions;
  const selectedOptions = { ...state.selectedOptions };
  for (const id of BUILDER_HIDDEN_GROUPS) {
    if (id in defaults) selectedOptions[id] = defaults[id];
  }
  return { ...state, selectedOptions };
}
