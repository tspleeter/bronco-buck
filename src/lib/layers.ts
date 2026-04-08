import { BuildState } from "@/types/build";
import { ProductConfig } from "@/types/product";

export function getSelectedLayers(
  config: ProductConfig,
  state: BuildState,
): string[] {
  const layers: string[] = [config.baseLayer];

  for (const layerType of config.layerOrder) {
    for (const group of config.groups) {
      const selection = state.selectedOptions[group.id];

      if (group.type === "single" && typeof selection === "string" && selection) {
        const option = group.options.find((item) => item.id === selection);
        if (
          option &&
          option.layerType === layerType &&
          option.imageLayer !== "none"
        ) {
          layers.push(option.imageLayer);
        }
      }

      if (group.type === "multi" && Array.isArray(selection)) {
        for (const optionId of selection) {
          const option = group.options.find((item) => item.id === optionId);
          if (
            option &&
            option.layerType === layerType &&
            option.imageLayer !== "none"
          ) {
            layers.push(option.imageLayer);
          }
        }
      }
    }
  }

  return layers;
}
