"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Zap, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) setError("Lien de réinitialisation invalide ou manquant.");
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères."); return; }
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, new_password: password });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2500);
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

          {success ? (
            <div className="text-center">
              <CheckCircle size={40} className="text-emerald-500 mx-auto mb-4" />
              <h1 className="text-xl font-extrabold text-slate-900 mb-2">Mot de passe mis à jour !</h1>
              <p className="text-slate-500 text-sm">Vous allez être redirigé vers la connexion…</p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-extrabold text-slate-900 text-center mb-1">
                Nouveau mot de passe
              </h1>
              <p className="text-slate-500 text-sm text-center mb-8">
                Choisissez un mot de passe d&apos;au moins 8 caractères.
              </p>

              {error && !token ? (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2 mb-4">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Nouveau mot de passe</label>
                    <div className="relative">
                      <input
                        type={showPwd ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !token}
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 text-sm"
                  >
                    {loading ? "Enregistrement…" : "Mettre à jour le mot de passe"}
                  </button>
                </form>
              )}

              <p className="mt-6 text-center text-sm text-slate-500">
                <Link href="/login" className="text-indigo-600 hover:underline">Retour à la connexion</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-slate-400 text-sm">Chargement…</div></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
