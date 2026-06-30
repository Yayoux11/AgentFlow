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

---

## 🔄 En cours

_(aucune tâche en cours)_

---

## 📋 Backlog — En attente de validation

### 🔴 Critique (bloquant pour le lancement)

| # | Tâche | Pourquoi |
|---|-------|---------|
| B2 | **Clé API Anthropic dans .env Render** | Les agents IA ne fonctionnent pas sans elle |

### 🟠 Important (expérience utilisateur)

| # | Tâche | Pourquoi |
|---|-------|---------|
| B4 | **Onboarding utilisateur** (wizard après inscription) | Taux d'activation faible sans guidage initial |
| B17 | **Vérification email** (lien de confirmation après register) | Évite les faux comptes et améliore la délivrabilité |

### 🟡 Améliorations produit

| # | Tâche | Pourquoi |
|---|-------|---------|
| B10 | **Notifications in-app** (règles emails déclenchées, tâches terminées) | Feedback temps-réel |
| B11 | **Plan Enterprise — multi-utilisateurs / équipes** | Vente B2B, ticket moyen plus élevé |
| B18 | **Webhook sortant configurable** | Permet aux utilisateurs d'intégrer AgentFlow dans leur propre stack |
| B19 | **Playground agent** (test sans compte, 3 requêtes gratuites) | Réduit la friction à l'adoption |

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
