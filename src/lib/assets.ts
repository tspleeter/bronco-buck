// View-dependent layers have per-angle image files (e.g. body_red_front.png).
// All other layers are view-independent (e.g. mane_black.png).
const VIEW_DEPENDENT_LAYERS = new Set([
  "body_red",
  "body_blue",
  "body_black",
  "body_green",
]);

const LAYER_FOLDERS: Record<string, string> = {
  base_bronco: "base",

  body_red: "body",
  body_blue: "body",
  body_black: "body",
  body_green: "body",

  mane_short: "mane-style",
  mane_punk: "mane-style",

  mane_black: "mane-color",
  mane_blonde: "mane-color",

  accessory_sunglasses: "accessories",

  stand_standard: "stand-style",

  stand_black: "stand-color",
  stand_red: "stand-color",

  nameplate_buck: "nameplate",
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
