"use client";

import { useSyncExternalStore } from "react";

export interface Notice {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  action?: { label: string; href: string };
}

let notices: Notice[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const EMPTY: Notice[] = [];

function emit() {
  listeners.forEach((l) => l());
}

export function notify(notice: Omit<Notice, "id">, durationMs = 4200) {
  const id = nextId++;
  notices = [...notices.slice(-2), { ...notice, id }];
  emit();
  window.setTimeout(() => dismiss(id), durationMs);
}

export function dismiss(id: number) {
  notices = notices.filter((n) => n.id !== id);
  emit();
}

export function useNotices(): Notice[] {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => notices,
    () => EMPTY,
  );
}
