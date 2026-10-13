"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";

/**
 * Controls a native <dialog> as a modal: focus is trapped by the browser,
 * Escape closes it, and focus returns to the element that opened it.
 * The dialog also closes if the route is hidden by React <Activity>.
 */
export function useDialog() {
  const ref = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    const dialog = ref.current;
    if (!dialog || dialog.open) return;
    returnFocus.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.showModal();
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    ref.current?.close();
  }, []);

  /** Wire to the dialog's onClose so Escape and programmatic closes stay in sync. */
  const onClose = useCallback(() => {
    setIsOpen(false);
    const target = returnFocus.current;
    returnFocus.current = null;
    if (target && target.isConnected) target.focus({ preventScroll: true });
  }, []);

  useLayoutEffect(() => {
    const dialog = ref.current;
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);

  return { ref, isOpen, open, close, onClose };
}
