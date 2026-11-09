"use client";

import { useCallback, useEffect, useRef, type MouseEvent } from "react";
import { overlay, useOverlay, type Overlay } from "@/lib/ui-store";

/**
 * Binds a native modal <dialog> to the global overlay store, so it can be
 * opened from anywhere. The browser traps focus and handles Escape; focus
 * returns to whatever opened it.
 */
export function useOverlayDialog(name: Exclude<Overlay, null>) {
  const ref = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const isOpen = useOverlay() === name;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      returnFocus.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  const close = useCallback(() => overlay.close(name), [name]);

  const onClose = useCallback(() => {
    overlay.close(name);
    const target = returnFocus.current;
    returnFocus.current = null;
    if (target && target.isConnected) target.focus({ preventScroll: true });
  }, [name]);

  /** Close when the backdrop (the dialog element itself) is clicked. */
  const onBackdropClick = useCallback(
    (event: MouseEvent<HTMLDialogElement>) => {
      if (event.target === event.currentTarget) close();
    },
    [close],
  );

  return { ref, isOpen, close, onClose, onBackdropClick };
}
