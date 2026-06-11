import { ProductConfig } from "@/types/product";
import { BuildState } from "@/types/build";

export function getDefaultBuildState(config: ProductConfig): BuildState {
  const selectedOptions: Record<string, string | string[]> = {};

  const sortedGroups = [...config.groups].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );

  for (const group of sortedGroups) {
    const activeOptions = group.options.filter((option) => option.active);

    if (group.type === "single") {
      if (activeOptions.length > 0) {
        selectedOptions[group.id] = activeOptions[0].id;
      }
    } else {
      selectedOptions[group.id] = [];
    }
  }

  // If Buck nameplate is the default selection, pre-fill the custom field
  const defaultNameplateText =
    selectedOptions["G7"] === "V22" ? "Buck" : "";

  return {
    productId: config.productId,
    selectedOptions,
    customFields: defaultNameplateText ? { nameplateText: defaultNameplateText } : {},
  };
}
