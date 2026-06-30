"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Key, Plus, Trash2, Copy, Check, AlertTriangle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api-client";
import type { ApiKey, ApiKeyCreated } from "@/lib/types";
import { useLang } from "@/context/LanguageContext";
import { timeAgo } from "@/lib/translations";

export default function ApiKeysPage() {
  const { user, loading: authLoading } = useAuth();
  const { t, lang } = useLang();
  const router = useRouter();

  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newKey, setNewKey] = useState<ApiKeyCreated | null>(null);
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) fetchKeys();
  }, [user]);

  async function fetchKeys() {
    try {
      const data = await api.get<ApiKey[]>("/api-keys");
      setKeys(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setError("");
    setCreating(true);
    try {
      const created = await api.post<ApiKeyCreated>("/api-keys", { name: newName.trim() });
      setNewKey(created);
      setKeys((prev) => [created, ...prev]);
      setShowForm(false);
      setNewName("");
      setShowKey(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("apikey.error"));
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id: string) {
    setRevoking(id);
    try {
      await api.delete(`/api-keys/${id}`);
      setKeys((prev) => prev.filter((k) => k.id !== id));
    } finally {
      setRevoking(null);
    }
  }

  function copyKey(key: string) {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Key size={22} className="text-indigo-600" />
            {t("apikey.title")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("apikey.subtitle")}
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setNewKey(null); }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          {t("apikey.new")}
        </button>
      </div>

      {/* New key revealed */}
      {newKey && (
        <div className="mb-6 p-5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
          <div className="flex items-start gap-3 mb-3">
            <AlertTriangle size={18} className="text-emerald-700 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">{t("apikey.copy_now")}</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                {t("apikey.copy_warning")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800 px-4 py-3">
            <code className="flex-1 text-sm font-mono text-slate-900 dark:text-white break-all">
              {showKey ? newKey.full_key : `${newKey.key_prefix}${"•".repeat(32)}`}
            </code>
            <button onClick={() => setShowKey((v) => !v)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex-shrink-0">
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <button
              onClick={() => copyKey(newKey.full_key)}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex-shrink-0"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? t("apikey.copied") : t("apikey.copy")}
            </button>
          </div>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl">
          <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
            {t("apikey.name_label")}
          </label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t("apikey.name_placeholder")}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
            maxLength={100}
            autoFocus
          />
          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={creating || !newName.trim()}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {creating && <Loader2 size={14} className="animate-spin" />}
              {t("apikey.create")}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setError(""); }}
              className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              {t("apikey.cancel")}
            </button>
          </div>
        </form>
      )}

      {/* Keys list */}
      {keys.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <Key size={36} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">{t("apikey.no_keys")}</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">{t("apikey.no_keys_desc")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {keys.map((key) => (
            <div key={key.id} className="flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">{key.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                  {key.key_prefix}••••••••••••••••••••••••••••••••
                </p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                  <span>{t("apikey.created")} {timeAgo(key.created_at, lang)}</span>
                  {key.last_used_at && <span>· {t("apikey.used")} {timeAgo(key.last_used_at, lang)}</span>}
                </div>
              </div>
              <button
                onClick={() => handleRevoke(key.id)}
                disabled={revoking === key.id}
                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium transition-colors disabled:opacity-50"
              >
                {revoking === key.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {t("apikey.revoke")}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Docs hint */}
      <div className="mt-8 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
        <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{t("apikey.usage_title")}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{t("apikey.usage_desc")}</p>
        <code className="block text-xs font-mono bg-slate-900 dark:bg-slate-950 text-emerald-400 rounded-xl px-4 py-3">
          X-API-Key: af_votre_cle_ici
        </code>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">{t("apikey.max")}</p>
      </div>
    </div>
  );
}
