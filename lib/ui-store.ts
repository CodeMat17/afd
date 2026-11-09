"use client";

import { useSyncExternalStore } from "react";

/**
 * Global overlays (cart drawer, search) are mounted once in the root layout
 * and opened from anywhere through this tiny store.
 */
export type Overlay = "cart" | "search" | null;

let current: Overlay = null;
/** Product ID just added, so the drawer can highlight it. */
let lastAdded: string | null = null;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const overlay = {
  open(next: Exclude<Overlay, null>, options?: { addedId?: string }) {
    lastAdded = options?.addedId ?? null;
    current = next;
    emit();
  },
  close(which?: Exclude<Overlay, null>) {
    if (which && current !== which) return;
    current = null;
    emit();
  },
};

export function useOverlay(): Overlay {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  );
}

export function useLastAdded(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => lastAdded,
    () => null,
  );
}
