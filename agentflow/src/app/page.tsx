import type { Metadata } from "next";
import HomePageClient from "@/components/HomePageClient";

export const metadata: Metadata = {
  title: "AgentFlow — La marketplace d'agents IA",
  description:
    "Découvrez, abonnez-vous et déployez des agents IA spécialisés. Automatisez vos tâches répétitives et boostez votre productivité dès aujourd'hui.",
  openGraph: {
    title: "AgentFlow — La marketplace d'agents IA",
    description: "Automatisez vos tâches répétitives avec des agents IA spécialisés. Déployez en un clic, opérationnel en 2 minutes.",
    type: "website",
    locale: "fr_FR",
    siteName: "AgentFlow",
  },
  twitter: {
    card: "summary_large_image",
    title: "AgentFlow — La marketplace d'agents IA",
    description: "50+ agents IA spécialisés. Déployez en un clic.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://agentflow.io/#organization",
      name: "AgentFlow",
      url: "https://agentflow.io",
      logo: { "@type": "ImageObject", url: "https://agentflow.io/og.png" },
      description: "La marketplace d'agents IA spécialisés pour automatiser les tâches d'entreprise.",
      foundingDate: "2024",
      areaServed: "FR",
      knowsAbout: ["Intelligence artificielle", "Automatisation", "SaaS", "Agents IA"],
    },
    {
      "@type": "WebSite",
      "@id": "https://agentflow.io/#website",
      url: "https://agentflow.io",
      name: "AgentFlow",
      publisher: { "@id": "https://agentflow.io/#organization" },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: "https://agentflow.io/marketplace?q={search_term_string}" },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      name: "AgentFlow",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "EUR",
        description: "Plan Starter gratuit disponible",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: "1",
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomePageClient />
    </>
  );
}
