"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="fr">
      <head>
        <style>{`@media(prefers-color-scheme:dark){body{background:#0f172a!important}h1{color:#f1f5f9!important}p{color:#94a3b8!important}}`}</style>
      </head>
      <body style={{ fontFamily: "sans-serif", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f8fafc", margin: 0 }}>
        <div style={{ textAlign: "center", maxWidth: 400, padding: "0 16px" }}>
          <p style={{ fontSize: 64, margin: "0 0 16px" }}>⚡</p>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>Erreur critique</h1>
          <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>Agentoolflow a rencontré un problème inattendu.</p>
          <button
            onClick={reset}
            style={{ background: "#4f46e5", color: "white", border: "none", padding: "12px 24px", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
