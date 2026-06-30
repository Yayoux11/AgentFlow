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

---

## 🔄 En cours

_(aucune tâche en cours)_

---

## 📋 Backlog — En attente de validation

### 🔴 Critique (bloquant pour le lancement)

| # | Tâche | Pourquoi |
|---|-------|---------|
| B1 | **Stripe — abonnements Pro + Enterprise** | Sans paiement, le SaaS ne génère aucun revenu |
| B2 | **Clé API Anthropic dans .env** | Les agents IA ne fonctionnent pas sans elle |

### 🟠 Important (expérience utilisateur)

| # | Tâche | Pourquoi |
|---|-------|---------|
| B4 | **Onboarding utilisateur** (wizard après inscription) | Taux d'activation faible sans guidage initial |

### 🟡 Améliorations produit

| # | Tâche | Pourquoi |
|---|-------|---------|
| B10 | **Notifications in-app** (règles emails déclenchées, tâches terminées) | Feedback temps-réel |
| B11 | **Plan Enterprise — multi-utilisateurs / équipes** | Vente B2B, ticket moyen plus élevé |
| B12 | **Microsoft Outlook OAuth** (déjà architecturé, manque Azure app) | Complète l'intégration email |

### 🟢 Nice-to-have

| # | Tâche | Pourquoi |
|---|-------|---------|
| B13 | **Landing page marketing** (SEO, CTA, pricing public) | Acquisition organique |
| B14 | **API publique + clés API pour les développeurs** | Ouvre un canal B2B2D |
| B15 | **Mode dark** | Demande fréquente |
| B16 | **Internationalisation (i18n)** EN/FR | Marché international |

---

## 💡 Suggestions soumises ce jour — En attente de décision

> Valider ou rejeter chaque point. Je commence dès validation.

### S1 — Stripe (B1) → Priorité absolue
Connecter Stripe Checkout pour les plans Pro (19 €/mois) et Enterprise (79 €/mois).
Inclut : webhook pour activer le plan après paiement, page de succès, gestion des annulations.

### S2 — Onboarding en 3 étapes (B4)
Après inscription, un wizard rapide : (1) connecter un agent, (2) tester un prompt, (3) optionnel connecter sa boîte mail.
Augmente significativement le taux d'activation.

### S3 — Dashboard analytics (B5)
Ajouter sur le dashboard : nombre de requêtes par agent, tokens utilisés ce mois, activité récente.
Rend le produit "collant" — l'utilisateur voit sa progression.

### S4 — PostgreSQL en remplacement de SQLite (B3)
Migration technique transparente pour l'utilisateur.
Indispensable avant tout déploiement cloud (Railway, Render, Supabase).

---

## 📌 Décisions prises

| Décision | Choix | Date |
|----------|-------|------|
| SSO Microsoft | Reporté (pas de compte Azure) | session 2 |
| Apple SSO | Reporté (pas de compte Apple Developer) | session 2 |
| Stripe | En attente de validation | — |
