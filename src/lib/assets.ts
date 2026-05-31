// View-dependent layers have per-angle image files (e.g. body_ruby_red_front.png).
const VIEW_DEPENDENT_LAYERS = new Set([
  "body_ruby_red",
  "body_velocity_blue",
  "body_shadow_black",
  "body_eruption_green",
  "body_oxford_white",
  "body_cyber_orange",
  "body_carbonized_gray",
  "body_cactus_gray",
  "body_desert_sand",
  "body_azure_gray",
]);

// These views only have mane-baked images, no bare body image
const MANE_ONLY_VIEWS = new Set(["right", "back"]);

// Map UI view names to filename tokens
const VIEW_FILENAME_MAP: Record<string, string> = {};

const LAYER_FOLDERS: Record<string, string> = {
  base_bronco: "base",
  body_ruby_red: "body",
  body_velocity_blue: "body",
  body_shadow_black: "body",
  body_eruption_green: "body",
  body_oxford_white: "body",
  body_cyber_orange: "body",
  body_carbonized_gray: "body",
  body_cactus_gray: "body",
  body_desert_sand: "body",
  body_azure_gray: "body",
  accessory_sunglasses: "accessories",
  stand_standard: "stand-style",
  stand_black: "stand-color",
  stand_red: "stand-color",
  nameplate_custom: "nameplate",
  packaging_standard: "packaging",
};

export interface ManeContext {
  style: string; // "reg"
  color: string; // "black" | "white"
}

export function getLayerAssetPath(
  layerName: string,
  view: string,
  mane?: ManeContext,
): string | undefined {
  if (!layerName || layerName === "none") return undefined;

  const folder = LAYER_FOLDERS[layerName];
  if (!folder) return undefined;

  if (VIEW_DEPENDENT_LAYERS.has(layerName)) {
    const fileView = VIEW_FILENAME_MAP[view] ?? view;
    if (mane) {
      return `/assets/${folder}/${layerName}_${fileView}_${mane.style}mane_${mane.color}.png`;
    }
    // Views that have no bare body image fall back to front
    const resolvedView = MANE_ONLY_VIEWS.has(view) ? "front" : fileView;
    return `/assets/${folder}/${layerName}_${resolvedView}.png`;
  }

  return `/assets/${folder}/${layerName}.png`;
}
