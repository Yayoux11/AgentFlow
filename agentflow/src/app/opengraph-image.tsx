import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Agentoolflow — La marketplace d'agents IA";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #0f172a 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient glow top-left */}
        <div
          style={{
            position: "absolute",
            top: -100,
            left: -100,
            width: 500,
            height: 400,
            background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)",
          }}
        />
        {/* Ambient glow bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: -80,
            right: -80,
            width: 400,
            height: 350,
            background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Decorative cards left */}
        <div
          style={{
            position: "absolute",
            left: 52,
            top: 180,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            opacity: 0.5,
          }}
        >
          {[
            { emoji: "📧", label: "Email Writer", color: "#4f46e5" },
            { emoji: "🏠", label: "ImmoBot", color: "#0891b2" },
            { emoji: "💼", label: "JobSeeker", color: "#059669" },
          ].map((card) => (
            <div
              key={card.label}
              style={{
                width: 192,
                height: 72,
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "0 16px",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  background: card.color,
                  borderRadius: 9,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                }}
              >
                {card.emoji}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <div style={{ width: 80, height: 8, background: "#475569", borderRadius: 4 }} />
                <div style={{ width: 56, height: 6, background: "#334155", borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Decorative cards right */}
        <div
          style={{
            position: "absolute",
            right: 52,
            top: 140,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            opacity: 0.4,
          }}
        >
          {[
            { emoji: "🤖", label: "LeadDev", color: "#7c3aed" },
            { emoji: "📋", label: "ProjectPilot", color: "#dc2626" },
          ].map((card) => (
            <div
              key={card.label}
              style={{
                width: 192,
                height: 72,
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "0 16px",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  background: card.color,
                  borderRadius: 9,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                }}
              >
                {card.emoji}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ width: 90, height: 8, background: "#475569", borderRadius: 4 }} />
                <div style={{ width: 64, height: 6, background: "#334155", borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Center content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0,
          }}
        >
          {/* Logo badge */}
          <div
            style={{
              width: 96,
              height: 96,
              background: "#4f46e5",
              borderRadius: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 48,
              marginBottom: 24,
              boxShadow: "0 0 60px rgba(79,70,229,0.5)",
            }}
          >
            ⚡
          </div>

          {/* Wordmark */}
          <div
            style={{
              fontSize: 80,
              fontWeight: 900,
              color: "white",
              letterSpacing: "-3px",
              lineHeight: 1,
              marginBottom: 16,
            }}
          >
            Agentoolflow
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 26,
              color: "#94a3b8",
              letterSpacing: "-0.5px",
              marginBottom: 32,
            }}
          >
            La marketplace d&apos;agents IA spécialisés
          </div>

          {/* Feature pills */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 36,
            }}
          >
            {["Email automatisé", "Recrutement IA", "Immobilier IA", "Dev & sécurité"].map((label) => (
              <div
                key={label}
                style={{
                  background: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: 20,
                  padding: "8px 18px",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#818cf8",
                }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 60, marginBottom: 28 }}>
            {[
              { value: "19+", label: "agents spécialisés" },
              { value: "Gratuit", label: "pour démarrer" },
              { value: "< 2s", label: "temps de réponse" },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}
              >
                <div style={{ fontSize: 24, fontWeight: 800, color: "white" }}>{stat.value}</div>
                <div style={{ fontSize: 13, color: "#64748b" }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* URL badge */}
          <div
            style={{
              background: "#1e293b",
              border: "1.5px solid #4f46e5",
              borderRadius: 20,
              padding: "8px 28px",
              fontSize: 16,
              fontWeight: 700,
              color: "#818cf8",
              letterSpacing: "0.5px",
            }}
          >
            agent-flow-toz3.vercel.app
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
