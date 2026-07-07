import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Serve the static TC Baindt preview site's index at the clean folder URL.
      // Its pages carry <base href="/tc-baindt-preview/"> so relative assets
      // resolve correctly whether the URL has a trailing slash or not.
      {
        source: "/tc-baindt-preview",
        destination: "/tc-baindt-preview/index.html",
      },
    ];
  },
};

export default nextConfig;
