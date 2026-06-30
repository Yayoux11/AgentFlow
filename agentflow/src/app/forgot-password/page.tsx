"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, ArrowLeft, CheckCircle } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";

export default function ForgotPasswordPage() {
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="flex justify-center mb-6">
            <span className="bg-indigo-600 text-white rounded-xl p-2.5">
              <Zap size={22} strokeWidth={2.5} />
            </span>
          </div>

          {sent ? (
            <div className="text-center">
              <CheckCircle size={40} className="text-emerald-500 mx-auto mb-4" />
              <h1 className="text-xl font-extrabold text-slate-900 mb-2">Email envoyé !</h1>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Si un compte existe avec l&apos;adresse <strong>{email}</strong>,
                vous recevrez un lien de réinitialisation dans quelques minutes.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline"
              >
                <ArrowLeft size={14} /> Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-extrabold text-slate-900 text-center mb-1">
                Mot de passe oublié ?
              </h1>
              <p className="text-slate-500 text-sm text-center mb-8">
                Entrez votre email pour recevoir un lien de réinitialisation.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 text-sm"
                >
                  {loading ? "Envoi…" : "Envoyer le lien"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft size={14} /> Retour à la connexion
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
