import type { MetadataRoute } from "next";

// Lets contractors add LeadFast to their phone's home screen and open it
// like an app (full screen, own icon), straight into the dashboard.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LeadFast AI",
    short_name: "LeadFast",
    description: "Instant replies to every new lead, and your lead list in your pocket.",
    id: "/dashboard",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f8fafc",
    theme_color: "#32036d",
    categories: ["business", "productivity"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Leads", url: "/dashboard" },
      { name: "Settings", url: "/settings" },
    ],
  };
}
