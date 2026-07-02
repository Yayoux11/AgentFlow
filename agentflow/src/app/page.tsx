import type { Metadata } from "next";
import HomePageClient from "@/components/HomePageClient";

export const metadata: Metadata = {
  title: "AgenToolFlow — La marketplace d'agents IA",
  description:
    "Découvrez, abonnez-vous et déployez des agents IA spécialisés. Automatisez vos tâches répétitives et boostez votre productivité dès aujourd'hui.",
  openGraph: {
    title: "AgenToolFlow — La marketplace d'agents IA",
    description: "Automatisez vos tâches répétitives avec des agents IA spécialisés. Déployez en un clic, opérationnel en 2 minutes.",
    type: "website",
    locale: "fr_FR",
    siteName: "AgenToolFlow",
  },
  twitter: {
    card: "summary_large_image",
    title: "AgenToolFlow — La marketplace d'agents IA",
    description: "50+ agents IA spécialisés. Déployez en un clic.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://agent-flow-toz3.vercel.app/#organization",
      name: "AgenToolFlow",
      url: "https://agent-flow-toz3.vercel.app",
      logo: { "@type": "ImageObject", url: "https://agent-flow-toz3.vercel.app/og.png" },
      description: "La marketplace d'agents IA spécialisés pour automatiser les tâches d'entreprise.",
      foundingDate: "2024",
      areaServed: "FR",
      knowsAbout: ["Intelligence artificielle", "Automatisation", "SaaS", "Agents IA"],
    },
    {
      "@type": "WebSite",
      "@id": "https://agent-flow-toz3.vercel.app/#website",
      url: "https://agent-flow-toz3.vercel.app",
      name: "AgenToolFlow",
      publisher: { "@id": "https://agent-flow-toz3.vercel.app/#organization" },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: "https://agent-flow-toz3.vercel.app/marketplace?q={search_term_string}" },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      name: "AgenToolFlow",
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
