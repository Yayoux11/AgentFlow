"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, ArrowLeft, CheckCircle } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useLang } from "@/context/LanguageContext";

export default function ForgotPasswordPage() {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur inattendue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-8">
          <div className="flex justify-center mb-6">
            <span className="bg-indigo-600 text-white rounded-xl p-2.5">
              <Zap size={22} strokeWidth={2.5} />
            </span>
          </div>

          {sent ? (
            <div className="text-center">
              <CheckCircle size={40} className="text-emerald-500 mx-auto mb-4" />
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">{t("auth.forgot.sent_title")}</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
                {t("auth.forgot.sent_body1")} <strong>{email}</strong>{t("auth.forgot.sent_body2")}
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline"
              >
                <ArrowLeft size={14} /> {t("auth.forgot.back")}
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white text-center mb-1">
                {t("auth.forgot.title")}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm text-center mb-8">
                {t("auth.forgot.subtitle")}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t("auth.forgot.email")}</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 text-sm"
                >
                  {loading ? t("auth.forgot.loading") : t("auth.forgot.submit")}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft size={14} /> {t("auth.forgot.back")}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
