# AgentFlow — Spécification de la base de données

**SGBD** : PostgreSQL 15+  
**ORM** : SQLAlchemy 2.0 (async)  
**Migrations** : Alembic

---

## Schéma global

```
users ──────────┬──── subscriptions   (1:1)
                ├──── user_agents     (1:N)
                ├──── agent_requests  (1:N)
                └──── usage_stats     (1:N)

agents ─────────┬──── user_agents     (1:N)
                └──── agent_requests  (1:N)
```

---

## Tables

### `users`

Stocke tous les comptes — superadmin et utilisateurs ordinaires.

| Colonne             | Type                    | Contraintes                       | Description                              |
|---------------------|-------------------------|-----------------------------------|------------------------------------------|
| `id`                | UUID (PK)               | NOT NULL, default uuid4()         | Identifiant unique                       |
| `email`             | VARCHAR(255)            | NOT NULL, UNIQUE, INDEX           | Email de connexion                       |
| `hashed_password`   | VARCHAR(255)            | NOT NULL                          | Mot de passe bcrypt hashé                |
| `full_name`         | VARCHAR(255)            | nullable                          | Nom complet                              |
| `is_superuser`      | BOOLEAN                 | NOT NULL, default false           | Accès illimité sans paiement             |
| `is_active`         | BOOLEAN                 | NOT NULL, default true            | Compte désactivé = false                 |
| `stripe_customer_id`| VARCHAR(255)            | UNIQUE, nullable                  | ID client Stripe (`cus_...`)             |
| `created_at`        | TIMESTAMPTZ             | NOT NULL, default now()           |                                          |
| `updated_at`        | TIMESTAMPTZ             | NOT NULL, default now()           | Mis à jour automatiquement               |

**Règles métier :**
- `is_superuser=true` → bypass complet des vérifications d'abonnement et quota
- Un superuser a toujours un plan `enterprise` dans `subscriptions`
- La désactivation d'un superuser est interdite par l'API

---

### `agents`

Catalogue des agents IA disponibles sur la plateforme.

| Colonne            | Type         | Contraintes               | Description                               |
|--------------------|--------------|---------------------------|-------------------------------------------|
| `id`               | UUID (PK)    | NOT NULL, default uuid4() | Identifiant unique                        |
| `slug`             | VARCHAR(100) | NOT NULL, UNIQUE, INDEX   | Identifiant URL (`email-writer`)          |
| `name`             | VARCHAR(255) | NOT NULL                  | Nom affiché                               |
| `description`      | TEXT         | NOT NULL                  | Description courte (1 phrase)             |
| `long_description` | TEXT         | NOT NULL                  | Description longue (paragraphe)           |
| `category`         | VARCHAR(100) | NOT NULL, INDEX           | Catégorie (`Marketing`, `RH`, ...)        |
| `icon`             | VARCHAR(10)  | NOT NULL, default "🤖"   | Emoji affiché                             |
| `price_monthly`    | FLOAT        | NOT NULL, default 0       | Prix abonnement mensuel en €              |
| `price_onetime`    | FLOAT        | NOT NULL, default 0       | Prix achat unique en €                    |
| `features`         | JSON         | NOT NULL, default []      | Liste de features (strings)               |
| `tags`             | JSON         | NOT NULL, default []      | Tags de recherche (strings)               |
| `system_prompt`    | TEXT         | NOT NULL, default ""      | Prompt système envoyé à Claude            |
| `rating`           | FLOAT        | NOT NULL, default 5.0     | Note moyenne (0-5)                        |
| `reviews_count`    | INTEGER      | NOT NULL, default 0       | Nombre d'avis                             |
| `is_active`        | BOOLEAN      | NOT NULL, default true    | false = soft delete (non affiché)         |
| `created_at`       | TIMESTAMPTZ  | NOT NULL, default now()   |                                           |
| `updated_at`       | TIMESTAMPTZ  | NOT NULL, default now()   |                                           |

**Règles métier :**
- La suppression est toujours un soft delete (`is_active = false`)
- Seul un superuser peut créer/modifier/supprimer des agents (via API)
- `system_prompt` est confidentiel — non exposé dans les réponses publiques

---

### `subscriptions`

Un seul abonnement actif par utilisateur. Géré via Stripe Webhooks.

| Colonne                  | Type         | Contraintes                     | Description                                      |
|--------------------------|--------------|---------------------------------|--------------------------------------------------|
| `id`                     | UUID (PK)    | NOT NULL                        |                                                  |
| `user_id`                | UUID (FK)    | NOT NULL, UNIQUE → `users.id`   | Relation 1:1 avec users                          |
| `plan`                   | VARCHAR(50)  | NOT NULL, default "starter"     | `starter` \| `pro` \| `enterprise`               |
| `stripe_subscription_id` | VARCHAR(255) | UNIQUE, nullable                | ID Stripe (`sub_...`). Null pour starter/gratuit |
| `stripe_customer_id`     | VARCHAR(255) | nullable                        | ID client Stripe (`cus_...`)                     |
| `status`                 | VARCHAR(50)  | NOT NULL, default "active"      | `active` \| `trialing` \| `past_due` \| `canceled` \| `unpaid` |
| `current_period_start`   | TIMESTAMPTZ  | nullable                        | Début de la période en cours                     |
| `current_period_end`     | TIMESTAMPTZ  | nullable                        | Fin de la période (date de renouvellement)       |
| `cancel_at_period_end`   | BOOLEAN      | NOT NULL, default false         | true = annulation programmée                     |
| `created_at`             | TIMESTAMPTZ  | NOT NULL                        |                                                  |
| `updated_at`             | TIMESTAMPTZ  | NOT NULL                        |                                                  |

**Plans et limites :**

| Plan       | Prix    | Agents max | Requêtes/mois | Stripe requis |
|------------|---------|------------|---------------|---------------|
| starter    | Gratuit | 3          | 1 000         | Non           |
| pro        | 29€/mois| Illimité   | 50 000        | Oui           |
| enterprise | 99€/mois| Illimité   | Illimité      | Oui           |

**Règles métier :**
- Tout utilisateur créé reçoit automatiquement un abonnement `starter`
- Stripe Webhook `checkout.session.completed` → upgrade plan
- Stripe Webhook `customer.subscription.deleted` → retour à `starter`
- Stripe Webhook `invoice.payment_failed` → `status = past_due`

---

### `user_agents`

Agents auxquels un utilisateur a accès (via abonnement ou achat unitaire).

| Colonne       | Type        | Contraintes                                         | Description                           |
|---------------|-------------|-----------------------------------------------------|---------------------------------------|
| `id`          | UUID (PK)   | NOT NULL                                            |                                       |
| `user_id`     | UUID (FK)   | NOT NULL → `users.id` ON DELETE CASCADE             |                                       |
| `agent_id`    | UUID (FK)   | NOT NULL → `agents.id` ON DELETE CASCADE            |                                       |
| `access_type` | VARCHAR(50) | NOT NULL                                            | `subscription` \| `purchased`         |
| `is_active`   | BOOLEAN     | NOT NULL, default true                              | Peut être révoqué                     |
| `acquired_at` | TIMESTAMPTZ | NOT NULL, default now()                             | Date d'activation                     |

**Contrainte unique** : `(user_id, agent_id)` → un utilisateur ne peut avoir qu'une entrée par agent.

**Règles métier :**
- `purchased` → accès permanent même sans abonnement
- `subscription` → accès révoqué si l'abonnement expire
- Pour plan `pro`/`enterprise` : l'utilisateur peut accéder à tous les agents sans entrée dans cette table (check côté application)

---

### `agent_requests`

Journal complet de toutes les exécutions d'agents.

| Colonne        | Type        | Contraintes                              | Description                        |
|----------------|-------------|------------------------------------------|------------------------------------|
| `id`           | UUID (PK)   | NOT NULL                                 |                                    |
| `user_id`      | UUID (FK)   | NOT NULL → `users.id` ON DELETE CASCADE  |                                    |
| `agent_id`     | UUID (FK)   | NOT NULL → `agents.id` ON DELETE CASCADE |                                    |
| `prompt`       | TEXT        | NOT NULL                                 | Prompt envoyé par l'utilisateur    |
| `response`     | TEXT        | NOT NULL                                 | Réponse de Claude                  |
| `input_tokens` | INTEGER     | NOT NULL, default 0                      | Tokens prompt (facturation)        |
| `output_tokens`| INTEGER     | NOT NULL, default 0                      | Tokens réponse (facturation)       |
| `created_at`   | TIMESTAMPTZ | NOT NULL, INDEX                          | Horodatage de la requête           |

**Règles métier :**
- Non modifiable après création (audit log)
- Utilisé pour calculer le coût Claude par utilisateur/agent
- INDEX sur `created_at` pour les rapports quotidiens

---

### `usage_stats`

Agrégat mensuel des requêtes par utilisateur. Utilisé pour l'enforcement des quotas.

| Colonne         | Type        | Contraintes                             | Description               |
|-----------------|-------------|------------------------------------------|---------------------------|
| `id`            | UUID (PK)   | NOT NULL                                 |                           |
| `user_id`       | UUID (FK)   | NOT NULL → `users.id` ON DELETE CASCADE  |                           |
| `year`          | INTEGER     | NOT NULL                                 | Ex: 2026                  |
| `month`         | INTEGER     | NOT NULL                                 | 1-12                      |
| `request_count` | INTEGER     | NOT NULL, default 0                      | Incrémenté à chaque appel |
| `updated_at`    | TIMESTAMPTZ | NOT NULL                                 |                           |

**Contrainte unique** : `(user_id, year, month)` — une ligne par mois par utilisateur.

**Règles métier :**
- Incrémenté atomiquement à chaque requête d'agent réussie
- `request_count >= limit` → HTTP 429 (quota dépassé)
- Les superusers et les plans enterprise ne sont pas soumis au quota

---

## Flux Stripe (résumé)

```
1. POST /subscriptions/create-checkout
   → Crée/réutilise Stripe Customer
   → Crée Stripe Checkout Session (mode=subscription, trial_period_days=7)
   → Retourne checkout_url

2. Utilisateur paie sur Stripe Checkout

3. Stripe → POST /webhooks/stripe
   checkout.session.completed       → Upgrade subscription en DB
   customer.subscription.updated    → Sync status + period_end
   customer.subscription.deleted    → Downgrade vers starter
   invoice.payment_failed           → status = past_due

4. DELETE /subscriptions/me
   → stripe.Subscription.modify(cancel_at_period_end=True)
   → subscription reste active jusqu'à current_period_end
```

---

## Variables d'environnement requises

| Variable               | Requis | Description                              |
|------------------------|--------|------------------------------------------|
| `DATABASE_URL`         | ✅     | URL asyncpg PostgreSQL                   |
| `SECRET_KEY`           | ✅     | Clé JWT (32 octets hex minimum)          |
| `STRIPE_SECRET_KEY`    | ✅ prod| Clé secrète Stripe (`sk_live_...`)       |
| `STRIPE_WEBHOOK_SECRET`| ✅ prod| Secret webhook Stripe (`whsec_...`)      |
| `STRIPE_PRICE_PRO`     | ✅ prod| Price ID Stripe plan Pro                 |
| `STRIPE_PRICE_ENTERPRISE`| ✅ prod| Price ID Stripe plan Enterprise        |
| `ANTHROPIC_API_KEY`    | ✅     | Clé API Anthropic                        |
| `FRONTEND_URL`         | ✅     | URL du frontend Next.js                  |
