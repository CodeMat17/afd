import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { ogDefaultImage, site } from "@/lib/site";

/**
 * Shared 1200×630 share card used by the dynamic `opengraph-image.tsx` routes: brand panel
 * on the left, one or two photos on the right.
 */

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/jpeg";

const PHOTO_PANEL_WIDTH = 532;

// Brand tokens from app/globals.css (light theme).
const ivory = "#f5f0e7";
const brown = "#342d28";
const terracotta = "#a64f36";
const gold = "#7a5b24";
const sand = "#e4dacb";

const root = process.cwd();
const readFont = (file: string) => readFile(join(root, "assets/fonts", file));

async function publicDataUri(path: string): Promise<string> {
  const mime = path.endsWith(".png") ? "image/png" : "image/jpeg";
  const data = await readFile(join(root, "public", path));
  return `data:${mime};base64,${data.toString("base64")}`;
}

/**
 * Resolves a photo for the card. Files in /public are inlined; Cloudinary
 * URLs get a crop-to-fit JPEG transform so the renderer fetches a small image
 * in a format it can decode (it can't read AVIF/WebP).
 */
export async function ogPhoto(url: string, width: number): Promise<string> {
  if (url.startsWith("/")) return publicDataUri(url);
  const marker = "/image/upload/";
  if (url.includes("res.cloudinary.com") && url.includes(marker)) {
    return url.replace(marker, `${marker}c_fill,g_auto,w_${width},h_${ogSize.height},f_jpg,q_80/`);
  }
  return url;
}

export interface OgCardProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  /** One or two photo URLs (site-relative or absolute). */
  photos: string[];
}

function titleSize(title: string): number {
  if (title.length <= 26) return 76;
  if (title.length <= 44) return 64;
  return 52;
}

/**
 * Renders the card and re-encodes it as JPEG. ImageResponse only emits PNG,
 * which for photo cards is ~1 MB — too big for WhatsApp's link preview. If
 * anything fails, the error is logged and crawlers are redirected to the
 * static default card so a share never ends up without an image.
 */
export async function renderOgCard(props: OgCardProps): Promise<Response> {
  let png: Buffer;
  try {
    png = Buffer.from(await (await drawOgCard(props)).arrayBuffer());
  } catch (error) {
    console.error("[og-card] render failed, serving default image:", error);
    return new Response(null, {
      status: 307,
      headers: {
        Location: new URL(ogDefaultImage.url, site.url).toString(),
        "Cache-Control": "no-store",
      },
    });
  }

  const cacheControl = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";
  try {
    const { default: sharp } = await import("sharp");
    const jpeg = await sharp(png).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
    return new Response(new Uint8Array(jpeg), {
      headers: { "Content-Type": "image/jpeg", "Cache-Control": cacheControl },
    });
  } catch (error) {
    console.error("[og-card] JPEG encode failed, serving PNG:", error);
    return new Response(new Uint8Array(png), {
      headers: { "Content-Type": "image/png", "Cache-Control": cacheControl },
    });
  }
}

async function drawOgCard({ eyebrow, title, subtitle, photos }: OgCardProps) {
  const shown = photos.slice(0, 2);
  const photoWidth = Math.round(PHOTO_PANEL_WIDTH / Math.max(shown.length, 1));

  const [cormorant, cormorantItalic, manrope, manropeBold, logo, ...photoSrcs] = await Promise.all([
    readFont("CormorantGaramond-SemiBold.ttf"),
    readFont("CormorantGaramond-MediumItalic.ttf"),
    readFont("Manrope-Medium.ttf"),
    readFont("Manrope-Bold.ttf"),
    publicDataUri(site.logo.src),
    ...shown.map((p) => ogPhoto(p, photoWidth)),
  ]);

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: ivory }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: ogSize.width - PHOTO_PANEL_WIDTH - 8,
            padding: "56px 64px",
            borderRight: `8px solid ${terracotta}`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} width={site.logo.width * 1.1} height={site.logo.height * 1.1} alt="" />

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontFamily: "Manrope",
                fontWeight: 700,
                fontSize: 20,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: terracotta,
                marginBottom: 18,
              }}
            >
              {eyebrow}
            </div>
            <div
              style={{
                fontFamily: "Cormorant",
                fontWeight: 600,
                fontSize: titleSize(title),
                lineHeight: 1.02,
                color: brown,
                lineClamp: 3,
              }}
            >
              {title}
            </div>
            {subtitle ? (
              <div
                style={{
                  fontFamily: "Cormorant",
                  fontStyle: "italic",
                  fontWeight: 500,
                  fontSize: 36,
                  color: gold,
                  marginTop: 18,
                  lineClamp: 2,
                }}
              >
                {subtitle}
              </div>
            ) : null}
          </div>

          <div
            style={{
              display: "flex",
              fontFamily: "Manrope",
              fontWeight: 500,
              fontSize: 22,
              color: brown,
              paddingTop: 22,
              borderTop: `1px solid ${sand}`,
            }}
          >
            {`www.${site.domain}`}
          </div>
        </div>

        <div style={{ display: "flex", flex: 1, background: sand }}>
          {photoSrcs.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={src}
              width={photoWidth}
              height={ogSize.height}
              alt=""
              style={{ objectFit: "cover" }}
            />
          ))}
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Cormorant", data: cormorant, weight: 600, style: "normal" },
        { name: "Cormorant", data: cormorantItalic, weight: 500, style: "italic" },
        { name: "Manrope", data: manrope, weight: 500, style: "normal" },
        { name: "Manrope", data: manropeBold, weight: 700, style: "normal" },
      ],
    },
  );
}
