"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** False during prerender/SSR and hydration, true afterwards. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
