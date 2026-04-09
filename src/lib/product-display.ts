import broncoConfigJson from "@/data/bronco-config.json";
import type { ProductConfig } from "@/types/product";
const broncoConfig = broncoConfigJson as ProductConfig;

export function getGroupName(groupId: string): string {
  const group = broncoConfig.groups.find((g) => g.id === groupId);
  return group?.name ?? groupId;
}

export function getOptionName(optionId: string, groupId: string): string {
  const group = broncoConfig.groups.find((g) => g.id === groupId);
  const option = group?.options.find((o) => o.id === optionId);
  return option?.name ?? optionId;
}