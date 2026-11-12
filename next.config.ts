import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Dev only: lets a Cloudflare quick tunnel (used to test Pesapal callbacks
  // locally) load the dev server's scripts. No effect on production builds.
  allowedDevOrigins: ["*.trycloudflare.com"],
  partialPrefetching: true,
  images: {
    // Resizing happens on Cloudinary (or not at all for /public artwork), never
    // in this Node process: sharp's RAM and threads overload shared hosting.
    // See lib/image-loader.ts. The settings below only shape the srcset.
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
    // Catalogue photos are hosted on Cloudinary; only this account's uploads are allowed.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: `/${process.env.CLOUDINARY_CLOUD_NAME ?? "*"}/image/upload/**`,
        search: "",
      },
    ],
    // Site artwork (logo, about page, etc.) stays in /public.
    localPatterns: [
      { pathname: "/images/**", search: "" },
      { pathname: "/logo.png", search: "" },
    ],
    qualities: [75, 90],
    // AVIF is markedly smaller than WebP for these photos; WebP stays as fallback.
    formats: ["image/avif", "image/webp"],
    // Catalogue photos are ~680–1600px wide, so 2048/3840 variants only bloat
    // every srcset (and the HTML) without ever being sharper.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [48, 96, 128, 256, 384],
  },
};

export default nextConfig;
