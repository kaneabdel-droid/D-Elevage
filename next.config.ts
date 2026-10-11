import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/demo',
        destination: '/decouvrir-delevage',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
