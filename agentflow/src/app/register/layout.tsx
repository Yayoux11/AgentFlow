import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer un compte",
  description: "Créez votre compte AgentFlow gratuitement et déployez votre premier agent IA en 2 minutes.",
  keywords: ["créer compte IA", "inscription AgentFlow", "essai gratuit agent IA"],
  alternates: { canonical: "https://agentflow.io/register" },
  openGraph: {
    title: "Commencez gratuitement — AgentFlow",
    description: "Créez votre compte et accédez à des agents IA spécialisés dès aujourd'hui.",
    url: "https://agentflow.io/register",
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
