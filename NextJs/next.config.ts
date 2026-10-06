import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server build for cPanel "Setup Node.js App" (see DEPLOY.md).
  output: "standalone",
};

export default nextConfig;
