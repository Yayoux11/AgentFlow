"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";

export default function CheckoutSuccessPage() {
  const { refreshUser } = useAuth();
  const { t } = useLang();

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-10">
          <div className="flex justify-center mb-5">
            <CheckCircle className="text-emerald-500" size={56} strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">{t("checkout.success.title")}</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            {t("checkout.success.subtitle")}
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/dashboard"
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              {t("checkout.success.dashboard")}
            </Link>
            <Link
              href="/marketplace"
              className="w-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm"
            >
              {t("checkout.success.marketplace")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
