import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer un compte",
  description: "Créez votre compte Agentoolflow gratuitement et déployez votre premier agent IA en 2 minutes.",
  keywords: ["créer compte IA", "inscription Agentoolflow", "essai gratuit agent IA"],
  alternates: { canonical: "https://agent-flow-toz3.vercel.app/register" },
  openGraph: {
    title: "Commencez gratuitement — Agentoolflow",
    description: "Créez votre compte et accédez à des agents IA spécialisés dès aujourd'hui.",
    url: "https://agent-flow-toz3.vercel.app/register",
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
