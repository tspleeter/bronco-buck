import { BuildState } from "@/types/build";
import { ProductConfig } from "@/types/product";

export interface BuildSummaryItem {
  groupId: string;
  groupName: string;
  optionName: string;
}

export function getBuildSummary(
  config: ProductConfig,
  state: BuildState,
): BuildSummaryItem[] {
  const items: BuildSummaryItem[] = [];

  const sortedGroups = [...config.groups].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );

  // Groups hidden from summary until imagery is ready
  const HIDDEN_GROUPS = new Set(["G2", "G5"]);

  for (const group of sortedGroups) {
    if (HIDDEN_GROUPS.has(group.id)) continue;
    const selection = state.selectedOptions[group.id];

    if (group.type === "single" && typeof selection === "string" && selection) {
      const option = group.options.find((item) => item.id === selection);

      if (option) {
        items.push({
          groupId: group.id,
          groupName: group.name,
          optionName: option.name,
        });
      }
    }

    if (group.type === "multi" && Array.isArray(selection) && selection.length) {
      const optionNames = selection
        .map((optionId) => group.options.find((item) => item.id === optionId)?.name)
        .filter(Boolean)
        .join(", ");

      if (optionNames) {
        items.push({
          groupId: group.id,
          groupName: group.name,
          optionName: optionNames,
        });
      }
    }
  }

  return items;
}