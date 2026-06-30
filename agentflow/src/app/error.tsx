"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
            <AlertCircle size={32} className="text-red-500" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Une erreur est survenue</h1>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          Quelque chose s&apos;est mal passé. Rechargez la page ou revenez à l&apos;accueil.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={15} /> Réessayer
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
