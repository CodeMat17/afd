"use client";

import { Check, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { dismiss, useNotices } from "@/lib/notify";

/** Accessible, polite live-region notifications (e.g. "Added to cart"). */
export function Toaster() {
  const notices = useNotices();

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-[calc(var(--header-height)+0.75rem)] z-60 flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6"
    >
      <AnimatePresence initial={false}>
        {notices.map((notice) => (
          <motion.div
            key={notice.id}
            layout
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-lg border border-ink/10 bg-ink p-3 pr-2 text-ink-foreground shadow-[0_20px_50px_-20px_rgb(0_0_0/0.5)]"
          >
            {notice.imageUrl ? (
              <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-lg">
                <Image src={notice.imageUrl} alt="" fill sizes="44px" className="object-cover" />
              </div>
            ) : (
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary">
                <Check className="size-4" aria-hidden="true" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{notice.title}</p>
              {notice.description ? (
                <p className="truncate text-xs text-ink-muted">{notice.description}</p>
              ) : null}
            </div>
            {notice.action ? (
              <Link
                href={notice.action.href}
                onClick={() => dismiss(notice.id)}
                className="shrink-0 rounded-full border border-ink-foreground/30 px-3 py-2 text-xs font-semibold transition-colors hover:bg-ink-foreground hover:text-ink"
              >
                {notice.action.label}
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => dismiss(notice.id)}
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:text-ink-foreground"
              aria-label="Dismiss notification"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
