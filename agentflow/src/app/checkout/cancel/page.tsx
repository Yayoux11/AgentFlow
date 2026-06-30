import Link from "next/link";
import { XCircle } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10">
          <div className="flex justify-center mb-5">
            <XCircle className="text-slate-400" size={56} strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Paiement annulé</h1>
          <p className="text-slate-500 mb-8">
            Votre paiement a été annulé. Aucun montant n&apos;a été débité. Vous pouvez réessayer à tout moment.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/#pricing"
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              Voir les tarifs
            </Link>
            <Link
              href="/dashboard"
              className="w-full border border-slate-200 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-colors text-sm"
            >
              Retour au dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
