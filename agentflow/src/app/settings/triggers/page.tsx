"use client";

import { useEffect, useState } from "react";
import { Webhook, Clock, Plus, Trash2, Copy, Check, Loader2, AlertCircle, ChevronDown } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import type { Agent, WebhookTrigger, ScheduledRun } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const CRON_EXAMPLES = [
  { label: "Tous les jours à 9h", value: "0 9 * * *" },
  { label: "Tous les lundis à 8h", value: "0 8 * * 1" },
  { label: "Toutes les heures", value: "0 * * * *" },
  { label: "1er du mois à minuit", value: "0 0 1 * *" },
];

export default function TriggersPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookTrigger[]>([]);
  const [scheduled, setScheduled] = useState<ScheduledRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Webhook form
  const [whAgent, setWhAgent] = useState("");
  const [whName, setWhName] = useState("");
  const [whSaving, setWhSaving] = useState(false);
  const [whError, setWhError] = useState("");

  // Scheduled form
  const [scAgent, setScAgent] = useState("");
  const [scName, setScName] = useState("");
  const [scCron, setScCron] = useState("0 9 * * *");
  const [scPrompt, setScPrompt] = useState("");
  const [scSaving, setScSaving] = useState(false);
  const [scError, setScError] = useState("");

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    Promise.all([
      api.get<Agent[]>("/agents"),
      api.get<WebhookTrigger[]>("/triggers/webhooks"),
      api.get<ScheduledRun[]>("/triggers/scheduled"),
    ]).then(([a, w, s]) => {
      setAgents(a);
      setWebhooks(w);
      setScheduled(s);
      if (a.length > 0) { setWhAgent(a[0].slug); setScAgent(a[0].slug); }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user, router]);

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function createWebhook(e: React.FormEvent) {
    e.preventDefault();
    if (!whName.trim() || !whAgent) return;
    setWhSaving(true);
    setWhError("");
    try {
      const wh = await api.post<WebhookTrigger>("/triggers/webhooks", { agent_slug: whAgent, name: whName });
      setWebhooks((prev) => [wh, ...prev]);
      setWhName("");
    } catch (err) {
      setWhError(err instanceof ApiError ? err.message : "Erreur");
    } finally {
      setWhSaving(false);
    }
  }

  async function deleteWebhook(id: string) {
    await api.delete(`/triggers/webhooks/${id}`);
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
  }

  async function createScheduled(e: React.FormEvent) {
    e.preventDefault();
    if (!scName.trim() || !scAgent || !scCron.trim() || !scPrompt.trim()) return;
    setScSaving(true);
    setScError("");
    try {
      const run = await api.post<ScheduledRun>("/triggers/scheduled", {
        agent_slug: scAgent,
        name: scName,
        cron_expression: scCron,
        prompt_template: scPrompt,
      });
      setScheduled((prev) => [run, ...prev]);
      setScName(""); setScPrompt("");
    } catch (err) {
      setScError(err instanceof ApiError ? err.message : "Erreur");
    } finally {
      setScSaving(false);
    }
  }

  async function toggleScheduled(id: string, current: boolean) {
    const updated = await api.patch<ScheduledRun>(`/triggers/scheduled/${id}`, { is_active: !current });
    setScheduled((prev) => prev.map((s) => (s.id === id ? updated : s)));
  }

  async function deleteScheduled(id: string) {
    await api.delete(`/triggers/scheduled/${id}`);
    setScheduled((prev) => prev.filter((s) => s.id !== id));
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Triggers</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Déclenchez vos agents depuis des systèmes externes (webhook) ou sur un planning (cron).
          </p>
        </div>

        {/* ---- Webhook Triggers ---- */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-700">
            <Webhook size={20} className="text-indigo-600" />
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">Webhooks</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">POST vers une URL secrète pour lancer un agent</p>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {/* Create form */}
            <form onSubmit={createWebhook} className="flex gap-3 flex-wrap">
              <input
                value={whName}
                onChange={(e) => setWhName(e.target.value)}
                placeholder="Nom du trigger"
                className="flex-1 min-w-[160px] px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select
                value={whAgent}
                onChange={(e) => setWhAgent(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {agents.map((a) => (
                  <option key={a.slug} value={a.slug}>{a.icon} {a.name}</option>
                ))}
              </select>
              <button
                type="submit"
                disabled={whSaving || !whName.trim()}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {whSaving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Créer
              </button>
              {whError && <p className="w-full text-xs text-red-500">{whError}</p>}
            </form>

            {/* List */}
            {webhooks.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">Aucun webhook créé</p>
            ) : (
              <div className="space-y-3">
                {webhooks.map((wh) => {
                  const url = `${BACKEND_URL}/triggers/fire/${wh.secret_token}`;
                  return (
                    <div key={wh.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">{wh.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Agent : {agents.find((a) => a.slug === wh.agent_slug)?.name ?? wh.agent_slug}
                            {wh.last_triggered_at && ` · Dernier déclenchement : ${new Date(wh.last_triggered_at).toLocaleDateString("fr-FR")}`}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteWebhook(wh.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 rounded-lg px-3 py-2">
                        <code className="text-xs text-slate-600 dark:text-slate-400 flex-1 truncate">{url}</code>
                        <button
                          onClick={() => copyToClipboard(url, wh.id)}
                          className="flex-shrink-0 text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                          {copiedId === wh.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                        Payload: <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">{`{"prompt": "..."}`}</code>
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ---- Scheduled Runs ---- */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-700">
            <Clock size={20} className="text-indigo-600" />
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">Runs planifiés</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Lancez un agent automatiquement selon un planning cron</p>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {/* Create form */}
            <form onSubmit={createScheduled} className="space-y-3">
              <div className="flex gap-3 flex-wrap">
                <input
                  value={scName}
                  onChange={(e) => setScName(e.target.value)}
                  placeholder="Nom du run"
                  className="flex-1 min-w-[160px] px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <select
                  value={scAgent}
                  onChange={(e) => setScAgent(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {agents.map((a) => (
                    <option key={a.slug} value={a.slug}>{a.icon} {a.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 flex-wrap items-center">
                <input
                  value={scCron}
                  onChange={(e) => setScCron(e.target.value)}
                  placeholder="Expression cron"
                  className="flex-1 min-w-[160px] px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
                <div className="flex gap-1.5 flex-wrap">
                  {CRON_EXAMPLES.map((ex) => (
                    <button
                      key={ex.value}
                      type="button"
                      onClick={() => setScCron(ex.value)}
                      className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 transition-colors"
                    >
                      {ex.label}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={scPrompt}
                onChange={(e) => setScPrompt(e.target.value)}
                rows={2}
                placeholder="Prompt à envoyer à l'agent à chaque exécution…"
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={scSaving || !scName.trim() || !scPrompt.trim()}
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {scSaving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  Planifier
                </button>
              </div>
              {scError && <p className="text-xs text-red-500">{scError}</p>}
            </form>

            {/* List */}
            {scheduled.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">Aucun run planifié</p>
            ) : (
              <div className="space-y-3">
                {scheduled.map((run) => (
                  <div key={run.id} className={`border rounded-xl p-4 ${run.is_active ? "border-slate-200 dark:border-slate-700" : "border-slate-100 dark:border-slate-800 opacity-60"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">{run.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {agents.find((a) => a.slug === run.agent_slug)?.name ?? run.agent_slug}
                          {" · "}<code className="bg-slate-100 dark:bg-slate-800 px-1 rounded font-mono">{run.cron_expression}</code>
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-1">{run.prompt_template}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => toggleScheduled(run.id, run.is_active)}
                          className={`text-xs px-2 py-1 rounded-lg font-medium transition-colors ${
                            run.is_active
                              ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-red-50 hover:text-red-600"
                              : "bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"
                          }`}
                        >
                          {run.is_active ? "Actif" : "Inactif"}
                        </button>
                        <button
                          onClick={() => deleteScheduled(run.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3">
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Les runs planifiés sont enregistrés mais l&apos;exécution automatique via APScheduler sera activée dans la prochaine mise à jour.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
