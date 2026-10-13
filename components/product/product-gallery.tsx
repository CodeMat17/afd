"use client";

import { Expand } from "lucide-react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Lightbox } from "@/components/gallery/lightbox";
import type { ProductImage } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  const [active, setActive] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const current = sorted[active];

  if (!current) {
    return <div className="aspect-17/23 rounded-2xl bg-muted" />;
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setLightboxIndex(active)}
        aria-label={`Open full-screen view of ${name}`}
        className="group relative block w-full cursor-zoom-in overflow-hidden rounded-2xl bg-muted"
        style={{ aspectRatio: `${current.width} / ${current.height}` }}
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={current.imageUrl}
              alt={current.altText}
              fill
              preload
              quality={90}
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-contain transition-transform duration-[1.4s] ease-silk group-hover:scale-[1.03]"
            />
          </motion.div>
        </AnimatePresence>
        <span className="absolute right-4 bottom-4 flex h-10 items-center gap-2 rounded-full bg-background/95 px-4 text-xs font-semibold opacity-90 shadow-sm transition-opacity group-hover:opacity-100">
          <Expand className="size-3.5" aria-hidden="true" />
          View full screen
        </span>
      </button>

      {sorted.length > 1 ? (
        <ul className="mt-3 grid grid-cols-5 gap-2 sm:gap-3" aria-label="Product images">
          {sorted.map((image, i) => (
            <li key={image.id}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show image ${i + 1} of ${sorted.length}`}
                aria-pressed={i === active}
                className={cn(
                  "relative block aspect-17/23 w-full overflow-hidden rounded-lg bg-muted ring-offset-2 ring-offset-background transition-all",
                  i === active ? "ring-2 ring-foreground" : "opacity-70 hover:opacity-100",
                )}
              >
                <Image src={image.imageUrl} alt="" fill sizes="120px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <Lightbox
        images={sorted.map((img) => ({
          src: img.imageUrl,
          alt: img.altText,
          width: img.width,
          height: img.height,
        }))}
        index={lightboxIndex}
        onIndexChange={(i) => {
          setLightboxIndex(i);
          setActive(i);
        }}
        onClose={() => setLightboxIndex(null)}
        label={`${name} images`}
      />
    </div>
  );
}
