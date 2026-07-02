"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2, Zap } from "lucide-react";
import { api } from "@/lib/api-client";
import { useLang } from "@/context/LanguageContext";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const { t } = useLang();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) { setStatus("error"); return; }
    api.get<{ message: string }>(`/auth/verify-email?token=${token}`)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-10 max-w-md w-full text-center shadow-sm">
        <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl text-slate-900 dark:text-white mb-8 justify-center">
          <span className="bg-indigo-600 text-white rounded-lg p-1.5"><Zap size={18} strokeWidth={2.5} /></span>
          AgenToolFlow
        </Link>

        {status === "loading" && (
          <>
            <Loader2 size={48} className="text-indigo-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-300">{t("verify.loading")}</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle size={52} className="text-emerald-500 mx-auto mb-4" />
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">{t("verify.success_title")}</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">{t("verify.success_desc")}</p>
            <Link href="/dashboard" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
              {t("verify.go_dashboard")}
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle size={52} className="text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">{t("verify.error_title")}</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">{t("verify.error_desc")}</p>
            <Link href="/dashboard" className="inline-flex items-center gap-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              {t("verify.go_dashboard")}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="text-indigo-600 animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
