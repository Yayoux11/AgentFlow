"use client";

import Link from "next/link";
import { Zap, ArrowLeft } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

export default function NotFound() {
  const { t } = useLang();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <span className="bg-indigo-600 text-white rounded-xl p-3">
            <Zap size={28} strokeWidth={2.5} />
          </span>
        </div>
        <p className="text-7xl font-extrabold text-indigo-600 mb-3">404</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{t("error.404.title")}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
          {t("error.404.subtitle")}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeft size={16} /> {t("error.404.back")}
        </Link>
      </div>
    </div>
  );
}
