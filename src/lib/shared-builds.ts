import { SharedBuild } from "@/types/shared-build";

const SHARED_BUILDS_KEY = "bronco_buddy_shared_builds";

function notifySharedBuildsChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("shared-builds-updated"));
}

export function getSharedBuilds(): SharedBuild[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(SHARED_BUILDS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed;
  } catch {
    return [];
  }
}

export function getSharedBuildById(shareId: string): SharedBuild | undefined {
  const builds = getSharedBuilds();
  return builds.find((item) => item.shareId === shareId);
}

export function saveSharedBuilds(items: SharedBuild[]) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(SHARED_BUILDS_KEY, JSON.stringify(items));
  notifySharedBuildsChanged();
}

export function addSharedBuild(item: SharedBuild) {
  const builds = getSharedBuilds();

  const existing = builds.find((b) => b.shareId === item.shareId);
  if (existing) {
    const next = builds.map((b) => (b.shareId === item.shareId ? item : b));
    saveSharedBuilds(next);
    return;
  }

  saveSharedBuilds([item, ...builds]);
}