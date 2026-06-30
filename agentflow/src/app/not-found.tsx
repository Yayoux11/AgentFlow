import Link from "next/link";
import { Zap, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <span className="bg-indigo-600 text-white rounded-xl p-3">
            <Zap size={28} strokeWidth={2.5} />
          </span>
        </div>
        <p className="text-7xl font-extrabold text-indigo-600 mb-3">404</p>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Page introuvable</h1>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeft size={16} /> Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
