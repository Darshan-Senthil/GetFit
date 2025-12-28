import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow base64 data URLs for image preview
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d205bpvrqc9yn1.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "*.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "v2.exercisedb.io",
      },
      {
        protocol: "https",
        hostname: "exercisedb.io",
      },
      {
        protocol: "https",
        hostname: "media.musclewiki.com",
      },
      {
        protocol: "https",
        hostname: "musclewiki.com",
      },
    ],
  },
};

export default nextConfig;
