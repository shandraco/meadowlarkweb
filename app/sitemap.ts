import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

// Dynamic sitemap. Static marketing routes plus everything currently active
// in the catalog and events tables. Refreshes on every crawl via
// force-dynamic (Next resolves this when the sitemap is fetched).

export const dynamic = "force-dynamic";

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://themeadowlarkfarm.com";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/store`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/cider-club`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/the-farm`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/visit`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/visit/book`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/visit/field-trips`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/events`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/cart`, lastModified: now, changeFrequency: "never", priority: 0.2 },
  ];

  // Everything below is best-effort — a missing DB in a preview environment
  // should not fail the sitemap generation.
  const dynamicEntries: MetadataRoute.Sitemap = [];
  try {
    const supabase = await createClient();
    const [products, events, resources, programs] = await Promise.all([
      supabase.from("products").select("slug, updated_at").eq("active", true),
      supabase.from("events").select("id, starts_at").eq("cancelled", false).gte("starts_at", now.toISOString()),
      supabase.from("bookable_resources").select("id, created_at").eq("active", true),
      supabase.from("field_trip_programs").select("id, created_at").eq("active", true),
    ]);

    for (const p of products.data ?? []) {
      dynamicEntries.push({
        url: `${base}/store/${p.slug}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : now,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
    for (const e of events.data ?? []) {
      dynamicEntries.push({
        url: `${base}/events#${e.id}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
    for (const r of resources.data ?? []) {
      dynamicEntries.push({
        url: `${base}/visit/book/${r.id}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
    for (const p of programs.data ?? []) {
      dynamicEntries.push({
        url: `${base}/visit/field-trips/${p.id}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  } catch (e) {
    console.error("[sitemap] dynamic entries skipped:", e);
  }

  return [...staticEntries, ...dynamicEntries];
}
