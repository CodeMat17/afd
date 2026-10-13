import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Supplied assets live in /public. Only allow those paths to be optimised.
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
