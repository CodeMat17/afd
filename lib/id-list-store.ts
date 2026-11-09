"use client";

import { useSyncExternalStore } from "react";

/**
 * A small, versioned, localStorage-backed list of string IDs (saved items,
 * recently viewed, recent searches). Persisted data is parsed as `unknown`
 * and validated; anything unexpected is discarded.
 */
export interface IdListStore {
  subscribe(listener: () => void): () => void;
  getSnapshot(): readonly string[];
  getServerSnapshot(): readonly string[];
  has(id: string): boolean;
  /** Adds to the front (most recent first), de-duplicating. */
  add(id: string): void;
  remove(id: string): void;
  toggle(id: string): boolean;
  clear(): void;
}

const EMPTY: readonly string[] = Object.freeze([]);
const VERSION = 1;

export function createIdListStore(key: string, { max }: { max: number }): IdListStore {
  let items: readonly string[] = EMPTY;
  let loaded = false;
  const listeners = new Set<() => void>();

  const parse = (raw: string | null): readonly string[] => {
    if (!raw) return EMPTY;
    try {
      const data: unknown = JSON.parse(raw);
      if (typeof data !== "object" || data === null || Array.isArray(data)) return EMPTY;
      const record = data as Record<string, unknown>;
      if (record.version !== VERSION || !Array.isArray(record.items)) return EMPTY;
      const seen = new Set<string>();
      for (const entry of record.items) {
        if (typeof entry === "string" && entry.length > 0 && entry.length <= 200) seen.add(entry);
        if (seen.size >= max) break;
      }
      return [...seen];
    } catch {
      return EMPTY;
    }
  };

  const load = () => {
    loaded = true;
    try {
      items = parse(window.localStorage.getItem(key));
    } catch {
      items = EMPTY;
    }
  };

  const commit = (next: readonly string[]) => {
    items = next.slice(0, max);
    try {
      window.localStorage.setItem(key, JSON.stringify({ version: VERSION, items }));
    } catch {
      // Storage unavailable: keep working in memory.
    }
    listeners.forEach((l) => l());
  };

  const onStorage = (event: StorageEvent) => {
    if (event.key !== key) return;
    load();
    listeners.forEach((l) => l());
  };

  const getSnapshot = () => {
    if (!loaded) load();
    return items;
  };

  const add = (id: string) => commit([id, ...getSnapshot().filter((x) => x !== id)]);
  const remove = (id: string) => commit(getSnapshot().filter((x) => x !== id));

  return {
    subscribe(listener) {
      listeners.add(listener);
      if (listeners.size === 1) window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) window.removeEventListener("storage", onStorage);
      };
    },
    getSnapshot,
    getServerSnapshot: () => EMPTY,
    has: (id) => getSnapshot().includes(id),
    add,
    remove,
    toggle(id) {
      const present = getSnapshot().includes(id);
      if (present) remove(id);
      else add(id);
      return !present;
    },
    clear: () => commit(EMPTY),
  };
}

export function useIdList(store: IdListStore): readonly string[] {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}

/** Saved / wishlist product IDs. Device-local until accounts are connected. */
export const savedStore = createIdListStore("afd:saved", { max: 120 });

/** Recently viewed product IDs, most recent first. */
export const recentStore = createIdListStore("afd:recent", { max: 16 });

/** Recent search terms (not IDs, but the same shape and rules apply). */
export const recentSearchStore = createIdListStore("afd:recent-searches", { max: 6 });
