import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Marketplace — Agents IA spécialisés",
  description:
    "Explorez notre catalogue d'agents IA : email, recrutement, immobilier, développement, finance et plus. Déployez en un clic, sans code.",
  keywords: [
    "marketplace agents IA", "catalogue IA", "agents IA spécialisés", "automatisation sans code",
    "agent email automatique", "agent recrutement IA", "agent immobilier IA", "agent développement IA",
  ],
  alternates: { canonical: "https://agentflow.io/marketplace" },
  openGraph: {
    title: "Marketplace AgentFlow — Tous nos agents IA",
    description: "Explorez et déployez des agents IA spécialisés pour chaque métier. Email, RH, immo, dev, finance…",
    url: "https://agentflow.io/marketplace",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "AgentFlow Marketplace" }],
  },
};

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
