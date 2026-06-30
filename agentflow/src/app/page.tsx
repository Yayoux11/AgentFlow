"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Star, Zap, Shield, BarChart3, Users, Clock, Globe } from "lucide-react";
import { agents } from "@/lib/agents-data";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api-client";
import type { Subscription } from "@/lib/types";

const features = [
  {
    icon: <Zap className="text-indigo-600" size={22} />,
    title: "Déploiement instantané",
    description:
      "Activez un agent en un clic. Aucune configuration technique requise, opérationnel en moins de 2 minutes.",
  },
  {
    icon: <Shield className="text-indigo-600" size={22} />,
    title: "Sécurité enterprise",
    description:
      "Vos données restent privées. Chiffrement end-to-end, conformité RGPD et hébergement européen.",
  },
  {
    icon: <BarChart3 className="text-indigo-600" size={22} />,
    title: "Analytics en temps réel",
    description:
      "Suivez les performances de chaque agent. ROI mesuré, rapports hebdomadaires, alertes personnalisées.",
  },
  {
    icon: <Users className="text-indigo-600" size={22} />,
    title: "Marketplace communautaire",
    description:
      "Achetez des agents créés par des experts ou vendez les vôtres. Un écosystème vivant et en croissance.",
  },
  {
    icon: <Clock className="text-indigo-600" size={22} />,
    title: "Disponible 24/7",
    description:
      "Vos agents ne dorment jamais. Automatisation continue, sans interruption, 365 jours par an.",
  },
  {
    icon: <Globe className="text-indigo-600" size={22} />,
    title: "Intégrations natives",
    description:
      "Connectez-vous à vos outils existants : Slack, Notion, Gmail, Salesforce, HubSpot et 50+ autres.",
  },
];

const plans = [
  {
    key: "starter",
    name: "Starter",
    price: 0,
    description: "Pour découvrir et tester les agents IA.",
    features: ["3 agents actifs", "1 000 requêtes/mois", "Support communauté", "Analytics de base"],
    cta: "Commencer gratuitement",
    href: "/register",
    highlight: false,
  },
  {
    key: "pro",
    name: "Pro",
    price: 29,
    description: "Pour les professionnels qui veulent aller plus loin.",
    features: [
      "Agents illimités",
      "50 000 requêtes/mois",
      "Support prioritaire",
      "Analytics avancés",
      "Accès API",
      "Intégrations premium",
    ],
    cta: "Commencer l'essai gratuit",
    href: "/marketplace",
    highlight: true,
  },
  {
    key: "enterprise",
    name: "Enterprise",
    price: 99,
    description: "Pour les équipes et organisations à grande échelle.",
    features: [
      "Tout du plan Pro",
      "Requêtes illimitées",
      "SLA 99.9%",
      "Support dédié 24/7",
      "Agents sur mesure",
      "Déploiement on-premise",
    ],
    cta: "Contacter les ventes",
    href: "/marketplace",
    highlight: false,
  },
];

const popularAgents = agents.filter((a) => a.popular).slice(0, 4);

export default function HomePage() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    if (user) {
      api.get<Subscription>("/subscriptions/me").then(setSubscription).catch(() => null);
    }
  }, [user]);

  const hasFullAccess =
    !!user && (user.is_superuser || subscription?.plan === "pro" || subscription?.plan === "enterprise");

  const activePlan = user?.is_superuser
    ? "enterprise"
    : subscription?.plan ?? null;

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-slate-50 to-white pt-20 pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.08)_0%,_transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-8 border border-indigo-100">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
            +50 agents disponibles dès aujourd&apos;hui
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
            Vos agents IA,
            <br />
            <span className="text-indigo-600">à la demande</span>
          </h1>

          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Abonnez-vous à des agents IA spécialisés ou achetez-en à l&apos;unité. Automatisez vos tâches
            répétitives, gagnez du temps et boostez votre productivité dès aujourd&apos;hui.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 text-base"
            >
              {hasFullAccess ? "Accéder à mes agents" : "Explorer les agents"}
              <ArrowRight size={18} />
            </Link>
            {!hasFullAccess && (
              <Link
                href="/#pricing"
                className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 px-7 py-3.5 rounded-xl font-semibold border border-slate-200 hover:border-slate-300 transition-all text-base bg-white"
              >
                Voir les tarifs
              </Link>
            )}
          </div>

          {/* Social proof */}
          <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 border-2 border-white -ml-1.5 first:ml-0"
                  />
                ))}
              </div>
              <span>
                <strong className="text-slate-900">2 400+</strong> utilisateurs actifs
              </span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
              ))}
              <span className="ml-1">
                <strong className="text-slate-900">4.8/5</strong> de satisfaction
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Popular agents */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-2">Tendances</p>
              <h2 className="text-3xl font-bold text-slate-900">Agents les plus populaires</h2>
            </div>
            <Link
              href="/marketplace"
              className="hidden sm:flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Voir tout <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {popularAgents.map((agent) => (
              <Link
                key={agent.id}
                href={`/agents/${agent.id}`}
                className="group bg-white rounded-2xl border border-slate-200 p-6 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50 transition-all"
              >
                <div className="text-3xl mb-4">{agent.icon}</div>
                <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                  {agent.name}
                </h3>
                <p className="text-sm text-slate-500 mb-4 leading-relaxed line-clamp-2">{agent.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    <span>{agent.rating}</span>
                    <span className="text-slate-300">·</span>
                    <span>{agent.reviews} avis</span>
                  </div>
                  {hasFullAccess ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                      <Check size={12} strokeWidth={2.5} /> Inclus
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-slate-900">{agent.price}€/mois</span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Link href="/marketplace" className="text-sm text-indigo-600 font-medium">
              Voir tous les agents →
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-2">
              Pourquoi AgentFlow
            </p>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Une plateforme pensée pour les professionnels qui veulent l&apos;efficacité de l&apos;IA sans la
              complexité.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-2">Tarifs</p>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Simple et transparent</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Commencez gratuitement, passez au Pro quand vous êtes prêt. Achetez aussi des agents à l&apos;unité.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => {
              const isActive = activePlan === plan.key;
              return (
                <div
                  key={plan.name}
                  className={`rounded-2xl border p-8 flex flex-col relative ${
                    plan.highlight
                      ? "border-indigo-500 bg-indigo-600 text-white shadow-xl shadow-indigo-200"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  {/* Active plan badge */}
                  {isActive && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Check size={11} strokeWidth={2.5} /> Plan actif
                    </div>
                  )}
                  {!isActive && plan.highlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
                      Recommandé
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className={`font-bold text-lg mb-1 ${plan.highlight ? "text-white" : "text-slate-900"}`}>
                      {plan.name}
                    </h3>
                    <p className={`text-sm mb-4 ${plan.highlight ? "text-indigo-200" : "text-slate-500"}`}>
                      {plan.description}
                    </p>
                    <div className="flex items-end gap-1">
                      <span className={`text-4xl font-extrabold ${plan.highlight ? "text-white" : "text-slate-900"}`}>
                        {plan.price === 0 ? "Gratuit" : `${plan.price}€`}
                      </span>
                      {plan.price > 0 && (
                        <span className={`text-sm mb-1.5 ${plan.highlight ? "text-indigo-200" : "text-slate-500"}`}>
                          /mois
                        </span>
                      )}
                    </div>
                  </div>

                  <ul className="flex-1 space-y-3 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm">
                        <Check
                          size={16}
                          className={plan.highlight ? "text-indigo-200" : "text-indigo-600"}
                          strokeWidth={2.5}
                        />
                        <span className={plan.highlight ? "text-indigo-100" : "text-slate-600"}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {isActive ? (
                    <Link
                      href="/dashboard"
                      className={`text-center py-3 px-6 rounded-xl font-semibold text-sm transition-all ${
                        plan.highlight
                          ? "bg-emerald-400 text-white hover:bg-emerald-300"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                      }`}
                    >
                      Accéder au dashboard
                    </Link>
                  ) : (
                    <Link
                      href={plan.href}
                      className={`text-center py-3 px-6 rounded-xl font-semibold text-sm transition-all ${
                        plan.highlight
                          ? "bg-white text-indigo-600 hover:bg-indigo-50"
                          : "bg-indigo-600 text-white hover:bg-indigo-700"
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-center text-sm text-slate-400 mt-6">
            Pas d&apos;engagement. Annulez à tout moment. Achat d&apos;agents à l&apos;unité disponible.
          </p>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            {hasFullAccess ? "Vos agents vous attendent." : "Prêt à automatiser avec l'IA ?"}
          </h2>
          <p className="text-indigo-200 text-lg mb-8 max-w-xl mx-auto">
            {hasFullAccess
              ? "Accédez à tous vos agents depuis le dashboard ou explorez de nouveaux outils sur la marketplace."
              : "Rejoignez 2 400+ professionnels qui ont déjà délégué leurs tâches à des agents IA."}
          </p>
          <Link
            href={hasFullAccess ? "/dashboard" : "/marketplace"}
            className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg text-base"
          >
            {hasFullAccess ? "Aller au dashboard" : "Explorer la marketplace"}
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
