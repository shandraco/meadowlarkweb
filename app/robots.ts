import type { MetadataRoute } from "next";

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://themeadowlarkfarm.com";
}

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/pos",
          "/pos/*",
          "/login",
          "/checkout",
          "/checkout/*",
          "/orders/lookup",
          "/club/account/*",
          "/api/*",
        ],
      },
    ],
    sitemap: `${siteUrl()}/sitemap.xml`,
    host: siteUrl(),
  };
}
