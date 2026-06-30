"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function CheckoutSuccessPage() {
  const { refreshUser } = useAuth();

  useEffect(() => {
    // Refresh user data so the dashboard reflects the new plan
    refreshUser();
  }, [refreshUser]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10">
          <div className="flex justify-center mb-5">
            <CheckCircle className="text-emerald-500" size={56} strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Paiement réussi !</h1>
          <p className="text-slate-500 mb-8">
            Votre abonnement est maintenant actif. Vous avez accès à tous les agents de votre plan.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/dashboard"
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              Aller au dashboard
            </Link>
            <Link
              href="/marketplace"
              className="w-full border border-slate-200 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors text-sm"
            >
              Explorer les agents
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
