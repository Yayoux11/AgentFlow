import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/marketplace", "/agents/"],
        disallow: ["/dashboard", "/settings/", "/admin/", "/onboarding", "/api/"],
      },
    ],
    sitemap: "https://agentflow.io/sitemap.xml",
  };
}
