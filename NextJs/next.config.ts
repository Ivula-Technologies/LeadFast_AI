import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server build for cPanel "Setup Node.js App" (see DEPLOY.md).
  output: "standalone",
  // Retired pages: old bookmarks land somewhere useful.
  redirects() {
    return [
      { source: "/leads", destination: "/dashboard", permanent: false },
      { source: "/client", destination: "/", permanent: false },
      { source: "/contact", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
