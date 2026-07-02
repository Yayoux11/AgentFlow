import type { Metadata } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Agent {
  name: string;
  slug: string;
  description: string;
  long_description: string;
  category: string;
  icon: string;
  tags: string[];
  features: string[];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: slug } = await params;

  try {
    const agent: Agent = await fetch(`${API_URL}/agents/${slug}`, {
      next: { revalidate: 3600 },
    }).then((r) => {
      if (!r.ok) throw new Error("not found");
      return r.json();
    });

    const title = `${agent.icon} ${agent.name} — Agent IA`;
    const description = agent.description;
    const keywords = [agent.name, "agent IA", agent.category, ...agent.tags];
    const url = `https://agent-flow-toz3.vercel.app/agents/${slug}`;

    return {
      title,
      description,
      keywords,
      alternates: { canonical: url },
      openGraph: {
        title: `${agent.name} — Agent IA | AgenToolFlow`,
        description: agent.long_description || agent.description,
        url,
        type: "website",
        },
      twitter: {
        card: "summary_large_image",
        title: `${agent.name} — Agent IA | AgenToolFlow`,
        description: agent.description,
      },
    };
  } catch {
    return {
      title: "Agent IA",
      description: "Découvrez cet agent IA spécialisé sur AgenToolFlow.",
    };
  }
}

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
