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

  return `/assets/${folder}/${layerName}_${view}.png`;
}