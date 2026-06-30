"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail, Plug, Trash2, Plus, Play, Pause, CheckCircle,
  AlertCircle, Loader2, Clock, ChevronDown, X,
} from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";

interface Integration {
  id: string;
  provider: "gmail" | "outlook";
  email_address: string;
  is_active: boolean;
  created_at: string;
}

interface Rule {
  id: string;
  integration_id: string;
  agent_slug: string;
  name: string;
  trigger: string;
  trigger_config: Record<string, unknown>;
  action: string;
  action_config: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
}

interface Job {
  id: string;
  email_id: string;
  subject: string;
  from_address: string;
  action_taken: string;
  ai_response: string | null;
  processed_at: string;
}

const PROVIDER_LABELS: Record<string, string> = { gmail: "Gmail", outlook: "Outlook" };
const ACTION_LABELS: Record<string, string> = { draft: "Créer un brouillon", send: "Envoyer automatiquement" };
const TRIGGER_LABELS: Record<string, string> = {
  new_email: "Tous les nouveaux emails",
  keyword: "Si l'objet/contenu contient...",
  sender: "Si l'expéditeur est...",
};
const JOB_COLORS: Record<string, string> = {
  drafted: "bg-blue-50 text-blue-700",
  sent: "bg-emerald-50 text-emerald-700",
  skipped: "bg-slate-100 text-slate-500",
  error: "bg-red-50 text-red-700",
};

function RuleModal({
  integrationId,
  onClose,
  onSaved,
}: {
  integrationId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState("new_email");
  const [keywords, setKeywords] = useState("");
  const [senders, setSenders] = useState("");
  const [action, setAction] = useState("draft");
  const [promptTemplate, setPromptTemplate] = useState(
    "Rédige une réponse professionnelle et concise à cet email."
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!name.trim()) { setError("Donnez un nom à cette règle."); return; }
    setSaving(true);
    setError("");
    const trigger_config: Record<string, unknown> = {};
    if (trigger === "keyword") trigger_config.keywords = keywords.split(",").map((k) => k.trim()).filter(Boolean);
    if (trigger === "sender") trigger_config.senders = senders.split(",").map((s) => s.trim()).filter(Boolean);

    try {
      await api.post(`/integrations/${integrationId}/rules`, {
        agent_slug: "email-writer",
        name: name.trim(),
        trigger,
        trigger_config,
        action,
        action_config: { prompt_template: promptTemplate },
      });
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">Nouvelle règle</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nom de la règle</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex : Répondre au support client"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Déclencheur</label>
            <div className="relative">
              <select
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
              >
                {Object.entries(TRIGGER_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {trigger === "keyword" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Mots-clés <span className="text-slate-400">(séparés par des virgules)</span>
              </label>
              <input
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="facture, urgent, relance"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {trigger === "sender" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Expéditeurs <span className="text-slate-400">(séparés par des virgules)</span>
              </label>
              <input
                value={senders}
                onChange={(e) => setSenders(e.target.value)}
                placeholder="client@exemple.com, @entreprise.fr"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Action</label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(ACTION_LABELS).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setAction(k)}
                  className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    action === k
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            {action === "send" && (
              <p className="text-xs text-amber-600 mt-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                L&apos;agent enverra les emails automatiquement sans validation humaine.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Instruction pour l&apos;agent</label>
            <textarea
              value={promptTemplate}
              onChange={(e) => setPromptTemplate(e.target.value)}
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle size={15} /> {error}
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2.5 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50">
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-60 flex items-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Créer la règle
          </button>
        </div>
      </div>
    </div>
  );
}

export default function IntegrationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [rules, setRules] = useState<Record<string, Rule[]>>({});
  const [jobs, setJobs] = useState<Record<string, Job[]>>({});
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState("");
  const [ruleModalFor, setRuleModalFor] = useState<string | null>(null);
  const [expandedJobs, setExpandedJobs] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");
    if (connected) setToast(`${PROVIDER_LABELS[connected] ?? connected} connecté avec succès !`);
    if (error) setToast(`Erreur de connexion OAuth : ${error}`);
    if (connected || error) setTimeout(() => setToast(""), 4000);
  }, [searchParams]);

  const loadData = useCallback(async () => {
    try {
      const list = await api.get<Integration[]>("/integrations");
      setIntegrations(list);
      const rulesMap: Record<string, Rule[]> = {};
      for (const intg of list) {
        rulesMap[intg.id] = await api.get<Rule[]>(`/integrations/${intg.id}/rules`);
      }
      setRules(rulesMap);
    } catch {
      // ignore
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => { if (user) loadData(); }, [user, loadData]);

  async function connectProvider(provider: "gmail" | "outlook") {
    try {
      const { auth_url } = await api.get<{ auth_url: string }>(`/integrations/${provider}/auth-url`);
      window.location.href = auth_url;
    } catch (e) {
      setToast(e instanceof ApiError ? e.message : "Erreur lors de la connexion OAuth");
      setTimeout(() => setToast(""), 4000);
    }
  }

  async function deleteIntegration(id: string) {
    await api.delete(`/integrations/${id}`);
    loadData();
  }

  async function toggleRule(intgId: string, rule: Rule) {
    await api.patch(`/integrations/${intgId}/rules/${rule.id}`, { is_active: !rule.is_active });
    loadData();
  }

  async function deleteRule(intgId: string, ruleId: string) {
    await api.delete(`/integrations/${intgId}/rules/${ruleId}`);
    loadData();
  }

  async function loadJobs(intgId: string) {
    if (expandedJobs === intgId) { setExpandedJobs(null); return; }
    const data = await api.get<Job[]>(`/integrations/${intgId}/jobs`);
    setJobs((prev) => ({ ...prev, [intgId]: data }));
    setExpandedJobs(intgId);
  }

  const gmailConnected = integrations.find((i) => i.provider === "gmail");
  const outlookConnected = integrations.find((i) => i.provider === "outlook");

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-sm px-5 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <CheckCircle size={15} className="text-emerald-400" /> {toast}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900">Intégrations email</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Connectez votre boîte mail et laissez vos agents IA gérer vos emails automatiquement.
          </p>
        </div>

        {/* Connect cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {/* Gmail */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-xl">📧</div>
              <div>
                <p className="font-semibold text-slate-900">Gmail</p>
                <p className="text-xs text-slate-500">Google Workspace</p>
              </div>
              {gmailConnected && (
                <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  <CheckCircle size={11} /> Connecté
                </span>
              )}
            </div>
            {gmailConnected ? (
              <div className="space-y-2">
                <p className="text-xs text-slate-500 truncate">{gmailConnected.email_address}</p>
                <button
                  onClick={() => deleteIntegration(gmailConnected.id)}
                  className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                >
                  <Trash2 size={12} /> Déconnecter
                </button>
              </div>
            ) : (
              <button
                onClick={() => connectProvider("gmail")}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plug size={15} /> Connecter Gmail
              </button>
            )}
          </div>

          {/* Outlook */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl">📨</div>
              <div>
                <p className="font-semibold text-slate-900">Outlook</p>
                <p className="text-xs text-slate-500">Microsoft 365</p>
              </div>
              {outlookConnected && (
                <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  <CheckCircle size={11} /> Connecté
                </span>
              )}
            </div>
            {outlookConnected ? (
              <div className="space-y-2">
                <p className="text-xs text-slate-500 truncate">{outlookConnected.email_address}</p>
                <button
                  onClick={() => deleteIntegration(outlookConnected.id)}
                  className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                >
                  <Trash2 size={12} /> Déconnecter
                </button>
              </div>
            ) : (
              <button
                onClick={() => connectProvider("outlook")}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plug size={15} /> Connecter Outlook
              </button>
            )}
          </div>
        </div>

        {/* Rules per integration */}
        {fetching ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin text-indigo-600" size={28} /></div>
        ) : integrations.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Mail size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Connectez une boîte mail pour créer des règles automatiques.</p>
          </div>
        ) : (
          integrations.map((intg) => (
            <div key={intg.id} className="bg-white rounded-2xl border border-slate-200 mb-5">
              {/* Integration header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{PROVIDER_LABELS[intg.provider]} — {intg.email_address}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Polling toutes les 5 minutes</p>
                </div>
                <button
                  onClick={() => setRuleModalFor(intg.id)}
                  className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus size={15} /> Nouvelle règle
                </button>
              </div>

              {/* Rules list */}
              <div className="divide-y divide-slate-100">
                {(rules[intg.id] ?? []).length === 0 ? (
                  <div className="px-6 py-8 text-center text-sm text-slate-400">
                    Aucune règle — créez-en une pour automatiser votre boîte mail.
                  </div>
                ) : (
                  (rules[intg.id] ?? []).map((rule) => (
                    <div key={rule.id} className="px-6 py-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{rule.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {TRIGGER_LABELS[rule.trigger] ?? rule.trigger} → {ACTION_LABELS[rule.action] ?? rule.action}
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${rule.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                        {rule.is_active ? "Actif" : "En pause"}
                      </span>
                      <button
                        onClick={() => toggleRule(intg.id, rule)}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
                        title={rule.is_active ? "Mettre en pause" : "Activer"}
                      >
                        {rule.is_active ? <Pause size={14} /> : <Play size={14} />}
                      </button>
                      <button
                        onClick={() => deleteRule(intg.id, rule.id)}
                        className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Job history toggle */}
              <div className="px-6 py-3 border-t border-slate-100">
                <button
                  onClick={() => loadJobs(intg.id)}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <Clock size={12} />
                  {expandedJobs === intg.id ? "Masquer l'historique" : "Voir l'historique des emails traités"}
                </button>
              </div>

              {expandedJobs === intg.id && (
                <div className="border-t border-slate-100">
                  {(jobs[intg.id] ?? []).length === 0 ? (
                    <p className="px-6 py-6 text-xs text-slate-400 text-center">Aucun email traité pour l'instant.</p>
                  ) : (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400">
                          <th className="px-6 py-2 text-left font-medium">Date</th>
                          <th className="px-6 py-2 text-left font-medium">De</th>
                          <th className="px-6 py-2 text-left font-medium">Objet</th>
                          <th className="px-6 py-2 text-left font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(jobs[intg.id] ?? []).map((job) => (
                          <tr key={job.id} className="hover:bg-slate-50">
                            <td className="px-6 py-2.5 text-slate-400 whitespace-nowrap">
                              {new Date(job.processed_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </td>
                            <td className="px-6 py-2.5 text-slate-600 max-w-[140px] truncate">{job.from_address}</td>
                            <td className="px-6 py-2.5 text-slate-700 max-w-[200px] truncate">{job.subject}</td>
                            <td className="px-6 py-2.5">
                              <span className={`px-2 py-0.5 rounded-full font-medium ${JOB_COLORS[job.action_taken] ?? "bg-slate-100 text-slate-500"}`}>
                                {job.action_taken}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {ruleModalFor && (
        <RuleModal
          integrationId={ruleModalFor}
          onClose={() => setRuleModalFor(null)}
          onSaved={loadData}
        />
      )}
    </div>
  );
}
