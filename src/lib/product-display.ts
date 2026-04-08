import broncoConfig from "@/data/bronco-config.json";

export function getGroupName(groupId: string): string {
  const group = broncoConfig.groups.find((g) => g.id === groupId);
  return group?.name ?? groupId;
}

export function getOptionName(optionId: string, groupId: string): string {
  const group = broncoConfig.groups.find((g) => g.id === groupId);
  const option = group?.options.find((o) => o.id === optionId);
  return option?.name ?? optionId;
}