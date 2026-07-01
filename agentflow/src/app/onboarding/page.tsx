"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Zap, ArrowRight, Check, Mail, BarChart3,
  FileText, Megaphone, Code2, Users, Sparkles, X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";

const ONBOARDING_KEY = "af_onboarding_done";

const CATEGORIES = [
  { label: "Productivité", icon: <FileText size={22} />, desc: "Emails, résumés, rapports" },
  { label: "Marketing", icon: <Megaphone size={22} />, desc: "Copies, campagnes, social" },
  { label: "Analyse de données", icon: <BarChart3 size={22} />, desc: "Insights, rapports, KPIs" },
  { label: "Développement", icon: <Code2 size={22} />, desc: "Code, revues, documentation" },
  { label: "Support client", icon: <Users size={22} />, desc: "Réponses, tickets, FAQ" },
];

const SAMPLE_AGENTS = [
  {
    id: "email-writer",
    slug: "email-craft",
    name: "EmailCraft",
    icon: "✉️",
    desc: "Rédige des emails professionnels percutants.",
    samplePrompt: "Écris un email de relance professionnel pour un prospect qui n'a pas répondu depuis 2 semaines.",
  },
  {
    id: "data-analyst",
    slug: "data-analyst",
    name: "DataAnalyst",
    icon: "📊",
    desc: "Analyse et explique vos données en langage clair.",
    samplePrompt: "Explique comment calculer le taux de churn et quelles métriques surveiller pour le réduire.",
  },
  {
    id: "content-writer",
    slug: "content-writer",
    name: "ContentWriter",
    icon: "✍️",
    desc: "Génère du contenu marketing engageant.",
    samplePrompt: "Rédige un post LinkedIn percutant sur le thème de la productivité au travail, avec un appel à l'action.",
  },
];

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const { t } = useLang();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState(0);

  useEffect(() => {
    if (!loading && !user) { router.replace("/login"); return; }
    if (typeof window !== "undefined" && localStorage.getItem(ONBOARDING_KEY)) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  function finish() {
    localStorage.setItem(ONBOARDING_KEY, "1");
    router.push("/dashboard");
  }

  function skip() {
    localStorage.setItem(ONBOARDING_KEY, "1");
    router.push("/dashboard");
  }

  if (loading || !user) return null;

  const firstName = user.full_name?.split(" ")[0] ?? user.email.split("@")[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-slate-900 dark:to-slate-900 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-white">
          <span className="bg-indigo-600 text-white rounded-lg p-1.5"><Zap size={16} strokeWidth={2.5} /></span>
          AgentFlow
        </div>
        <button onClick={skip} className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
          <X size={15} /> Passer l&apos;onboarding
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-3xl mx-auto px-6 mb-8">
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                s < step ? "bg-indigo-600 text-white" :
                s === step ? "bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-900" :
                "bg-slate-200 dark:bg-slate-700 text-slate-400"
              }`}>
                {s < step ? <Check size={14} strokeWidth={3} /> : s}
              </div>
              {s < 3 && <div className={`h-0.5 flex-1 rounded transition-all ${s < step ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700"}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-4">
        <div className="w-full max-w-2xl">

          {/* Step 1 — Welcome */}
          {step === 1 && (
            <div>
              <div className="text-center mb-10">
                <div className="text-5xl mb-4"><Sparkles className="inline text-indigo-500" size={48} /></div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
                  Bienvenue, {firstName} !
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                  Dites-nous ce qui vous intéresse le plus. On personnalisera votre expérience.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.label}
                    onClick={() => setSelectedCategory(cat.label)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                      selectedCategory === cat.label
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-200 dark:hover:border-indigo-700"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      selectedCategory === cat.label
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }`}>
                      {cat.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">{cat.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{cat.desc}</p>
                    </div>
                    {selectedCategory === cat.label && (
                      <Check size={18} className="text-indigo-600 ml-auto flex-shrink-0" strokeWidth={2.5} />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white px-7 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Continuer <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2 — Try an agent */}
          {step === 2 && (
            <div>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
                  Essayez un agent
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                  Choisissez un agent et lancez-le en un clic pour voir ce qu&apos;il peut faire pour vous.
                </p>
              </div>

              <div className="flex gap-3 mb-6 overflow-x-auto pb-1">
                {SAMPLE_AGENTS.map((agent, i) => (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgent(i)}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all ${
                      selectedAgent === i
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-200 dark:hover:border-indigo-700"
                    }`}
                  >
                    <span>{agent.icon}</span> {agent.name}
                  </button>
                ))}
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{SAMPLE_AGENTS[selectedAgent].icon}</span>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{SAMPLE_AGENTS[selectedAgent].name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{SAMPLE_AGENTS[selectedAgent].desc}</p>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-2">Exemple de prompt</span>
                  {SAMPLE_AGENTS[selectedAgent].samplePrompt}
                </div>
                <Link
                  href={`/agents/${SAMPLE_AGENTS[selectedAgent].slug}`}
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Tester cet agent <ArrowRight size={15} />
                </Link>
              </div>

              <div className="flex items-center justify-between">
                <button onClick={() => setStep(1)} className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  ← Retour
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white px-7 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Continuer <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Connect email */}
          {step === 3 && (
            <div>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail size={32} className="text-indigo-600" />
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
                  Automatisez vos emails
                </h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Connectez Gmail pour que vos agents traitent automatiquement vos emails entrants — réponses, résumés, relances.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-8">
                <ul className="space-y-3">
                  {[
                    "Réponses automatiques aux emails courants",
                    "Résumés de threads complexes",
                    "Relances commerciales programmées",
                    "Tri et catégorisation intelligente",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <div className="w-5 h-5 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check size={12} className="text-indigo-600" strokeWidth={2.5} />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/settings/integrations"
                  onClick={() => localStorage.setItem(ONBOARDING_KEY, "1")}
                  className="mt-6 flex items-center justify-center gap-2 w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                >
                  <Mail size={16} /> Connecter Gmail
                </Link>
              </div>

              <div className="flex items-center justify-between">
                <button onClick={() => setStep(2)} className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  ← Retour
                </button>
                <button
                  onClick={finish}
                  className="inline-flex items-center gap-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-7 py-3 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Passer cette étape → Dashboard
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
