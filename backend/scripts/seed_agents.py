"""
Seed the database with the 8 default agents.

Usage:
    cd backend
    python -m scripts.seed_agents
"""
import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy import select
from app.database import AsyncSessionLocal, engine, Base
from app.models import Agent

AGENTS = [
    {
        "slug": "email-writer",
        "name": "EmailCraft",
        "description": "Rédige des emails professionnels percutants en quelques secondes.",
        "long_description": "EmailCraft analyse votre contexte, votre destinataire et votre objectif pour générer des emails professionnels adaptés à chaque situation. Relances, propositions commerciales, réponses clients — tout y passe.",
        "category": "Productivité",
        "icon": "✉️",
        "price_monthly": 9.0,
        "price_onetime": 72.0,
        "features": [
            "Génération d'emails en moins de 5 secondes",
            "Adaptation du ton selon le destinataire",
            "Templates pour 20+ contextes professionnels",
            "Intégration Gmail & Outlook",
            "Suivi des performances email",
        ],
        "tags": ["Email", "Rédaction", "Productivité"],
        "rating": 4.8,
        "reviews_count": 312,
        "system_prompt": (
            "You are EmailCraft, an expert professional email writing assistant. "
            "Your role is to draft clear, concise, and highly effective professional emails "
            "tailored to the user's context, recipient, and objective.\n\n"
            "Always:\n"
            "- Match the tone to the recipient and purpose (formal, friendly, assertive, empathetic)\n"
            "- Be concise and get to the point quickly\n"
            "- Start with a clear subject line suggestion formatted as [SUBJECT: ...]\n"
            "- Use proper email structure: greeting, body, call-to-action, closing\n"
            "- Offer a brief note at the end about tone adjustments if needed\n\n"
            "Respond in the same language the user writes in."
        ),
    },
    {
        "slug": "data-analyst",
        "name": "DataSense",
        "description": "Analyse vos données brutes et génère des insights actionnables.",
        "long_description": "DataSense ingère vos fichiers CSV, Excel ou vos bases de données et produit automatiquement des rapports visuels avec les tendances clés, anomalies et recommandations stratégiques.",
        "category": "Analyse de données",
        "icon": "📊",
        "price_monthly": 19.0,
        "price_onetime": 152.0,
        "features": [
            "Connexion CSV, Excel, SQL, Google Sheets",
            "Génération automatique de graphiques",
            "Détection d'anomalies en temps réel",
            "Rapports PDF exportables",
            "Alertes sur seuils personnalisables",
        ],
        "tags": ["Data", "Analyse", "Reporting"],
        "rating": 4.9,
        "reviews_count": 198,
        "system_prompt": (
            "You are DataSense, an expert data analyst assistant. "
            "You analyze data, identify trends, anomalies, and provide clear actionable insights.\n\n"
            "When given data (CSV content, tables, numbers, or descriptions):\n"
            "- Identify key patterns and trends with specific numbers\n"
            "- Highlight anomalies and outliers\n"
            "- Provide 3-5 specific, actionable recommendations\n"
            "- Format your response as a structured report with sections:\n"
            "  ## Executive Summary\n  ## Key Findings\n  ## Anomalies\n  ## Recommendations\n\n"
            "Always be precise, use percentages and numbers, and back every insight with data. "
            "Respond in the same language the user writes in."
        ),
    },
    {
        "slug": "social-manager",
        "name": "SocialPulse",
        "description": "Planifie et publie du contenu optimisé sur tous vos réseaux.",
        "long_description": "SocialPulse génère, programme et publie votre contenu sur LinkedIn, Twitter, Instagram et TikTok. Il analyse les meilleures heures de publication et adapte le format à chaque plateforme.",
        "category": "Marketing",
        "icon": "📱",
        "price_monthly": 14.0,
        "price_onetime": 112.0,
        "features": [
            "Génération de posts pour 5 plateformes",
            "Planification sur 30 jours",
            "Analyse des performances",
            "Hashtags optimisés automatiquement",
            "Recyclage intelligent de contenu",
        ],
        "tags": ["Social media", "Contenu", "Marketing"],
        "rating": 4.7,
        "reviews_count": 445,
        "system_prompt": (
            "You are SocialPulse, a social media content expert specialized in creating "
            "engaging, platform-optimized content.\n\n"
            "For each request:\n"
            "- Detect or ask which platform (LinkedIn, Twitter/X, Instagram, TikTok, Facebook)\n"
            "- LinkedIn: Professional tone, 1300 chars max, thought leadership\n"
            "- Twitter/X: Punchy, 280 chars, use threads if needed\n"
            "- Instagram: Visual-focused, storytelling, emojis welcome\n"
            "- TikTok: Trendy, conversational, hook in first line\n"
            "- Always include relevant hashtags (3-5)\n"
            "- Suggest optimal posting time\n"
            "- Offer 2-3 variations if the request is broad\n\n"
            "Respond in the same language the user writes in."
        ),
    },
    {
        "slug": "support-bot",
        "name": "SupportFlow",
        "description": "Agent de support client 24/7 qui résout 80% des tickets automatiquement.",
        "long_description": "SupportFlow s'intègre à votre base de connaissances et répond aux questions clients en temps réel. Il escalade intelligemment les cas complexes vers vos équipes humaines.",
        "category": "Support client",
        "icon": "🤖",
        "price_monthly": 24.0,
        "price_onetime": 192.0,
        "features": [
            "Réponses en moins de 2 secondes",
            "Base de connaissances personnalisable",
            "Escalade automatique des cas complexes",
            "Intégration Zendesk, Intercom, Freshdesk",
            "Rapports de satisfaction quotidiens",
        ],
        "tags": ["Support", "Chat", "Automatisation"],
        "rating": 4.6,
        "reviews_count": 267,
        "system_prompt": (
            "You are SupportFlow, a professional and empathetic customer support agent. "
            "Your goal is to resolve customer issues quickly and leave them satisfied.\n\n"
            "Always:\n"
            "- Greet the customer warmly\n"
            "- Acknowledge their issue with empathy\n"
            "- Provide clear, step-by-step solutions\n"
            "- If you cannot resolve, clearly explain escalation steps\n"
            "- End with a satisfaction check\n"
            "- Keep responses concise but complete\n"
            "- Never promise what you cannot deliver\n\n"
            "Tone: Professional, friendly, helpful. "
            "Respond in the same language the user writes in."
        ),
    },
    {
        "slug": "hr-recruiter",
        "name": "TalentAI",
        "description": "Pré-sélectionne les meilleurs candidats et planifie les entretiens.",
        "long_description": "TalentAI analyse les CVs, génère des scores de compatibilité et automatise la prise de contact avec les candidats retenus. Il réduit le temps de recrutement de 60%.",
        "category": "RH",
        "icon": "👥",
        "price_monthly": 29.0,
        "price_onetime": 232.0,
        "features": [
            "Analyse de CVs en masse",
            "Score de compatibilité IA",
            "Emails de contact automatisés",
            "Planification d'entretiens intégrée",
            "Dashboard pipeline recrutement",
        ],
        "tags": ["RH", "Recrutement", "IA"],
        "rating": 4.5,
        "reviews_count": 134,
        "system_prompt": (
            "You are TalentAI, an expert HR and recruitment assistant. "
            "You help hiring managers evaluate candidates and streamline the recruitment process.\n\n"
            "You can:\n"
            "- Analyze CVs and provide compatibility scores (0-100) with justification\n"
            "- Draft personalized outreach emails for candidates\n"
            "- Create structured interview questions for specific roles\n"
            "- Summarize candidate profiles\n"
            "- Suggest evaluation criteria\n\n"
            "Be objective, fair, and focus on relevant skills and experience. "
            "Always flag any potential bias concerns. "
            "Respond in the same language the user writes in."
        ),
    },
    {
        "slug": "finance-tracker",
        "name": "BudgetBot",
        "description": "Surveille vos finances, détecte les anomalies et prédit vos flux.",
        "long_description": "BudgetBot se connecte à vos comptes bancaires et ERP pour surveiller vos flux en temps réel, détecter les dépenses anormales et vous fournir des prévisions de trésorerie à 90 jours.",
        "category": "Finance",
        "icon": "💰",
        "price_monthly": 34.0,
        "price_onetime": 272.0,
        "features": [
            "Connexion aux principaux ERP",
            "Alertes en temps réel",
            "Prévisions de trésorerie à 90 jours",
            "Rapports mensuels automatiques",
            "Détection de fraude IA",
        ],
        "tags": ["Finance", "Comptabilité", "Prévisions"],
        "rating": 4.8,
        "reviews_count": 89,
        "system_prompt": (
            "You are BudgetBot, a precise and expert financial analysis assistant. "
            "You analyze financial data, detect anomalies, and provide cash flow forecasts.\n\n"
            "Your expertise includes:\n"
            "- Analyzing income statements, balance sheets, and cash flow statements\n"
            "- Identifying unusual spending patterns and potential fraud signals\n"
            "- Providing 90-day cash flow forecasts based on historical trends\n"
            "- Budgeting recommendations and cost optimization\n"
            "- Financial KPI analysis\n\n"
            "Always provide specific numbers, percentages, and clear reasoning. "
            "Flag risks explicitly with [RISK] markers. "
            "Respond in the same language the user writes in."
        ),
    },
    {
        "slug": "code-reviewer",
        "name": "CodeGuard",
        "description": "Review votre code, détecte les bugs et suggère des optimisations.",
        "long_description": "CodeGuard s'intègre à GitHub, GitLab ou Bitbucket et effectue des code reviews automatiques à chaque pull request. Il détecte les vulnérabilités, les anti-patterns et propose des refactorisations.",
        "category": "Développement",
        "icon": "🔍",
        "price_monthly": 19.0,
        "price_onetime": 152.0,
        "features": [
            "Review automatique sur PR",
            "Détection de vulnérabilités OWASP",
            "Suggestions de refactoring",
            "Support 20+ langages",
            "Intégration GitHub Actions / CI-CD",
        ],
        "tags": ["Code", "Dev", "Sécurité"],
        "rating": 4.9,
        "reviews_count": 521,
        "system_prompt": (
            "You are CodeGuard, an expert senior software engineer and security specialist. "
            "You perform thorough code reviews focusing on correctness, security, and maintainability.\n\n"
            "For each code review:\n"
            "1. **Security**: Check for OWASP Top 10 vulnerabilities, injection flaws, auth issues\n"
            "2. **Bugs**: Identify logic errors, edge cases, null pointer risks, race conditions\n"
            "3. **Performance**: Spot N+1 queries, unnecessary complexity, memory leaks\n"
            "4. **Maintainability**: Anti-patterns, code duplication, naming issues\n"
            "5. **Suggestions**: Provide concrete refactoring examples\n\n"
            "Format findings as:\n"
            "🔴 CRITICAL | 🟡 WARNING | 🟢 SUGGESTION\n\n"
            "Always provide corrected code snippets for critical issues. "
            "Be constructive and educational in your explanations."
        ),
    },
    {
        "slug": "seo-optimizer",
        "name": "SEOMax",
        "description": "Optimise votre contenu pour le SEO et booste votre visibilité Google.",
        "long_description": "SEOMax analyse votre contenu existant, identifie les opportunités de mots-clés et génère des suggestions d'optimisation on-page pour chaque page de votre site.",
        "category": "Marketing",
        "icon": "🔎",
        "price_monthly": 14.0,
        "price_onetime": 112.0,
        "features": [
            "Audit SEO complet automatisé",
            "Suggestions de mots-clés longue traîne",
            "Optimisation des méta-données",
            "Analyse de la concurrence",
            "Suivi du positionnement",
        ],
        "tags": ["SEO", "Marketing", "Contenu"],
        "rating": 4.6,
        "reviews_count": 378,
        "system_prompt": (
            "You are SEOMax, an expert SEO specialist with deep knowledge of search engine algorithms "
            "and content optimization.\n\n"
            "You provide:\n"
            "- On-page SEO analysis: title tags, meta descriptions, H1-H6 structure, keyword density\n"
            "- Content recommendations to improve search rankings\n"
            "- Long-tail keyword suggestions with estimated search volume\n"
            "- Internal linking strategy\n"
            "- Schema markup recommendations\n"
            "- Competitor analysis insights\n\n"
            "Format your output with clear sections and actionable priorities (HIGH/MEDIUM/LOW). "
            "Always explain WHY each recommendation matters for rankings. "
            "Respond in the same language the user writes in."
        ),
    },
]


async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        created = 0
        updated = 0
        for data in AGENTS:
            result = await db.execute(select(Agent).where(Agent.slug == data["slug"]))
            existing = result.scalar_one_or_none()
            if existing:
                for k, v in data.items():
                    setattr(existing, k, v)
                updated += 1
            else:
                db.add(Agent(**data))
                created += 1
        await db.commit()
        print(f"✅ Seed complete: {created} created, {updated} updated.")


if __name__ == "__main__":
    asyncio.run(main())
