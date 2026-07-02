import { MetadataRoute } from "next";

const BASE = "https://agentflow.io";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Agent {
  slug: string;
  updated_at?: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/marketplace`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  try {
    const agents: Agent[] = await fetch(`${API_URL}/agents`, { next: { revalidate: 3600 } })
      .then((r) => r.json());

    const agentPages: MetadataRoute.Sitemap = agents.map((agent) => ({
      url: `${BASE}/agents/${agent.slug}`,
      lastModified: agent.updated_at ? new Date(agent.updated_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticPages, ...agentPages];
  } catch {
    return staticPages;
  }
}
