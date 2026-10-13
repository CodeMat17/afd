"use client";

import { Expand } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Lightbox } from "@/components/gallery/lightbox";
import { Reveal } from "@/components/motion/reveal";
import type { GalleryImage } from "@/lib/types";

export function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [index, setIndex] = useState<number | null>(null);

  return (
    <>
      <ul className="columns-2 gap-3 sm:gap-5 lg:columns-3 2xl:columns-4">
        {images.map((image, i) => (
          <li key={image.id} className="mb-3 break-inside-avoid sm:mb-5">
            <Reveal delay={(i % 3) * 0.08}>
              <figure className="group">
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Open image: ${image.caption}`}
                  className="relative block w-full cursor-zoom-in overflow-hidden rounded-sm bg-muted"
                  style={{ aspectRatio: `${image.width} / ${image.height}` }}
                >
                  <Image
                    src={image.imageUrl}
                    alt={image.altText}
                    fill
                    preload={i < 2}
                    sizes="(min-width: 1536px) 24vw, (min-width: 1024px) 32vw, 48vw"
                    className="object-cover transition-transform duration-[1.4s] ease-silk group-hover:scale-105"
                  />
                  <span className="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/25" />
                  <span className="absolute top-3 right-3 flex size-10 items-center justify-center rounded-full bg-background/90 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
                    <Expand className="size-4" aria-hidden="true" />
                  </span>
                </button>
                <figcaption className="mt-2.5 flex items-baseline justify-between gap-3">
                  <span className="font-heading text-base italic sm:text-lg">{image.caption}</span>
                  {image.productSlug ? (
                    <Link
                      href={`/products/${image.productSlug}`}
                      className="inline-flex min-h-10 shrink-0 items-center text-xs font-semibold underline decoration-foreground/30 underline-offset-4 hover:decoration-primary"
                    >
                      Shop<span className="sr-only">: {image.caption}</span>
                    </Link>
                  ) : null}
                </figcaption>
              </figure>
            </Reveal>
          </li>
        ))}
      </ul>

      <Lightbox
        images={images.map((img) => ({
          src: img.imageUrl,
          alt: img.altText,
          width: img.width,
          height: img.height,
          caption: img.caption,
        }))}
        index={index}
        onIndexChange={setIndex}
        onClose={() => setIndex(null)}
        label="Gallery"
      />
    </>
  );
}
