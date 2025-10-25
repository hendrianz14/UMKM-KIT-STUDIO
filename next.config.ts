import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Explicitly declare qualities used by <Image quality={...} />
    qualities: [60, 75],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "storage.googleapis.com" },
    ],
  },
};

export default nextConfig;
