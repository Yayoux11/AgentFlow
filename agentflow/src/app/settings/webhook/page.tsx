"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Webhook, Save, Trash2, Send, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api-client";

export default function WebhookSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [webhookUrl, setWebhookUrl] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const [testMessage, setTestMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    api.get<{ webhook_url: string | null }>("/settings/webhook")
      .then((d) => setWebhookUrl(d.webhook_url ?? ""))
      .finally(() => setLoading(false));
  }, [user]);

  async function handleSave() {
    setError("");
    setSaving(true);
    setSaved(false);
    try {
      await api.patch("/settings/webhook", { webhook_url: webhookUrl || null });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Impossible de sauvegarder. Vérifiez l'URL.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setSaving(true);
    try {
      await api.patch("/settings/webhook", { webhook_url: null });
      setWebhookUrl("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    setTestMessage("");
    try {
      const data = await api.post<{ message: string }>("/settings/webhook/test", {});
      setTestResult("success");
      setTestMessage(data.message);
    } catch (e: unknown) {
      setTestResult("error");
      setTestMessage(e instanceof Error ? e.message : "Échec de la livraison");
    } finally {
      setTesting(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
            <Webhook className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Webhook sortant</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Recevez les événements AgenToolFlow dans votre propre système</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">URL du webhook</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            AgenToolFlow enverra un POST JSON à cette URL après chaque exécution d&apos;agent ou traitement d&apos;email.
          </p>
          <div className="flex gap-2">
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://mon-serveur.com/webhook"
              className="flex-1 px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <CheckCircle size={14} /> : <Save size={14} />}
              {saved ? "Sauvegardé" : "Sauvegarder"}
            </button>
          </div>
          {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        </div>

        {webhookUrl && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Actions</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleTest}
                disabled={testing}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-60 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors"
              >
                {testing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Envoyer un test
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-60 text-red-600 dark:text-red-400 text-sm font-medium rounded-lg transition-colors"
              >
                <Trash2 size={14} />
                Supprimer le webhook
              </button>
            </div>
            {testResult && (
              <div className={`mt-4 flex items-start gap-2 p-3 rounded-lg text-sm ${testResult === "success" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400" : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"}`}>
                {testResult === "success" ? <CheckCircle size={16} className="flex-shrink-0 mt-0.5" /> : <XCircle size={16} className="flex-shrink-0 mt-0.5" />}
                {testMessage}
              </div>
            )}
          </div>
        )}

        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Événements envoyés</h2>
          <div className="space-y-3">
            {[
              { event: "agent.run", desc: "Exécution d'un agent IA (prompt, réponse, tokens)" },
              { event: "email.rule", desc: "Traitement d'un email par une règle (sujet, action, aperçu)" },
              { event: "test", desc: "Test manuel depuis cette page" },
            ].map(({ event, desc }) => (
              <div key={event} className="flex items-start gap-3">
                <code className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-mono flex-shrink-0 mt-0.5">{event}</code>
                <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
