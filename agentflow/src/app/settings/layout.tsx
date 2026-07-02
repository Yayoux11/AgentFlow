"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plug, Key, Webhook, BookOpen, GitBranch, Timer, Users, Settings } from "lucide-react";

const NAV = [
  {
    label: "Compte",
    items: [
      { href: "/settings/integrations", icon: Plug, label: "Intégrations" },
      { href: "/settings/api-keys", icon: Key, label: "Clés API" },
    ],
  },
  {
    label: "Automatisation",
    items: [
      { href: "/settings/webhook", icon: Webhook, label: "Webhook sortant" },
      { href: "/settings/triggers", icon: Timer, label: "Triggers" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { href: "/settings/knowledge", icon: BookOpen, label: "Base de connaissances" },
      { href: "/settings/routes", icon: GitBranch, label: "Routage IA" },
    ],
  },
  {
    label: "Organisation",
    items: [
      { href: "/team", icon: Users, label: "Équipe" },
    ],
  },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">

          {/* Sidebar */}
          <aside className="hidden lg:flex flex-col w-56 flex-shrink-0">
            <div className="flex items-center gap-2 mb-6 px-2">
              <Settings size={16} className="text-slate-400" />
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Paramètres
              </span>
            </div>

            <nav className="space-y-5">
              {NAV.map((group) => (
                <div key={group.label}>
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-1.5">
                    {group.label}
                  </p>
                  <div className="space-y-0.5">
                    {group.items.map(({ href, icon: Icon, label }) => {
                      const active = pathname === href || pathname.startsWith(href + "/");
                      return (
                        <Link
                          key={href}
                          href={href}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            active
                              ? "bg-indigo-600 text-white"
                              : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                          }`}
                        >
                          <Icon size={15} />
                          {label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
