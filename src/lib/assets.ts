// View-dependent layers have per-angle image files (e.g. body_red_front.png).
// All other layers are view-independent (e.g. mane_black.png).
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

  mane_short: "mane-style",
  mane_punk: "mane-style",

  mane_black: "mane-color",
  mane_blonde: "mane-color",

  accessory_sunglasses: "accessories",

  stand_standard: "stand-style",

  stand_black: "stand-color",
  stand_red: "stand-color",

  nameplate_custom: "nameplate",

  packaging_standard: "packaging",
};

export function getLayerAssetPath(
  layerName: string,
  view: string,
): string | undefined {
  if (!layerName || layerName === "none") return undefined;

  const folder = LAYER_FOLDERS[layerName];
  if (!folder) return undefined;

  // Body layers have per-view variants (front, side, rear, angle)
  // All other layers use a single image regardless of view
  if (VIEW_DEPENDENT_LAYERS.has(layerName)) {
    return `/assets/${folder}/${layerName}_${view}.png`;
  }

  return `/assets/${folder}/${layerName}.png`;
}
