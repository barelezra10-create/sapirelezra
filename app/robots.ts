import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_URL ?? "https://sapirelezra.com";
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/login", "/logout", "/api"] },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
