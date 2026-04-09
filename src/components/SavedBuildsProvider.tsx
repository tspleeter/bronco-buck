"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getSavedBuilds,
  addSavedBuild as libAddSavedBuild,
  removeSavedBuild as libRemoveSavedBuild,
  clearSavedBuilds as libClearSavedBuilds,
} from "@/lib/saved-builds";
import type { SavedBuild } from "@/types/saved-build";

// The Provider now uses saved-builds.ts as the single source of truth.
// The separate broncoBuckSavedBuildIds localStorage key has been removed —
// it was a duplicate that drifted out of sync with bronco_buddy_saved_builds.

type SavedBuildsContextType = {
  savedBuilds: SavedBuild[];
  savedIds: string[];
  savedCount: number;
  addSavedBuild: (build: SavedBuild) => void;
  removeSavedBuild: (id: string) => void;
  clearSavedBuilds: () => void;
  refreshSavedBuilds: () => void;
};

const SavedBuildsContext = createContext<SavedBuildsContextType | undefined>(
  undefined
);

export default function SavedBuildsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [savedBuilds, setSavedBuilds] = useState<SavedBuild[]>([]);

  useEffect(() => {
    setSavedBuilds(getSavedBuilds());
  }, []);

  function refreshSavedBuilds() {
    setSavedBuilds(getSavedBuilds());
  }

  function addSavedBuild(build: SavedBuild) {
    libAddSavedBuild(build);
    setSavedBuilds(getSavedBuilds());
  }

  function removeSavedBuild(id: string) {
    libRemoveSavedBuild(id);
    setSavedBuilds((prev) => prev.filter((b) => b.buildId !== id));
  }

  function clearSavedBuilds() {
    libClearSavedBuilds();
    setSavedBuilds([]);
  }

  const value = useMemo(
    () => ({
      savedBuilds,
      savedIds: savedBuilds.map((b) => b.buildId),
      savedCount: savedBuilds.length,
      addSavedBuild,
      removeSavedBuild,
      clearSavedBuilds,
      refreshSavedBuilds,
    }),
    [savedBuilds]
  );

  return (
    <SavedBuildsContext.Provider value={value}>
      {children}
    </SavedBuildsContext.Provider>
  );
}

export function useSavedBuilds() {
  const context = useContext(SavedBuildsContext);

  if (!context) {
    throw new Error("useSavedBuilds must be used inside SavedBuildsProvider");
  }

  return context;
}
