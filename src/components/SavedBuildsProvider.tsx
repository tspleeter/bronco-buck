"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type SavedBuildsContextType = {
  savedIds: string[];
  savedCount: number;
  addSavedBuild: (id: string) => void;
  removeSavedBuild: (id: string) => void;
  clearSavedBuilds: () => void;
  refreshSavedBuilds: () => void;
};

const SavedBuildsContext = createContext<SavedBuildsContextType | undefined>(
  undefined
);

const STORAGE_KEY = "broncoBuckSavedBuildIds";

function readSavedIds(): string[] {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSavedIds(ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export default function SavedBuildsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    setSavedIds(readSavedIds());
  }, []);

  function refreshSavedBuilds() {
    setSavedIds(readSavedIds());
  }

  function addSavedBuild(id: string) {
    setSavedIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [id, ...prev];
      writeSavedIds(next);
      return next;
    });
  }

  function removeSavedBuild(id: string) {
    setSavedIds((prev) => {
      const next = prev.filter((item) => item !== id);
      writeSavedIds(next);
      return next;
    });
  }

  function clearSavedBuilds() {
    writeSavedIds([]);
    setSavedIds([]);
  }

  const value = useMemo(
    () => ({
      savedIds,
      savedCount: savedIds.length,
      addSavedBuild,
      removeSavedBuild,
      clearSavedBuilds,
      refreshSavedBuilds,
    }),
    [savedIds]
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