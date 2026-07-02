# AgentFlow — Tableau de bord développement

> Mis à jour par le développeur après chaque tâche. L'utilisateur valide les priorités.

---

## ✅ Terminé

| # | Tâche | Date |
|---|-------|------|
| 1 | Authentification JWT (login / register) | session 1 |
| 2 | Base de données SQLite + modèles SQLAlchemy | session 1 |
| 3 | Seeding des 8 agents IA | session 1 |
| 4 | Dashboard utilisateur | session 1 |
| 5 | Marketplace avec filtres | session 1 |
| 6 | Pages agents avec guides d'utilisation | session 1 |
| 7 | Affichage "Accès inclus" pour Pro/Admin (marketplace, homepage, agent detail) | session 2 |
| 8 | Intégration email Gmail (OAuth2 + polling APScheduler + règles IA) | session 2 |
| 9 | UI Settings > Intégrations (connexion, règles, historique) | session 2 |
| 10 | Bouton Google SSO sur login + register | session 2 |
| 11 | Fix Suspense sur /auth/callback + erreurs URL sur login | session 3 |
| 12 | CLAUDE.md racine + règles développeur full-time | session 3 |
| 13 | **B3** — database.py compatible SQLite + PostgreSQL (pool adaptatif) | session 4 |
| 14 | **B5** — Dashboard analytics : requêtes/mois, tokens, par agent, activité réelle | session 4 |
| 15 | **B6** — Système Toast (ToastContext + Toaster) + pages 404/500/global-error | session 4 |
| 16 | **B7** — Reset mot de passe : SMTP service + 2 endpoints + 2 pages frontend + lien login | session 4 |
| 17 | **B8** — Historique conversations par agent (endpoint + UI accordéon sur page agent) | session 4 |
| 18 | **B9** — Export CSV (endpoint backend utf-8-sig) + PDF print via browser (zero dépendance) | session 5 |
| 19 | **B13** — Landing page : refacto server/client + SEO metadata + sections How it works / FAQ | session 6 |
| 20 | **B14** — API publique + clés API : modèle ApiKey + router backend + page /settings/api-keys | session 6 |
| 21 | **B15** — Mode dark : ThemeContext + CSS variables + dark: classes sur tous les composants principaux | session 6 |
| 22 | **B16** — Internationalisation EN/FR : LanguageContext + translations.ts | session 6 |
| 23 | **Dark mode complet** — dark: classes appliquées sur toutes les pages | session 7 |
| 24 | **i18n complet** — useLang() + t() appliqués sur toutes les pages + timeAgo localisé | session 7 |
| 25 | **Fix hydration** — suppressHydrationWarning sur html/body (extension navigateur) | session 8 |
| 26 | **PostgreSQL Render** — migration Alembic + connexion cloud + fix DATABASE_URL env group | session 8 |
| 27 | **Déploiement Vercel** — frontend en prod, fix useSearchParams Suspense + TypeScript | session 8 |
| 28 | **Google SSO prod** — BACKEND_URL dynamique + CORS FRONTEND_URL | session 8 |
| 29 | **Langue auto-détectée** — navigator.language + localStorage, suppression switcher FR/EN | session 9 |
| 30 | **Suppression faux contenus** — témoignages, "2400+ users / 4.8/5", notes agents | session 9 |
| 31 | **Accès agents Starter** — sidebar 3 états (Pro / Starter / non-inscrit) + i18n | session 9 |
| 32 | **B17** — Vérification email : token DB + endpoint verify + resend + banner Navbar + i18n | session 10 |
| 33 | **B4** — Onboarding wizard : 3 étapes (catégories / agents / Gmail) + redirect post-register | session 10 |
| 34 | **B19** — Playground sans compte : 3 démos via haiku, localStorage counter, signup wall | session 10 |
| 35 | **B10** — Notifications in-app : modèle + router backend + hook polling 30s + cloche Navbar | session 10 |
| 36 | **B18** — Webhook sortant : webhook_url user + service httpx + router settings/webhook + page UI + test | session 10 |
| 37 | **B11** — Enterprise teams : Team/TeamMember/TeamInvitation + router + email invite + page UI + accès agents hérité | session 10 |
| 38 | **Fix prod** — Migration 007 idempotente (IF NOT EXISTS) + alembic upgrade head dans startCommand Render | session 11 |
| 39 | **Fix prod SSO** — google_sso_callback : auto-création EmailIntegration Gmail si refresh_token | session 11 |
| 40 | **Fix marketplace** — seed_agents.py dans startCommand Render + agents correctement chargés depuis l'API | session 11 |
| 41 | **Pipeline ML** — Migration 008 (4 tables) + services embeddings/RAG/intent_router + routers knowledge & intent-routes + custom-prompts + 2 pages settings + api-client postForm/put | session 11 |
| 42 | **Vrais agents (Phase 1-2-3)** — Multi-tours (conversation_id, chat UI bulles), Tool use (function calling Claude avec get_datetime/send_email/read_emails/search_kb), Triggers (webhook fire + scheduled runs CRUD) + migration 009 + settings/triggers page | session 12 |
| 43 | **11 nouveaux agents + call_agent** — ImmoBot, JobSeeker, MotivAI, AutoSearch, FullStackAI, CyberGuard, LeadDev, ProjectPilot, ProductOwner, ScrumBot, TalentSearch + outil call_agent (connexions inter-agents avec guard profondeur 2) + guides d'utilisation | session 12 |

---

## 🔄 En cours

_(aucune tâche en cours)_

---

## 📋 Backlog — En attente de validation

### 🔴 Critique (bloquant pour le lancement)

| # | Tâche | Pourquoi |
|---|-------|---------|
| B2 | **Clé API Anthropic dans .env Render** | Les agents IA ne fonctionnent pas sans elle |
| T1 | **APScheduler — exécution automatique des ScheduledRuns** | Les runs planifiés sont stockés mais pas encore exécutés automatiquement |
| T2 | **DBeaver / accès visuel DB** | Render Free bloque l'accès externe — à faire si upgrade plan |

### 🟡 Améliorations produit

| # | Tâche | Pourquoi |
|---|-------|---------|
### 🔴 Critique avant vrai lancement

| # | Tâche | Pourquoi |
|---|-------|---------|
| S1 | **Stripe** — paiements Pro + Enterprise | Sans ça, les plans sont fictifs — aucun revenu possible |
| S2 | **Pages légales** — CGU, Politique de confidentialité, RGPD | Obligatoire pour la France/EU avant tout lancement public |
| S3 | **Barre de quota** dans le dashboard (X/Y requêtes) | Réduit le churn sur dépassement, feedback utilisateur clair |

### 🟠 Valeur produit forte

| # | Tâche | Pourquoi |
|---|-------|---------|
| S4 | **Runs planifiés** (cron sur un agent) | "Fais tourner DataAnalyst tous les lundis" — killer feature retention |
| S5 | **Agents multi-tours** (conversation contextuelle) | Chaque run est actuellement isolé — l'IA ne se souvient pas du tour précédent |
| S6 | **Catalogue d'agents étendu** (5 → 15+ agents) | Marketplace trop vide pour convertir un visiteur froid |

### 🟡 Croissance & acquisition

| # | Tâche | Pourquoi |
|---|-------|---------|
| S7 | **Widget embed** (playground intégrable sur un site externe) | Distribution virale — les utilisateurs partagent leur agent |
| S8 | **Email digest hebdo** (résumé d'activité automatique) | Réactivation passive des utilisateurs dormants |
| S9 | **Rate limiting backend** (protection API publique) | Avant d'ouvrir Stripe, un mauvais acteur peut exploiter les agents |

---

## 🔮 Futur (post-lancement)

> À envisager une fois le SaaS stable et en production avec de vrais utilisateurs.

| # | Tâche | Pourquoi reporté |
|---|-------|-----------------|
| F1 | **Stripe — abonnements Pro + Enterprise** | Priorité post-lancement — nécessite compte Stripe et conformité |
| F2 | **Microsoft Outlook OAuth** | Nécessite compte Azure + enregistrement app Microsoft |
| F3 | **Apple SSO** | Nécessite compte Apple Developer (99 $/an) |
| F4 | **Agents personnalisés** (création par l'utilisateur via UI) | Complexité élevée, valeur différenciante à moyen terme |
| F5 | **Marketplace tiers** (agents créés par la communauté) | Requiert modération, système de paiement aux créateurs |

---

## 📌 Décisions prises

| Décision | Choix | Date |
|----------|-------|------|
| SSO Microsoft | Reporté futur (pas de compte Azure) | session 2 |
| Apple SSO | Reporté futur (pas de compte Apple Developer) | session 2 |
| Stripe | Reporté futur (post-lancement) | session 9 |
| Témoignages fictifs | Supprimés — à ajouter avec vrais utilisateurs | session 9 |
| Notes/avis fictifs | Supprimés — à ajouter avec vrais utilisateurs | session 9 |
