import { MetadataRoute } from "next";

const BASE = "https://agent-flow-toz3.vercel.app";

const AGENT_SLUGS = [
  "email-writer",
  "email-assistant",
  "data-analyst",
  "content-writer",
  "customer-support",
  "code-reviewer",
  "meeting-summarizer",
  "social-media",
  "apartment-finder",
  "job-finder",
  "cover-letter",
  "car-finder",
  "fullstack-dev",
  "security-auditor",
  "lead-dev",
  "project-manager",
  "product-owner",
  "scrum-master",
  "profile-finder",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/marketplace`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];

  const agentPages: MetadataRoute.Sitemap = AGENT_SLUGS.map((slug) => ({
    url: `${BASE}/agents/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...agentPages];
}
