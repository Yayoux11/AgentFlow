"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, Check, Star, Zap, Shield, BarChart3, Users, Clock, Globe,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { agents } from "@/lib/agents-data";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { api } from "@/lib/api-client";
import type { Subscription } from "@/lib/types";

const popularAgents = agents.filter((a) => a.popular).slice(0, 4);

const testimonials = [
  {
    name: "Sophie M.",
    role: "Directrice marketing, Lyon",
    avatar: "SM",
    content: "J'ai automatisé 80% de mes tâches de rédaction avec l'agent Email Writer. Je gagne 3h par jour.",
    rating: 5,
  },
  {
    name: "Thomas R.",
    role: "Développeur indépendant, Paris",
    avatar: "TR",
    content: "L'API est propre, la doc excellente. J'ai intégré 4 agents dans mon SaaS en moins d'une journée.",
    rating: 5,
  },
  {
    name: "Camille D.",
    role: "CEO, startup e-commerce",
    avatar: "CD",
    content: "Le plan Pro se rentabilise en une semaine. Les analytics me montrent exactement où l'IA fait la différence.",
    rating: 5,
  },
];

export default function HomePageClient() {
  const { user } = useAuth();
  const { t } = useLang();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      api.get<Subscription>("/subscriptions/me").then(setSubscription).catch(() => null);
    }
  }, [user]);

  const hasFullAccess =
    !!user && (user.is_superuser || subscription?.plan === "pro" || subscription?.plan === "enterprise");
  const activePlan = user?.is_superuser ? "enterprise" : subscription?.plan ?? null;

  const features = [
    { icon: <Zap className="text-indigo-600" size={22} />, title: t("feature.deploy.title"), description: t("feature.deploy.desc") },
    { icon: <Shield className="text-indigo-600" size={22} />, title: t("feature.security.title"), description: t("feature.security.desc") },
    { icon: <BarChart3 className="text-indigo-600" size={22} />, title: t("feature.analytics.title"), description: t("feature.analytics.desc") },
    { icon: <Users className="text-indigo-600" size={22} />, title: t("feature.marketplace.title"), description: t("feature.marketplace.desc") },
    { icon: <Clock className="text-indigo-600" size={22} />, title: t("feature.available.title"), description: t("feature.available.desc") },
    { icon: <Globe className="text-indigo-600" size={22} />, title: t("feature.integrations.title"), description: t("feature.integrations.desc") },
  ];

  const plans = [
    {
      key: "starter",
      name: t("plan.starter.name"),
      price: 0,
      description: t("plan.starter.desc"),
      features: ["3 agents actifs", "1 000 requêtes/mois", "Support communauté", "Analytics de base"],
      cta: t("plan.starter.cta"),
      href: "/register",
      highlight: false,
    },
    {
      key: "pro",
      name: t("plan.pro.name"),
      price: 29,
      description: t("plan.pro.desc"),
      features: ["Agents illimités", "50 000 requêtes/mois", "Support prioritaire", "Analytics avancés", "Accès API", "Intégrations premium"],
      cta: t("plan.pro.cta"),
      href: "/marketplace",
      highlight: true,
    },
    {
      key: "enterprise",
      name: t("plan.enterprise.name"),
      price: 99,
      description: t("plan.enterprise.desc"),
      features: ["Tout du plan Pro", "Requêtes illimitées", "SLA 99.9%", "Support dédié 24/7", "Agents sur mesure", "Déploiement on-premise"],
      cta: t("plan.enterprise.cta"),
      href: "/marketplace",
      highlight: false,
    },
  ];

  const faqs = [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") },
    { q: t("faq.q5"), a: t("faq.a5") },
  ];

  const howSteps = [
    { num: "01", title: t("how.step1.title"), desc: t("how.step1.desc") },
    { num: "02", title: t("how.step2.title"), desc: t("how.step2.desc") },
    { num: "03", title: t("how.step3.title"), desc: t("how.step3.desc") },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-900 pt-20 pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.08)_0%,_transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-8 border border-indigo-100 dark:border-indigo-800">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
            {t("hero.badge")}
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-6">
            {t("hero.title1")}
            <br />
            <span className="text-indigo-600">{t("hero.title2")}</span>
          </h1>

          <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t("hero.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 text-base"
            >
              {hasFullAccess ? t("hero.cta.access") : t("hero.cta.explore")}
              <ArrowRight size={18} />
            </Link>
            {!hasFullAccess && (
              <Link
                href="/#pricing"
                className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-7 py-3.5 rounded-xl font-semibold border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all text-base bg-white dark:bg-slate-800"
              >
                {t("hero.cta.pricing")}
              </Link>
            )}
          </div>

          <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 border-2 border-white dark:border-slate-900 -ml-1.5 first:ml-0" />
                ))}
              </div>
              <span><strong className="text-slate-900 dark:text-white">2 400+</strong> {t("hero.users")}</span>
            </div>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map((i) => (
                <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
              ))}
              <span className="ml-1"><strong className="text-slate-900 dark:text-white">4.8/5</strong> {t("hero.rating")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Popular agents */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-2">{t("section.trending")}</p>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t("section.popular")}</h2>
            </div>
            <Link href="/marketplace" className="hidden sm:flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              {t("section.view_all")} <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {popularAgents.map((agent) => (
              <Link
                key={agent.id}
                href={`/agents/${agent.id}`}
                className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:border-indigo-200 dark:hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-50 dark:hover:shadow-indigo-900/20 transition-all"
              >
                <div className="text-3xl mb-4">{agent.icon}</div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">{agent.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed line-clamp-2">{agent.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    <span>{agent.rating}</span>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span>{agent.reviews} avis</span>
                  </div>
                  {hasFullAccess ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                      <Check size={12} strokeWidth={2.5} /> {t("badge.included")}
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{agent.price}€/mois</span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 text-center sm:hidden">
            <Link href="/marketplace" className="text-sm text-indigo-600 font-medium">{t("section.view_all")} →</Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-2">{t("section.how_it_works")}</p>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{t("section.how_title")}</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">{t("section.how_subtitle")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howSteps.map((step, i) => (
              <div key={i} className="relative flex flex-col items-center text-center">
                {i < howSteps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] h-px border-t-2 border-dashed border-slate-300 dark:border-slate-600" />
                )}
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl font-extrabold mb-5 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40">
                  {step.num}
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-2">{t("section.why")}</p>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{t("section.all_you_need")}</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">{t("section.all_subtitle")}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950 rounded-xl flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-2">{t("section.testimonials")}</p>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t("section.testimonials_title")}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testi) => (
              <div key={testi.name} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-5">&quot;{testi.content}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                    {testi.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{testi.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{testi.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-2">{t("pricing.section")}</p>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{t("pricing.title")}</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">{t("pricing.subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => {
              const isActive = activePlan === plan.key;
              return (
                <div
                  key={plan.name}
                  className={`rounded-2xl border p-8 flex flex-col relative ${
                    plan.highlight
                      ? "border-indigo-500 bg-indigo-600 text-white shadow-xl shadow-indigo-200 dark:shadow-indigo-900/40"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  }`}
                >
                  {isActive && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Check size={11} strokeWidth={2.5} /> {t("pricing.active")}
                    </div>
                  )}
                  {!isActive && plan.highlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
                      {t("pricing.recommended")}
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className={`font-bold text-lg mb-1 ${plan.highlight ? "text-white" : "text-slate-900 dark:text-white"}`}>{plan.name}</h3>
                    <p className={`text-sm mb-4 ${plan.highlight ? "text-indigo-200" : "text-slate-500 dark:text-slate-400"}`}>{plan.description}</p>
                    <div className="flex items-end gap-1">
                      <span className={`text-4xl font-extrabold ${plan.highlight ? "text-white" : "text-slate-900 dark:text-white"}`}>
                        {plan.price === 0 ? t("pricing.free") : `${plan.price}€`}
                      </span>
                      {plan.price > 0 && (
                        <span className={`text-sm mb-1.5 ${plan.highlight ? "text-indigo-200" : "text-slate-500 dark:text-slate-400"}`}>/mois</span>
                      )}
                    </div>
                  </div>

                  <ul className="flex-1 space-y-3 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm">
                        <Check size={16} className={plan.highlight ? "text-indigo-200" : "text-indigo-600"} strokeWidth={2.5} />
                        <span className={plan.highlight ? "text-indigo-100" : "text-slate-600 dark:text-slate-300"}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {isActive ? (
                    <Link
                      href="/dashboard"
                      className={`text-center py-3 px-6 rounded-xl font-semibold text-sm transition-all ${
                        plan.highlight
                          ? "bg-emerald-400 text-white hover:bg-emerald-300"
                          : "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                      }`}
                    >
                      {t("pricing.go_dashboard")}
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
          <p className="text-center text-sm text-slate-400 mt-6">{t("pricing.no_commitment")}</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-2">{t("section.faq")}</p>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t("section.faq_title")}</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="font-semibold text-slate-900 dark:text-white text-sm">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp size={18} className="text-slate-400 flex-shrink-0" />
                    : <ChevronDown size={18} className="text-slate-400 flex-shrink-0" />
                  }
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-700 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            {hasFullAccess ? t("cta.title.access") : t("cta.title.default")}
          </h2>
          <p className="text-indigo-200 text-lg mb-8 max-w-xl mx-auto">
            {hasFullAccess ? t("cta.subtitle.access") : t("cta.subtitle.default")}
          </p>
          <Link
            href={hasFullAccess ? "/dashboard" : "/marketplace"}
            className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg text-base"
          >
            {hasFullAccess ? t("cta.btn.dashboard") : t("cta.btn.marketplace")}
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
