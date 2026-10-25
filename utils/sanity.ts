import { createClient } from "@sanity/client";

export const sanity = createClient({
  projectId: process.env.SANITY_PROJECT_ID || "rpto4lw1",
  dataset: process.env.SANITY_DATASET || "production",
  apiVersion: process.env.SANITY_API_VERSION || "2024-01-01",
  // CDN is fine on Vercel; disable locally if DNS/proxy breaks apicdn
  useCdn: process.env.NODE_ENV === "production",
});
