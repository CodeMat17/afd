"use client";

import { Expand } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Lightbox } from "@/components/gallery/lightbox";
import { Reveal } from "@/components/motion/reveal";
import type { GalleryImage } from "@/lib/types";

const lookNumber = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Lookbook-style masonry. Columns stay narrow (roughly 250–330px) so the
 * small source photography is only lightly upscaled.
 */
export function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [index, setIndex] = useState<number | null>(null);

  return (
    <>
      <div className="mb-8 flex items-baseline justify-between gap-4 border-b border-foreground/10 pb-4 sm:mb-10">
        <p className="eyebrow flex items-center gap-3 text-gold">
          <span className="h-px w-8 bg-current" aria-hidden="true" />
          The lookbook
        </p>
        <p className="font-heading text-sm text-muted-foreground italic tabular-nums">
          {images.length} looks
        </p>
      </div>

      <ul className="columns-2 gap-3 sm:columns-3 sm:gap-5 lg:columns-4 lg:gap-6 2xl:columns-5">
        {images.map((image, i) => (
          <li key={image.id} className="mb-6 break-inside-avoid sm:mb-8">
            <Reveal delay={(i % 4) * 0.06}>
              <figure className="group">
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Open look ${lookNumber(i)}: ${image.caption}`}
                  className="relative block w-full cursor-zoom-in overflow-hidden rounded-sm bg-muted shadow-[0_6px_16px_-6px] shadow-ink/35 ring-1 ring-foreground/5 transition-[translate,box-shadow] duration-500 ease-silk group-hover:-translate-y-1 group-hover:shadow-[0_18px_36px_-10px] group-hover:shadow-ink/50 dark:shadow-ink/80 dark:group-hover:shadow-ink"
                  style={{ aspectRatio: `${image.width} / ${image.height}` }}
                >
                  <Image
                    src={image.imageUrl}
                    alt={image.altText}
                    fill
                    preload={i < 4}
                    sizes="(min-width: 1536px) 19vw, (min-width: 1024px) 23vw, (min-width: 640px) 31vw, 47vw"
                    className="object-cover transition-transform duration-[1.4s] ease-silk group-hover:scale-[1.04]"
                  />
                  <span
                    className="absolute inset-0 bg-linear-to-t from-ink/70 via-ink/0 to-ink/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
                    aria-hidden="true"
                  />
                  <span
                    className="absolute bottom-2.5 left-3 flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.18em] text-ink-foreground uppercase opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:opacity-100 sm:translate-y-1"
                    aria-hidden="true"
                  >
                    <Expand className="size-3" />
                    View
                  </span>
                </button>
                <figcaption className="mt-2.5">
                  <span className="block text-[10px] font-semibold tracking-[0.22em] text-gold uppercase tabular-nums">
                    Look {lookNumber(i)}
                  </span>
                  <span className="mt-0.5 block font-heading text-sm leading-snug italic sm:text-[0.95rem]">
                    {image.caption}
                  </span>
                  {image.productSlug ? (
                    <Link
                      href={`/products/${image.productSlug}`}
                      className="mt-1 inline-flex min-h-8 items-center text-xs font-semibold underline decoration-foreground/30 underline-offset-4 hover:decoration-primary"
                    >
                      Shop the fabric<span className="sr-only">: {image.caption}</span>
                    </Link>
                  ) : null}
                </figcaption>
              </figure>
            </Reveal>
          </li>
        ))}
      </ul>

      <Lightbox
        images={images.map((img, i) => ({
          src: img.imageUrl,
          alt: img.altText,
          width: img.width,
          height: img.height,
          caption: `Look ${lookNumber(i)} · ${img.caption}`,
        }))}
        index={index}
        onIndexChange={setIndex}
        onClose={() => setIndex(null)}
        label="Gallery"
      />
    </>
  );
}
