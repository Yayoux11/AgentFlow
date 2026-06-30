"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Eye, EyeOff, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api-client";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  const pwdChecks = [
    { label: "8 caractères minimum", ok: password.length >= 8 },
    { label: "Une majuscule", ok: /[A-Z]/.test(password) },
    { label: "Un chiffre", ok: /\d/.test(password) },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères"); return; }
    setLoading(true);
    try {
      await register(email, password, fullName || undefined);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="flex justify-center mb-6">
            <span className="bg-indigo-600 text-white rounded-xl p-2.5">
              <Zap size={22} strokeWidth={2.5} />
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 text-center mb-1">Créer un compte</h1>
          <p className="text-slate-500 text-sm text-center mb-8">
            Commencez gratuitement — aucune carte requise
          </p>

          <GoogleSignInButton label="S'inscrire avec Google" />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-slate-400">ou avec un email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Nom complet <span className="text-slate-400 font-normal">(optionnel)</span>
              </label>
              <input
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jean Dupont"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  autoComplete="new-password"
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
              {password && (
                <div className="mt-2 space-y-1">
                  {pwdChecks.map((c) => (
                    <div key={c.label} className={`flex items-center gap-1.5 text-xs ${c.ok ? "text-emerald-600" : "text-slate-400"}`}>
                      <Check size={12} strokeWidth={c.ok ? 3 : 1.5} />
                      {c.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {loading ? "Création du compte…" : "Créer mon compte"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-400">
            En créant un compte, vous acceptez nos{" "}
            <span className="text-slate-600 hover:underline cursor-pointer">CGU</span>
          </p>

          <p className="mt-4 text-center text-sm text-slate-500">
            Déjà un compte ?{" "}
            <Link href="/login" className="text-indigo-600 font-medium hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
