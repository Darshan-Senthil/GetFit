import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow base64 data URLs for image preview
    dangerouslyAllowSVG: true,
    remotePatterns: [],
  },
};

export default nextConfig;
