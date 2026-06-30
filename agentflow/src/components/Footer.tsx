import Link from "next/link";
import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-slate-900 mb-3">
              <span className="bg-indigo-600 text-white rounded-lg p-1.5">
                <Zap size={16} strokeWidth={2.5} />
              </span>
              AgentFlow
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed">
              La plateforme SaaS d'agents IA pour automatiser votre activité.
            </p>
          </div>

          {/* Produit */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Produit</h3>
            <ul className="space-y-2">
              {[
                { href: "/marketplace", label: "Marketplace" },
                { href: "/#features", label: "Fonctionnalités" },
                { href: "/#pricing", label: "Tarifs" },
                { href: "/dashboard", label: "Dashboard" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ressources */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Ressources</h3>
            <ul className="space-y-2">
              {["Documentation", "API", "Changelog", "Status"].map((l) => (
                <li key={l}>
                  <span className="text-sm text-slate-500 cursor-pointer hover:text-slate-900 transition-colors">
                    {l}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Entreprise */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Entreprise</h3>
            <ul className="space-y-2">
              {["À propos", "Blog", "Partenaires", "Contact"].map((l) => (
                <li key={l}>
                  <span className="text-sm text-slate-500 cursor-pointer hover:text-slate-900 transition-colors">
                    {l}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400">© 2026 AgentFlow. Tous droits réservés.</p>
          <div className="flex gap-6">
            {["Confidentialité", "CGU", "Cookies"].map((l) => (
              <span key={l} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
