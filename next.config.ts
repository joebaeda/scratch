import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'imagedelivery.net, scratchnism.vercel.app',
      },
    ],
  },
};

export default nextConfig;
