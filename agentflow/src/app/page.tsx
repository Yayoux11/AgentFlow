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

export default function HomePage() {
  return <HomePageClient />;
}
