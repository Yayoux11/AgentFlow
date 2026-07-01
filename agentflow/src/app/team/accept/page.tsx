"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle, XCircle, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api-client";

function AcceptContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const token = searchParams.get("token") ?? "";

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push(`/login?next=/team/accept?token=${token}`);
      return;
    }
    if (!token || status !== "idle") return;

    setStatus("loading");
    api.post<{ message: string }>(`/team/accept?token=${token}`, {})
      .then((d) => { setStatus("success"); setMessage(d.message); })
      .catch((e) => { setStatus("error"); setMessage(e instanceof Error ? e.message : "Invitation invalide ou expirée"); });
  }, [user, authLoading, token]);

  if (authLoading || status === "idle" || status === "loading") {
    return (
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Vérification de l&apos;invitation…</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <CheckCircle className="w-12 h-12 text-emerald-500" />
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Bienvenue dans l&apos;équipe !</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
        <Link href="/team" className="mt-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
          <Users size={15} />
          Voir mon équipe
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <XCircle className="w-12 h-12 text-red-400" />
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">Invitation invalide</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
      <Link href="/dashboard" className="mt-2 px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors">
        Retour au dashboard
      </Link>
    </div>
  );
}

export default function TeamAcceptPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
        <Suspense fallback={<Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />}>
          <AcceptContent />
        </Suspense>
      </div>
    </div>
  );
}
