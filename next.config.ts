import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
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
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
