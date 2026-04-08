import { BuildState } from "@/types/build";
import { ProductConfig, ProductOption } from "@/types/product";

function findOption(groupOptions: ProductOption[], optionId: string) {
  return groupOptions.find((option) => option.id === optionId);
}

export function calculateBuildPrice(
  config: ProductConfig,
  state: BuildState,
): number {
  let total = config.basePrice;

  for (const group of config.groups) {
    const selection = state.selectedOptions[group.id];

    if (group.type === "single" && typeof selection === "string" && selection) {
      const option = findOption(group.options, selection);
      if (option) total += option.priceDelta;
    }

    if (group.type === "multi" && Array.isArray(selection)) {
      for (const optionId of selection) {
        const option = findOption(group.options, optionId);
        if (option) total += option.priceDelta;
      }
    }
  }

  return Number(total.toFixed(2));
}
