"use client";

import type { ImageLoaderProps } from "next/image";

const CLOUDINARY_MARKER = "/image/upload/";

/**
 * Image loader for every `next/image` on the site.
 *
 * The built-in optimizer (`/_next/image`) resizes and re-encodes each photo
 * with sharp on our own server. On shared hosting that eats RAM, and its
 * thread pool counts against the process limit. Instead:
 * - Cloudinary photos are resized by Cloudinary (`f_auto` picks AVIF/WebP per
 *   browser, `c_limit` never upscales).
 * - Site artwork in /public is served as a plain static file. The `w` query
 *   is ignored by the server; it only keeps each srcset entry distinct.
 */
export default function imageLoader({ src, width, quality }: ImageLoaderProps): string {
  if (src.includes("res.cloudinary.com") && src.includes(CLOUDINARY_MARKER)) {
    const transform = `f_auto,q_${quality ?? 75},w_${width},c_limit`;
    return src.replace(CLOUDINARY_MARKER, `${CLOUDINARY_MARKER}${transform}/`);
  }
  return `${src}${src.includes("?") ? "&" : "?"}w=${width}`;
}
