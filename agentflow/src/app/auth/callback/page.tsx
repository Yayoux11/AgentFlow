"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";

const ERROR_MESSAGES: Record<string, string> = {
  google_failed: "La connexion Google a échoué.",
  no_email: "Impossible de récupérer votre adresse email Google.",
  account_disabled: "Ce compte a été désactivé.",
};

function CallbackInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const access_token = searchParams.get("access_token");
    const refresh_token = searchParams.get("refresh_token");
    const error = searchParams.get("error");

    if (error) {
      const msg = ERROR_MESSAGES[error] ?? "Erreur de connexion.";
      router.replace(`/login?error=${encodeURIComponent(msg)}`);
      return;
    }

    if (access_token && refresh_token) {
      api.saveTokens(access_token, refresh_token);
      refreshUser().then(() => router.replace("/dashboard"));
    } else {
      router.replace("/login");
    }
  }, [searchParams, router, refreshUser]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="animate-spin text-indigo-600 mx-auto mb-3" size={32} />
        <p className="text-sm text-slate-500">Connexion en cours…</p>
      </div>
    </div>
  );
}

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="animate-spin text-indigo-600 mx-auto mb-3" size={32} />
      <p className="text-sm text-slate-500">Chargement…</p>
    </div>
  </div>
);

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <CallbackInner />
    </Suspense>
  );
}
