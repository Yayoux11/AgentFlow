"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Check, Zap, BarChart3,
  Send, Loader2, AlertCircle, Lock,
  BookOpen, ChevronRight, History, ChevronDown,
  Download, Printer,
} from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import type { Agent, AgentRunResponse } from "@/lib/types";
import { usageGuides } from "@/lib/usage-guides";
import { useLang } from "@/context/LanguageContext";

export default function AgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: slug } = use(params);
  const { user } = useAuth();
  const { t } = useLang();
  const router = useRouter();

  const [agent, setAgent] = useState<Agent | null>(null);
  const [related, setRelated] = useState<Agent[]>([]);
  const [fetching, setFetching] = useState(true);

  // Run state (authenticated)
  const [prompt, setPrompt] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<AgentRunResponse | null>(null);
  const [runError, setRunError] = useState("");

  // Demo state (unauthenticated — B19)
  const DEMO_MAX = 3;
  const DEMO_KEY = "af_demo_count";
  const [demoPrompt, setDemoPrompt] = useState("");
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoResult, setDemoResult] = useState<AgentRunResponse | null>(null);
  const [demoError, setDemoError] = useState("");
  const [demoCount, setDemoCount] = useState(0);

  useEffect(() => {
    setDemoCount(parseInt(localStorage.getItem(DEMO_KEY) ?? "0", 10));
  }, []);

  const [subscription, setSubscription] = useState<{ plan: string } | null>(null);

  // History
  interface HistoryItem { id: string; prompt: string; response: string; input_tokens: number; output_tokens: number; created_at: string; }
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      import("@/lib/api-client").then(({ api }) =>
        api.get<{ plan: string }>("/subscriptions/me").then(setSubscription).catch(() => null)
      );
    }
  }, [user]);

  useEffect(() => {
    Promise.all([
      api.get<Agent>(`/agents/${slug}`),
      api.get<Agent[]>("/agents"),
    ])
      .then(([a, all]) => {
        setAgent(a);
        setRelated(all.filter((x) => x.id !== a.id && x.category === a.category).slice(0, 3));
      })
      .catch(() => router.push("/marketplace"))
      .finally(() => setFetching(false));
  }, [slug, router]);

  async function handleRun(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;
    if (!user) { router.push("/login"); return; }
    setRunning(true);
    setRunError("");
    setResult(null);
    try {
      const res = await api.post<AgentRunResponse>(`/agents/${slug}/run`, { prompt });
      setResult(res);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 403) setRunError(t("agent.error.403"));
        else if (err.status === 429) setRunError(t("agent.error.429"));
        else setRunError(err.message);
      } else {
        setRunError(t("agent.error.generic"));
      }
    } finally {
      setRunning(false);
    }
  }

  async function handleDemoRun(e: React.FormEvent) {
    e.preventDefault();
    if (!demoPrompt.trim() || demoCount >= DEMO_MAX) return;
    setDemoRunning(true);
    setDemoError("");
    setDemoResult(null);
    try {
      const res = await api.post<AgentRunResponse>(`/agents/${slug}/demo`, { prompt: demoPrompt });
      setDemoResult(res);
      const next = demoCount + 1;
      setDemoCount(next);
      localStorage.setItem(DEMO_KEY, String(next));
    } catch {
      setDemoError(t("agent.error.generic"));
    } finally {
      setDemoRunning(false);
    }
  }

  async function loadHistory() {
    if (historyLoading || history.length > 0) { setHistoryOpen((v) => !v); return; }
    setHistoryOpen(true);
    setHistoryLoading(true);
    try {
      const data = await api.get<HistoryItem[]>(`/agents/${slug}/history?limit=20`);
      setHistory(data);
    } catch { /* not authenticated or no history */ }
    finally { setHistoryLoading(false); }
  }

  async function exportCSV() {
    const token = typeof window !== "undefined" ? localStorage.getItem("af_access") : null;
    if (!token) return;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/agents/${slug}/history/export?format=csv`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agentflow_${slug}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function printAsPDF() {
    if (!agent || history.length === 0) return;
    const rows = history.map((item) => `
      <div class="item">
        <div class="meta">
          <span class="date">${new Date(item.created_at).toLocaleString("fr-FR")}</span>
          <span class="tokens">${item.input_tokens + item.output_tokens} tokens</span>
        </div>
        <div class="prompt"><strong>Vous :</strong> ${item.prompt.replace(/</g, "&lt;")}</div>
        <div class="response"><strong>${agent.name} :</strong> ${item.response.replace(/</g, "&lt;")}</div>
      </div>
    `).join("");

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html lang="fr"><head>
      <meta charset="UTF-8">
      <title>Historique — ${agent.name}</title>
      <style>
        body { font-family: system-ui, sans-serif; max-width: 780px; margin: 0 auto; padding: 32px 24px; color: #0f172a; }
        h1 { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
        .sub { color: #64748b; font-size: 13px; margin-bottom: 32px; }
        .item { border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 16px; break-inside: avoid; }
        .meta { display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; margin-bottom: 10px; }
        .prompt { background: #f8fafc; border-radius: 6px; padding: 10px 12px; font-size: 13px; margin-bottom: 8px; white-space: pre-wrap; }
        .response { background: #eef2ff; border-radius: 6px; padding: 10px 12px; font-size: 13px; white-space: pre-wrap; }
        @media print { body { padding: 0; } }
      </style>
    </head><body>
      <h1>${agent.icon} ${agent.name} — ${t("agent.history.title")}</h1>
      <p class="sub">Exporté le ${new Date().toLocaleDateString("fr-FR")} · ${history.length} échange(s)</p>
      ${rows}
    </body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
  }



  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  if (!agent) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Breadcrumb */}
      <div className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t("agent.home")}</Link>
            <span>/</span>
            <Link href="/marketplace" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t("nav.marketplace")}</Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-medium">{agent.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> {t("agent.back")}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left — main content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Agent header */}
            <div className="flex items-start gap-5">
              <div className="text-5xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-20 h-20 flex items-center justify-center flex-shrink-0">
                {agent.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{agent.name}</h1>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">{agent.category}</p>
                <div className="flex gap-1.5 flex-wrap">
                  {agent.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md">{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{t("agent.about")}</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{agent.long_description}</p>
            </section>

            {/* Features */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{t("agent.features")}</h2>
              <ul className="space-y-3">
                {agent.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-indigo-600" strokeWidth={2.5} />
                    </div>
                    <span className="text-slate-600 dark:text-slate-300 text-sm">{f}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Stats */}
            <section className="bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5">{t("agent.stats")}</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <Zap size={18} className="text-indigo-600" />, value: "<2s", label: t("agent.response_time") },
                  { icon: <BarChart3 size={18} className="text-indigo-600" />, value: "99.9%", label: t("agent.availability") },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="w-10 h-10 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl flex items-center justify-center mx-auto mb-2">{s.icon}</div>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{s.value}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Usage guide */}
            {usageGuides[slug] && (
              <section className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center gap-2">
                  <BookOpen size={18} className="text-indigo-600" />
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t("agent.guide")}</h2>
                </div>
                <div className="p-6 space-y-6 bg-white dark:bg-slate-900">
                  {/* Steps */}
                  <div>
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                      {t("agent.guide.steps")} {agent.name}
                    </p>
                    <ol className="space-y-2">
                      {usageGuides[slug].steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-5 h-5 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center mt-0.5">
                            {i + 1}
                          </span>
                          <span className="text-sm text-slate-600 dark:text-slate-300">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Examples */}
                  <div>
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                      {t("agent.guide.examples")}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {usageGuides[slug].examples.map((ex) => (
                        <button
                          key={ex.label}
                          onClick={() => {
                            setPrompt(ex.prompt);
                            document.getElementById("prompt-textarea")?.scrollIntoView({ behavior: "smooth", block: "center" });
                            document.getElementById("prompt-textarea")?.focus();
                          }}
                          className="group text-left border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                              {ex.label}
                            </span>
                            <ChevronRight size={14} className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{ex.prompt}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Try the agent */}
            <section className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-800 px-6 py-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t("agent.try.title")}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {user ? t("agent.try.logged_in") : t("agent.try.logged_out")}
                </p>
              </div>
              <div className="p-6 bg-white dark:bg-slate-900">
                {user ? (
                  <form onSubmit={handleRun} className="space-y-4">
                    <textarea
                      id="prompt-textarea"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={4}
                      placeholder={`Décrivez votre demande pour ${agent.name}…`}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    {runError && (
                      <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                        <span>{runError}</span>
                      </div>
                    )}
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={running || !prompt.trim()}
                        className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {running ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        {running ? t("agent.try.sending") : t("agent.try.send")}
                      </button>
                    </div>
                    {result && (
                      <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg">{agent.icon}</span>
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">{agent.name}</span>
                          <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">
                            {result.input_tokens + result.output_tokens} {t("agent.try.tokens")}
                          </span>
                        </div>
                        <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                          {result.response}
                        </div>
                      </div>
                    )}
                  </form>
                ) : demoCount >= DEMO_MAX ? (
                  <div className="flex flex-col items-center py-10 gap-5 text-center">
                    <Lock size={40} className="text-indigo-300 dark:text-indigo-600" />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-lg mb-1">{t("agent.demo.limit_title")}</p>
                      <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs">{t("agent.demo.limit_desc")}</p>
                    </div>
                    <div className="flex gap-3">
                      <Link href="/login" className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        {t("agent.try.login")}
                      </Link>
                      <Link href="/register" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
                        {t("agent.demo.signup_cta")}
                      </Link>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleDemoRun} className="space-y-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-full">
                        {t("agent.demo.badge")} — {DEMO_MAX - demoCount}/{DEMO_MAX} {t("agent.demo.remaining")}
                      </span>
                    </div>
                    <textarea
                      value={demoPrompt}
                      onChange={(e) => setDemoPrompt(e.target.value)}
                      rows={4}
                      placeholder={`Décrivez votre demande pour ${agent.name}…`}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    {demoError && (
                      <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                        <span>{demoError}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        <Link href="/register" className="text-indigo-600 hover:underline font-medium">{t("agent.demo.signup_inline")}</Link>
                        {" "}{t("agent.demo.signup_inline_suffix")}
                      </p>
                      <button
                        type="submit"
                        disabled={demoRunning || !demoPrompt.trim()}
                        className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {demoRunning ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        {demoRunning ? t("agent.try.sending") : t("agent.demo.run")}
                      </button>
                    </div>
                    {demoResult && (
                      <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg">{agent.icon}</span>
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">{agent.name}</span>
                          <span className="ml-auto text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">{t("agent.demo.mode")}</span>
                        </div>
                        <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                          {demoResult.response}
                        </div>
                        {demoCount >= DEMO_MAX && (
                          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <p className="text-xs text-slate-500">{t("agent.demo.limit_inline")}</p>
                            <Link href="/register" className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                              {t("agent.demo.signup_cta")}
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </form>
                )}
              </div>
            </section>

            {/* Conversation history */}
            {user && (
              <section className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <button
                    onClick={loadHistory}
                    className="flex items-center gap-2 flex-1 text-left hover:opacity-80 transition-opacity"
                  >
                    <History size={18} className="text-slate-500 dark:text-slate-400" />
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">{t("agent.history.title")}</h2>
                    <ChevronDown size={16} className={`text-slate-400 dark:text-slate-500 transition-transform ml-1 ${historyOpen ? "rotate-180" : ""}`} />
                  </button>
                  {history.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={exportCSV}
                        title="CSV"
                        className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <Download size={13} /> CSV
                      </button>
                      <button
                        onClick={printAsPDF}
                        title="PDF"
                        className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <Printer size={13} /> PDF
                      </button>
                    </div>
                  )}
                </div>

                {historyOpen && (
                  <div className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-900">
                    {historyLoading ? (
                      <div className="p-6 flex justify-center">
                        <Loader2 className="animate-spin text-indigo-500" size={24} />
                      </div>
                    ) : history.length === 0 ? (
                      <div className="p-6 text-center text-sm text-slate-400 dark:text-slate-500">
                        {t("agent.history.none")}
                      </div>
                    ) : (
                      history.map((item) => (
                        <div key={item.id} className="p-5">
                          <button
                            onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                            className="w-full text-left"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-1 flex-1">{item.prompt}</p>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-xs text-slate-400 dark:text-slate-500">
                                  {new Date(item.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                                </span>
                                <ChevronDown size={14} className={`text-slate-300 dark:text-slate-600 transition-transform ${expandedId === item.id ? "rotate-180" : ""}`} />
                              </div>
                            </div>
                            {item.input_tokens + item.output_tokens > 0 && (
                              <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                {item.input_tokens + item.output_tokens} {t("agent.try.tokens")}
                              </span>
                            )}
                          </button>

                          {expandedId === item.id && (
                            <div className="mt-3 space-y-3">
                              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3">
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{t("agent.history.your_msg")}</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{item.prompt}</p>
                              </div>
                              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl px-4 py-3">
                                <p className="text-xs font-semibold text-indigo-500 mb-1">{agent.name}</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{item.response}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Right — sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                {user && (user.is_superuser || subscription?.plan === "pro" || subscription?.plan === "enterprise") ? (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Check size={16} className="text-emerald-600" strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{t("agent.sidebar.access")}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {user.is_superuser ? t("agent.sidebar.admin") : `Plan ${subscription?.plan === "enterprise" ? "Enterprise" : "Pro"}`}
                        </p>
                      </div>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl px-4 py-3 mb-4">
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                        {t("agent.sidebar.unlocked")}
                      </p>
                    </div>
                    <ul className="space-y-2.5">
                      {[
                        t("agent.sidebar.unlimited"),
                        t("agent.sidebar.all_features"),
                        t("agent.sidebar.priority"),
                        t("agent.sidebar.updates"),
                      ].map((item) => (
                        <li key={item} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <Check size={13} className="text-emerald-500" strokeWidth={2.5} /> {item}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : user && subscription?.plan === "starter" ? (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Check size={16} className="text-indigo-600" strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{t("agent.sidebar.access")}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Plan Starter</p>
                      </div>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl px-4 py-3 mb-4">
                      <p className="text-xs text-indigo-700 dark:text-indigo-400 font-medium">
                        {t("agent.sidebar.starter_limit")}
                      </p>
                    </div>
                    <Link
                      href="/#pricing"
                      className="block w-full text-center py-2.5 px-4 rounded-xl border border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                    >
                      {t("agent.sidebar.upgrade_pro")}
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">{t("agent.sidebar.no_sub")}</p>

                    <Link
                      href="/register"
                      className="block w-full text-center bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors mb-3 text-sm"
                    >
                      {t("agent.sidebar.start_free")}
                    </Link>
                    <Link
                      href="/#pricing"
                      className="block w-full text-center border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      {t("agent.sidebar.see_plans")}
                    </Link>
                  </>
                )}
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
                <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wide mb-1">{t("agent.sidebar.category")}</p>
                <p className="text-sm text-indigo-900 dark:text-indigo-300 font-medium">{agent.category}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related agents */}
        {related.length > 0 && (
          <section className="mt-16 pt-10 border-t border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{t("agent.related")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/agents/${rel.slug}`}
                  className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-md transition-all"
                >
                  <div className="text-2xl mb-3">{rel.icon}</div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors text-sm">{rel.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">{rel.description}</p>
                  <div className="flex items-center justify-end">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{rel.price_monthly}€{t("mkt.per_month")}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
