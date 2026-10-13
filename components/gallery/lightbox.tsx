"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

export interface LightboxImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
}

const SWIPE_DISTANCE = 60;
const SWIPE_VELOCITY = 400;
const MAX_UPSCALE = 2;

/**
 * Accessible modal lightbox built on native <dialog>: focus is contained,
 * Escape closes, arrow keys and swipes navigate, focus returns on close.
 */
export function Lightbox({
  images,
  index,
  onIndexChange,
  onClose,
  label = "Image viewer",
}: {
  images: LightboxImage[];
  /** Open at this index; `null` keeps the lightbox closed. */
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  label?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  const isOpen = index !== null;
  const count = images.length;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      returnFocus.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // Close if this route is hidden by <Activity>.
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);

  const go = (delta: 1 | -1) => {
    if (index === null || count < 2) return;
    setDirection(delta);
    onIndexChange((index + delta + count) % count);
  };

  const handleClose = () => {
    onClose();
    const target = returnFocus.current;
    returnFocus.current = null;
    if (target?.isConnected) target.focus({ preventScroll: true });
  };

  const onDragEnd = (_: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) go(1);
    else if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) go(-1);
  };

  const current = index !== null ? images[index] : undefined;

  return (
    <dialog
      ref={dialogRef}
      aria-label={label}
      onClose={handleClose}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          go(1);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          go(-1);
        }
      }}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none bg-ink/95 p-0 text-ink-foreground opacity-0 transition-opacity transition-discrete duration-300 backdrop:bg-ink/95 open:opacity-100 starting:open:opacity-0"
    >
      {current ? (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6">
            <p className="text-sm text-ink-muted tabular-nums" aria-live="polite">
              {index !== null ? index + 1 : 0} / {count}
            </p>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Close"
              autoFocus
              className="flex size-12 items-center justify-center rounded-full bg-ink-foreground/10 transition-colors hover:bg-ink-foreground/20"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-2 py-4 sm:px-20">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={current.src}
                custom={direction}
                variants={{
                  enter: (d: number) => ({ x: d * 80, opacity: 0 }),
                  center: { x: 0, opacity: 1 },
                  exit: (d: number) => ({ x: d * -80, opacity: 0 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                drag={count > 1 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragEnd={onDragEnd}
                className="flex h-full w-full touch-pan-y items-center justify-center"
              >
                {/* Never upscale past 2x the source, so small photos stay crisp. */}
                <div
                  className="relative max-w-full"
                  style={{
                    aspectRatio: `${current.width} / ${current.height}`,
                    height: `min(100%, ${current.height * MAX_UPSCALE}px)`,
                  }}
                >
                  <Image
                    src={current.src}
                    alt={current.alt}
                    fill
                    quality={90}
                    sizes="100vw"
                    draggable={false}
                    className="pointer-events-none object-contain select-none"
                  />
                </div>
              </motion.div>
            </AnimatePresence>

            {count > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous image"
                  className="absolute left-2 flex size-12 items-center justify-center rounded-full bg-ink/60 transition-colors hover:bg-ink-foreground hover:text-ink sm:left-6"
                >
                  <ChevronLeft className="size-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next image"
                  className="absolute right-2 flex size-12 items-center justify-center rounded-full bg-ink/60 transition-colors hover:bg-ink-foreground hover:text-ink sm:right-6"
                >
                  <ChevronRight className="size-5" aria-hidden="true" />
                </button>
              </>
            ) : null}
          </div>

          <p className="min-h-12 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-center font-heading text-lg text-ink-foreground/90 italic">
            {current.caption ?? ""}
          </p>
        </div>
      ) : null}
    </dialog>
  );
}
