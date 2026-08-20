import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // playwright-core drives a real Chrome for the local WhatsApp archive tool.
  // It must not be bundled by Turbopack: it resolves browser binaries and
  // transports through Node's own require at runtime.
  serverExternalPackages: ["playwright-core"],

  async rewrites() {
    return [
      // Serve the static TC Baindt preview site's index at the clean folder URL.
      // Its pages carry <base href="/tc-baindt-preview/"> so relative assets
      // resolve correctly whether the URL has a trailing slash or not.
      {
        source: "/tc-baindt-preview",
        destination: "/tc-baindt-preview/index.html",
      },
      // Same pattern for the Da Michele restaurant preview site.
      {
        source: "/da-michele-preview",
        destination: "/da-michele-preview/index.html",
      },
    ];
  },
};

export default nextConfig;
