import { SavedBuild } from "@/types/saved-build";

const SAVED_BUILDS_KEY = "bronco_buddy_saved_builds";

function notifySavedBuildsChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("saved-builds-updated"));
}

export function getSavedBuilds(): SavedBuild[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(SAVED_BUILDS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedBuild[];
  } catch {
    return [];
  }
}

export function getSavedBuildById(buildId: string): SavedBuild | undefined {
  const builds = getSavedBuilds();
  return builds.find((item) => item.buildId === buildId);
}

export function saveSavedBuilds(items: SavedBuild[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SAVED_BUILDS_KEY, JSON.stringify(items));
  notifySavedBuildsChanged();
}

export function addSavedBuild(item: SavedBuild) {
  const builds = getSavedBuilds();
  builds.unshift(item);
  saveSavedBuilds(builds);
}

export function updateSavedBuild(updatedItem: SavedBuild) {
  const builds = getSavedBuilds();
  const next = builds.map((item) =>
    item.buildId === updatedItem.buildId ? updatedItem : item,
  );
  saveSavedBuilds(next);
}

export function removeSavedBuild(buildId: string) {
  const builds = getSavedBuilds().filter((item) => item.buildId !== buildId);
  saveSavedBuilds(builds);
}

export function clearSavedBuilds() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SAVED_BUILDS_KEY);
  notifySavedBuildsChanged();
}