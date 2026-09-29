import { BuildState } from "@/types/build";
import { ProductConfig } from "@/types/product";

// Groups hidden from every build summary (builder, cart, saved, share, orders).
//  - G5 (Stand Style), G8 (Packaging): not shown to customers/admins
//  - G7 (Nameplate): the option name is redundant — the "Nameplate Text" row
//    (customFields.nameplateText) shows what's actually on the plate
export const SUMMARY_HIDDEN_GROUPS = new Set(["G5", "G7", "G8"]);

// Stand Color (G6) is hidden from the builder for now (hidden-groups.ts);
// only itemize it when an older build carries a paid stand color.
export function isFreeStandColor(groupId: string, priceDelta: number) {
  return groupId === "G6" && priceDelta === 0;
}

/**
 * True if a raw selectedOptions entry should be left out of a summary list.
 * Used by pages that iterate selectedOptions directly (cart, checkout).
 */
export function isHiddenSelection(
  config: ProductConfig,
  groupId: string,
  value: string | string[],
) {
  if (SUMMARY_HIDDEN_GROUPS.has(groupId)) return true;
  if (typeof value !== "string") return false;
  const delta =
    config.groups.find((g) => g.id === groupId)?.options.find((o) => o.id === value)
      ?.priceDelta ?? 0;
  return isFreeStandColor(groupId, delta);
}

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


  for (const group of sortedGroups) {
    if (SUMMARY_HIDDEN_GROUPS.has(group.id)) continue;
    const selection = state.selectedOptions[group.id];

    if (group.type === "single" && typeof selection === "string" && selection) {
      const option = group.options.find((item) => item.id === selection);

      if (option && isFreeStandColor(group.id, option.priceDelta)) continue;

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