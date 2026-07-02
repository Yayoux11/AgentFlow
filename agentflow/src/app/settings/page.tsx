"use client";

import Link from "next/link";
import { Plug, Key, Webhook, BookOpen, GitBranch, Timer, Users, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const SECTIONS = [
  {
    group: "Compte",
    items: [
      {
        href: "/settings/integrations",
        icon: Plug,
        title: "Intégrations",
        description: "Connectez Gmail, Outlook et autres services pour activer l'envoi/lecture d'emails automatisés.",
        color: "text-blue-600",
        bg: "bg-blue-50 dark:bg-blue-900/20",
      },
      {
        href: "/settings/api-keys",
        icon: Key,
        title: "Clés API",
        description: "Générez des clés pour appeler l'API AgenToolFlow depuis vos propres applications.",
        color: "text-amber-600",
        bg: "bg-amber-50 dark:bg-amber-900/20",
      },
    ],
  },
  {
    group: "Automatisation",
    items: [
      {
        href: "/settings/webhook",
        icon: Webhook,
        title: "Webhook sortant",
        description: "Recevez une notification HTTP à chaque fois qu'un agent produit une réponse.",
        color: "text-purple-600",
        bg: "bg-purple-50 dark:bg-purple-900/20",
      },
      {
        href: "/settings/triggers",
        icon: Timer,
        title: "Triggers",
        description: "Webhooks entrants et runs planifiés pour déclencher vos agents automatiquement.",
        color: "text-emerald-600",
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
      },
    ],
  },
  {
    group: "Intelligence",
    items: [
      {
        href: "/settings/knowledge",
        icon: BookOpen,
        title: "Base de connaissances",
        description: "Importez des documents PDF ou texte que vos agents consulteront via RAG.",
        color: "text-indigo-600",
        bg: "bg-indigo-50 dark:bg-indigo-900/20",
      },
      {
        href: "/settings/routes",
        icon: GitBranch,
        title: "Routage IA",
        description: "Définissez des règles d'intention pour router automatiquement vos messages vers le bon agent.",
        color: "text-rose-600",
        bg: "bg-rose-50 dark:bg-rose-900/20",
      },
    ],
  },
  {
    group: "Organisation",
    items: [
      {
        href: "/team",
        icon: Users,
        title: "Équipe",
        description: "Invitez des collaborateurs et gérez l'accès partagé aux agents de votre organisation.",
        color: "text-teal-600",
        bg: "bg-teal-50 dark:bg-teal-900/20",
      },
    ],
  },
];

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Paramètres</h1>
        {user && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Compte : <span className="font-medium text-slate-700 dark:text-slate-300">{user.email}</span>
          </p>
        )}
      </div>

      <div className="space-y-8">
        {SECTIONS.map((section) => (
          <div key={section.group}>
            <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              {section.group}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {section.items.map(({ href, icon: Icon, title, description, color, bg }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-start gap-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-sm transition-all"
                >
                  <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon size={18} className={color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {title}
                      </p>
                      <ArrowRight size={14} className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
