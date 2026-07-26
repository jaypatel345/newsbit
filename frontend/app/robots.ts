import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.newsbit.in";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/_next/",
        "/admin/",
        "/login",
        "/signup",
        "/feedback",
        "/report",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
