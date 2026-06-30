"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail, Plug, Trash2, Plus, Play, Pause, CheckCircle,
  AlertCircle, Loader2, Clock, ChevronDown, X,
} from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";

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
const JOB_COLORS: Record<string, string> = {
  drafted: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  sent: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  skipped: "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400",
  error: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
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
  const { t } = useLang();
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

  const TRIGGER_LABELS: Record<string, string> = {
    new_email: t("intg.trigger.new_email"),
    keyword: t("intg.trigger.keyword"),
    sender: t("intg.trigger.sender"),
  };
  const ACTION_LABELS: Record<string, string> = {
    draft: t("intg.action.draft"),
    send: t("intg.action.send"),
  };

  async function handleSave() {
    if (!name.trim()) { setError(t("intg.rule.name_required")); return; }
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
      setError(e instanceof ApiError ? e.message : t("intg.rule.error"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="font-bold text-slate-900 dark:text-white">{t("intg.rule.title")}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t("intg.rule.name")}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("intg.rule.name_placeholder")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t("intg.rule.trigger")}</label>
            <div className="relative">
              <select
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
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
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {t("intg.rule.keywords")} <span className="text-slate-400">{t("intg.rule.keywords_hint")}</span>
              </label>
              <input
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder={t("intg.rule.keywords_placeholder")}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {trigger === "sender" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {t("intg.rule.senders")} <span className="text-slate-400">{t("intg.rule.senders_hint")}</span>
              </label>
              <input
                value={senders}
                onChange={(e) => setSenders(e.target.value)}
                placeholder={t("intg.rule.senders_placeholder")}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t("intg.rule.action")}</label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(ACTION_LABELS).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setAction(k)}
                  className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    action === k
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400"
                      : "border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            {action === "send" && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg px-3 py-2">
                {t("intg.rule.send_warning")}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t("intg.rule.instruction")}</label>
            <textarea
              value={promptTemplate}
              onChange={(e) => setPromptTemplate(e.target.value)}
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
              <AlertCircle size={15} /> {error}
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700">
            {t("intg.rule.cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-60 flex items-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {t("intg.rule.save")}
          </button>
        </div>
      </div>
    </div>
  );
}

function SearchParamsHandler({ onToast, t }: { onToast: (msg: string) => void; t: (k: TranslationKey) => string }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");
    if (connected) onToast(`${PROVIDER_LABELS[connected] ?? connected} ${t("intg.connected_success")}`);
    if (error) onToast(`${t("intg.oauth_error")} ${error}`);
  }, [searchParams, onToast, t]);
  return null;
}

export default function IntegrationsPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLang();
  const router = useRouter();

  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [rules, setRules] = useState<Record<string, Rule[]>>({});
  const [jobs, setJobs] = useState<Record<string, Job[]>>({});
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState("");
  const [ruleModalFor, setRuleModalFor] = useState<string | null>(null);
  const [expandedJobs, setExpandedJobs] = useState<string | null>(null);

  const TRIGGER_LABELS: Record<string, string> = {
    new_email: t("intg.trigger.new_email"),
    keyword: t("intg.trigger.keyword"),
    sender: t("intg.trigger.sender"),
  };
  const ACTION_LABELS: Record<string, string> = {
    draft: t("intg.action.draft"),
    send: t("intg.action.send"),
  };

  const handleToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

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
      setToast(e instanceof ApiError ? e.message : `${t("intg.oauth_error")} unknown`);
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Suspense fallback={null}>
        <SearchParamsHandler onToast={handleToast} t={t} />
      </Suspense>
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-sm px-5 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <CheckCircle size={15} className="text-emerald-400" /> {toast}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{t("intg.title")}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            {t("intg.subtitle")}
          </p>
        </div>

        {/* Connect cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {/* Gmail */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center text-xl">📧</div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Gmail</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t("intg.gmail_workspace")}</p>
              </div>
              {gmailConnected && (
                <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full">
                  <CheckCircle size={11} /> {t("intg.connected")}
                </span>
              )}
            </div>
            {gmailConnected ? (
              <div className="space-y-2">
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{gmailConnected.email_address}</p>
                <button
                  onClick={() => deleteIntegration(gmailConnected.id)}
                  className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                >
                  <Trash2 size={12} /> {t("intg.disconnect")}
                </button>
              </div>
            ) : (
              <button
                onClick={() => connectProvider("gmail")}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plug size={15} /> {t("intg.connect_gmail")}
              </button>
            )}
          </div>

          {/* Outlook */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-xl">📨</div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Outlook</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t("intg.outlook_ms")}</p>
              </div>
              {outlookConnected && (
                <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full">
                  <CheckCircle size={11} /> {t("intg.connected")}
                </span>
              )}
            </div>
            {outlookConnected ? (
              <div className="space-y-2">
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{outlookConnected.email_address}</p>
                <button
                  onClick={() => deleteIntegration(outlookConnected.id)}
                  className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                >
                  <Trash2 size={12} /> {t("intg.disconnect")}
                </button>
              </div>
            ) : (
              <button
                onClick={() => connectProvider("outlook")}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plug size={15} /> {t("intg.connect_outlook")}
              </button>
            )}
          </div>
        </div>

        {/* Rules per integration */}
        {fetching ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin text-indigo-600" size={28} /></div>
        ) : integrations.length === 0 ? (
          <div className="text-center py-16 text-slate-400 dark:text-slate-500">
            <Mail size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t("intg.no_integrations")}</p>
          </div>
        ) : (
          integrations.map((intg) => (
            <div key={intg.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 mb-5">
              {/* Integration header */}
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{PROVIDER_LABELS[intg.provider]} — {intg.email_address}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t("intg.polling")}</p>
                </div>
                <button
                  onClick={() => setRuleModalFor(intg.id)}
                  className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus size={15} /> {t("intg.new_rule")}
                </button>
              </div>

              {/* Rules list */}
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {(rules[intg.id] ?? []).length === 0 ? (
                  <div className="px-6 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
                    {t("intg.no_rules")}
                  </div>
                ) : (
                  (rules[intg.id] ?? []).map((rule) => (
                    <div key={rule.id} className="px-6 py-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{rule.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {TRIGGER_LABELS[rule.trigger] ?? rule.trigger} → {ACTION_LABELS[rule.action] ?? rule.action}
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${rule.is_active ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500"}`}>
                        {rule.is_active ? t("intg.status.active") : t("intg.status.paused")}
                      </span>
                      <button
                        onClick={() => toggleRule(intg.id, rule)}
                        className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors"
                      >
                        {rule.is_active ? <Pause size={14} /> : <Play size={14} />}
                      </button>
                      <button
                        onClick={() => deleteRule(intg.id, rule.id)}
                        className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center justify-center text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Job history toggle */}
              <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  onClick={() => loadJobs(intg.id)}
                  className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                >
                  <Clock size={12} />
                  {expandedJobs === intg.id ? t("intg.history.hide") : t("intg.history.show")}
                </button>
              </div>

              {expandedJobs === intg.id && (
                <div className="border-t border-slate-100 dark:border-slate-700">
                  {(jobs[intg.id] ?? []).length === 0 ? (
                    <p className="px-6 py-6 text-xs text-slate-400 dark:text-slate-500 text-center">{t("intg.history.none")}</p>
                  ) : (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500">
                          <th className="px-6 py-2 text-left font-medium">{t("intg.history.date")}</th>
                          <th className="px-6 py-2 text-left font-medium">{t("intg.history.from")}</th>
                          <th className="px-6 py-2 text-left font-medium">{t("intg.history.subject")}</th>
                          <th className="px-6 py-2 text-left font-medium">{t("intg.history.action")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {(jobs[intg.id] ?? []).map((job) => (
                          <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                            <td className="px-6 py-2.5 text-slate-400 dark:text-slate-500 whitespace-nowrap">
                              {new Date(job.processed_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </td>
                            <td className="px-6 py-2.5 text-slate-600 dark:text-slate-300 max-w-[140px] truncate">{job.from_address}</td>
                            <td className="px-6 py-2.5 text-slate-700 dark:text-slate-200 max-w-[200px] truncate">{job.subject}</td>
                            <td className="px-6 py-2.5">
                              <span className={`px-2 py-0.5 rounded-full font-medium ${JOB_COLORS[job.action_taken] ?? "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"}`}>
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
