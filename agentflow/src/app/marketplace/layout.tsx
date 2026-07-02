import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Marketplace — Agents IA spécialisés",
  description:
    "Explorez notre catalogue d'agents IA : email, recrutement, immobilier, développement, finance et plus. Déployez en un clic, sans code.",
  keywords: [
    "marketplace agents IA", "catalogue IA", "agents IA spécialisés", "automatisation sans code",
    "agent email automatique", "agent recrutement IA", "agent immobilier IA", "agent développement IA",
  ],
  alternates: { canonical: "https://agent-flow-toz3.vercel.app/marketplace" },
  openGraph: {
    title: "Marketplace AgenToolFlow — Tous nos agents IA",
    description: "Explorez et déployez des agents IA spécialisés pour chaque métier. Email, RH, immo, dev, finance…",
    url: "https://agent-flow-toz3.vercel.app/marketplace",
  },
};

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
