export type UsageExample = {
  label: string;
  prompt: string;
};

export type UsageGuide = {
  steps: string[];
  examples: UsageExample[];
};

export const usageGuides: Record<string, UsageGuide> = {
  "email-writer": {
    steps: [
      "Décrivez le contexte : qui est le destinataire et quel est votre objectif",
      "Précisez le ton souhaité (formel, amical, urgent…)",
      "Indiquez les informations clés à inclure (montant, date, nom…)",
    ],
    examples: [
      {
        label: "Relance facture impayée",
        prompt:
          "Rédige une relance professionnelle pour une facture de 2 400 € impayée depuis 30 jours. Destinataire : directeur financier d'une PME. Ton ferme mais courtois. Inclure la référence facture FAC-2024-089 et une date limite de paiement sous 7 jours.",
      },
      {
        label: "Proposition commerciale",
        prompt:
          "Écris un email de prospection pour présenter notre logiciel de gestion RH à un DRH de grande entreprise. Met en avant le gain de temps (40% selon nos clients) et propose un demo de 30 min. Ton professionnel et percutant.",
      },
      {
        label: "Refus de candidature",
        prompt:
          "Rédige un email de refus poli et bienveillant pour un candidat au poste de développeur senior qui n'a pas été retenu. Remercie-le pour sa candidature et encourage-le à postuler à de futures offres.",
      },
      {
        label: "Email de bienvenue client",
        prompt:
          "Crée un email de bienvenue chaleureux pour un nouveau client qui vient de s'abonner à notre SaaS. Inclure : prochaines étapes pour démarrer, lien vers la doc, contact du support, et un ton enthousiaste.",
      },
    ],
  },

  "data-analyst": {
    steps: [
      "Collez vos données directement dans le prompt (CSV, tableau, chiffres…)",
      "Précisez ce que vous cherchez : tendances, anomalies, comparaisons",
      "Demandez le format de sortie souhaité (liste, tableau, rapport)",
    ],
    examples: [
      {
        label: "Analyse de ventes",
        prompt:
          "Voici mes chiffres de ventes sur 6 mois :\nJan: 12 400€, Fév: 9 800€, Mar: 15 200€, Avr: 18 900€, Mai: 14 300€, Jun: 21 500€\nIdentifie les 3 tendances principales, explique les variations et donne des recommandations pour le prochain trimestre.",
      },
      {
        label: "Détection d'anomalies",
        prompt:
          "Analyse ces transactions et détecte les anomalies ou dépenses anormales :\nLoyer: 2 000€, Marketing: 8 500€ (habituel: 3 000€), Salaires: 45 000€, Fournitures: 12 300€ (habituel: 1 200€), Logiciels: 890€\nIndique pour chaque anomalie le niveau de risque et une explication possible.",
      },
      {
        label: "Rapport hebdomadaire",
        prompt:
          "Génère un rapport hebdomadaire structuré à partir de ces KPIs :\n- Nouveaux utilisateurs: 342 (+18% vs semaine dernière)\n- Churn: 2.3% (-0.5%)\n- MRR: 28 400€ (+5%)\n- NPS: 67\nFormat: résumé exécutif, points positifs, points d'attention, recommandations.",
      },
      {
        label: "Prévision de trésorerie",
        prompt:
          "Sur la base de mes entrées moyennes (25 000€/mois) et de mes charges fixes (18 000€/mois) et variables estimées à 4 000€/mois, génère une prévision de trésorerie sur 90 jours avec 3 scénarios : optimiste, réaliste, pessimiste.",
      },
    ],
  },

  "social-manager": {
    steps: [
      "Indiquez la plateforme cible (LinkedIn, Instagram, Twitter/X, TikTok)",
      "Décrivez le sujet, le produit ou l'événement à promouvoir",
      "Précisez votre audience et le ton souhaité",
    ],
    examples: [
      {
        label: "Posts LinkedIn lancement produit",
        prompt:
          "Crée 3 posts LinkedIn pour le lancement de notre nouvelle fonctionnalité IA d'analyse de contrats juridiques. Audience : directeurs juridiques et avocats d'affaires. Ton expert et inspirant. Inclure un call-to-action vers notre démo gratuite. Max 1 300 caractères chacun.",
      },
      {
        label: "Calendrier Instagram 2 semaines",
        prompt:
          "Génère un calendrier de contenu Instagram pour les 2 prochaines semaines pour une marque de cosmétiques naturels. 1 post par jour, alterner : tutoriels, coulisses de fabrication, témoignages clients, promotions. Indique le type de visuel recommandé pour chaque post.",
      },
      {
        label: "Recycler un article en tweets",
        prompt:
          "Transforme ce titre d'article en 5 tweets engageants avec hashtags :\n'Comment notre startup a réduit son churn de 40% en 3 mois grâce à l'onboarding proactif'\nTon : direct, avec chiffres impactants. Varier les angles : astuce, question, statistique, histoire.",
      },
      {
        label: "Bio & présentation profil",
        prompt:
          "Rédige une bio percutante pour notre compte LinkedIn d'entreprise. Secteur : fintech B2B. Valeur principale : automatiser la comptabilité des PME. 3 lignes max. Inclure notre USP et un verbe d'action fort en début.",
      },
    ],
  },

  "support-bot": {
    steps: [
      "Décrivez le problème client tel qu'il vous a été soumis",
      "Précisez le contexte (type de client, produit, historique si disponible)",
      "Indiquez le ton et la politique de votre entreprise si nécessaire",
    ],
    examples: [
      {
        label: "Remboursement refusé",
        prompt:
          "Un client demande un remboursement pour un achat effectué il y a 45 jours. Notre politique est de 30 jours. Il est très mécontent et menace de laisser un avis négatif. Rédige une réponse empathique qui explique la politique tout en proposant une alternative (bon d'achat, geste commercial).",
      },
      {
        label: "Bug non reproductible",
        prompt:
          "Un client signale que l'export PDF ne fonctionne pas mais nous n'arrivons pas à reproduire le bug. Il utilise Chrome sur Windows 11. Rédige une réponse professionnelle qui demande les informations nécessaires au diagnostic (étapes, version, screenshot) tout en rassurant le client.",
      },
      {
        label: "Annulation d'abonnement",
        prompt:
          "Un client veut annuler son abonnement Pro (89€/mois) après 8 mois. Il dit que le produit est 'trop compliqué'. Rédige une réponse de rétention qui propose de l'aide (onboarding personnalisé, appel avec un expert) et une offre de fidélité (1 mois offert).",
      },
      {
        label: "FAQ automatique : livraison",
        prompt:
          "Crée 5 réponses types pour les questions fréquentes sur la livraison :\n1. Délai de livraison standard\n2. Livraison express disponible ?\n3. Suivi de commande\n4. Colis non reçu\n5. Livraison à l'international\nTon : clair, rassurant, max 3 lignes par réponse.",
      },
    ],
  },

  "hr-recruiter": {
    steps: [
      "Collez le CV ou la description du candidat dans le prompt",
      "Précisez le poste et les critères prioritaires (compétences, expérience…)",
      "Indiquez le contexte de l'entreprise si pertinent",
    ],
    examples: [
      {
        label: "Analyse de CV",
        prompt:
          "Analyse ce profil et évalue sa compatibilité pour un poste de Lead Developer React/Node.js (6+ ans d'expérience, management d'une équipe de 3 personnes, startup SaaS B2B) :\n[COLLEZ LE CV ICI]\nNote sur 10, points forts, points de vigilance, questions à poser en entretien.",
      },
      {
        label: "Email convocation entretien",
        prompt:
          "Rédige un email de convocation à un entretien pour Sophie Martin, candidate au poste de Responsable Marketing. Entretien le 15 janvier à 14h30 en visio (lien Teams). Prévoir 45 min. Ton : professionnel et accueillant. Inclure : comment se préparer, qui sera présent.",
      },
      {
        label: "Offre d'emploi percutante",
        prompt:
          "Rédige une offre d'emploi attractive pour un poste de Customer Success Manager. Stack : Salesforce, Intercom. Expérience : 2-4 ans. Remote-friendly. Salaire : 38-45K€. Met en avant la culture d'entreprise et les avantages (RTT, mutuelle premium, budget formation). Max 400 mots.",
      },
      {
        label: "Score comparatif candidats",
        prompt:
          "Compare ces 3 candidats pour un poste de Data Analyst (SQL, Python, Tableau) :\nCandidat A : 3 ans exp., Master stats, connaît SQL et Python mais jamais utilisé Tableau\nCandidat B : 5 ans exp., autodidacte, maîtrise les 3 outils, pas de diplôme\nCandidat C : 2 ans exp., école de commerce, Tableau expert, Python basique\nDonne un tableau comparatif avec scores et recommandation.",
      },
    ],
  },

  "finance-tracker": {
    steps: [
      "Partagez vos données financières (relevés, tableaux, chiffres clés)",
      "Précisez la période analysée et vos objectifs",
      "Indiquez si vous voulez une analyse, une prévision ou une alerte",
    ],
    examples: [
      {
        label: "Analyse des dépenses du mois",
        prompt:
          "Analyse mes dépenses de juin et identifie les postes anormaux :\nLoyer: 3 200€, Salaires: 28 000€, Marketing digital: 6 800€, Abonnements SaaS: 2 100€, Frais bancaires: 890€, Déplacements: 4 200€, Fournitures: 340€\nCompare avec un budget standard pour une startup SaaS de 8 personnes et indique où je peux optimiser.",
      },
      {
        label: "Prévision trésorerie 90 jours",
        prompt:
          "Génère une prévision de trésorerie sur 90 jours :\n- Solde actuel : 87 000€\n- Rentrées mensuelles récurrentes : 42 000€ (abonnements) + 8 000€ (variable)\n- Charges fixes : 38 500€/mois\n- Échéances prévues : TVA 12 000€ en juillet, renouvellement serveurs 5 000€ en août\n3 scénarios avec recommandations.",
      },
      {
        label: "Détection de fraude",
        prompt:
          "Analyse ces transactions et identifie les opérations suspectes :\n- 12/06 Achat matériel 450€ (habituel)\n- 14/06 Virement international Malte 8 900€ (inhabituel)\n- 15/06 Abonnement inconnu 299€/mois\n- 18/06 Achat Amazon 12 400€ en dehors des horaires de bureau\nNiveau de risque pour chaque transaction et recommandations.",
      },
      {
        label: "Rapport mensuel automatique",
        prompt:
          "Génère un rapport financier mensuel synthétique pour juin 2025 :\n- CA : 89 400€ (+12% vs mai)\n- Charges : 62 100€\n- EBITDA : 27 300€ (marge 30.5%)\n- Cash : 145 000€\n- ARR : 1 072 800€\nFormat : résumé DG (5 lignes), tableau des KPIs, 3 points d'action prioritaires.",
      },
    ],
  },

  "code-reviewer": {
    steps: [
      "Collez votre code directement dans le prompt",
      "Précisez le langage, le framework et ce que le code est censé faire",
      "Indiquez si vous cherchez : bugs, sécurité, performance ou lisibilité",
    ],
    examples: [
      {
        label: "Review sécurité SQL",
        prompt:
          "Analyse ce code Python pour des vulnérabilités SQL injection et autres problèmes de sécurité :\n```python\ndef get_user(username):\n    query = f\"SELECT * FROM users WHERE username = '{username}'\"\n    return db.execute(query)\n```\nIndique le niveau de risque, l'explication de la vulnérabilité et le code corrigé.",
      },
      {
        label: "Optimisation React",
        prompt:
          "Review ce composant React et suggère des optimisations de performance et de lisibilité :\n```jsx\n// COLLEZ VOTRE COMPOSANT ICI\n```\nCherche : re-renders inutiles, mémo manquants, props drilling, conventions React 18+.",
      },
      {
        label: "Détection de bugs logiques",
        prompt:
          "Ce code est censé calculer la moyenne d'un tableau en excluant les valeurs nulles, mais il retourne parfois NaN. Trouve le bug :\n```javascript\nfunction average(arr) {\n  const filtered = arr.filter(x => x != null);\n  return arr.reduce((a, b) => a + b, 0) / filtered.length;\n}\n```",
      },
      {
        label: "Audit OWASP d'une API",
        prompt:
          "Effectue un audit de sécurité OWASP Top 10 sur cette route API Express :\n```javascript\n// COLLEZ VOTRE ROUTE ICI\n```\nPour chaque vulnérabilité trouvée : description, impact, correction avec exemple de code.",
      },
    ],
  },

  "seo-optimizer": {
    steps: [
      "Fournissez le contenu ou l'URL à analyser",
      "Précisez votre mot-clé principal et votre audience cible",
      "Indiquez si vous voulez un audit, des suggestions ou du contenu optimisé",
    ],
    examples: [
      {
        label: "Audit SEO d'une page",
        prompt:
          "Effectue un audit SEO complet de cette page. Titre actuel : 'Logiciel RH - Gestion des ressources humaines'. Contenu principal : [COLLEZ LE CONTENU]. Mot-clé cible : 'logiciel RH PME'. Identifie : problèmes on-page, densité de mots-clés, structure H1/H2, méta-description, et donne un score /100.",
      },
      {
        label: "Mots-clés longue traîne",
        prompt:
          "Génère 15 mots-clés longue traîne avec intention de recherche pour un article sur 'automatisation comptabilité TPE'. Classe-les par : volume estimé (élevé/moyen/faible), intention (informationnelle/transactionnelle/navigationnelle), et difficulté (facile/moyenne/difficile).",
      },
      {
        label: "Optimisation méta-données",
        prompt:
          "Optimise ces méta-données pour le mot-clé 'CRM PME gratuit' :\nTitle actuel : 'Notre CRM - Gérez vos clients'\nDescription actuelle : 'Découvrez notre logiciel CRM pour gérer vos clients et prospects.'\nPropose 3 variantes de title (max 60 cars) et 3 variantes de description (max 160 cars) optimisées pour le CTR.",
      },
      {
        label: "Plan d'article optimisé",
        prompt:
          "Crée un plan d'article SEO complet sur 'comment choisir un ERP pour PME'. Audience : dirigeants de PME 10-50 salariés. Longueur cible : 2 000 mots. Inclure : H2/H3 structurés, mots-clés secondaires à placer, questions FAQ à intégrer (People Also Ask), et suggestion d'interliens.",
      },
    ],
  },

  "apartment-finder": {
    steps: [
      "Donnez votre budget (achat ou loyer), la ville et le type de bien souhaité",
      "Collez l'annonce à analyser ou décrivez vos critères de recherche",
      "Obtenez une analyse du prix, des red flags et une checklist de visite",
    ],
    examples: [
      { label: "Analyser une annonce", prompt: "Analyse cette annonce : T3 de 65m² à Lyon 6e, 1 450€/mois charges comprises, 4e étage sans ascenseur, copropriété de 1972, DPE E. Est-ce un bon rapport qualité/prix ? Quels red flags ?" },
      { label: "Définir mes critères", prompt: "Budget achat : 280 000€ à Paris ou petite couronne. Je cherche 2 pièces minimum, RER A ou B, calme, cuisine ouverte. Aide-moi à prioriser mes critères et les quartiers à cibler." },
      { label: "Préparer ma visite", prompt: "Je visite demain un appartement des années 60 en copropriété. Génère-moi une checklist complète de ce que je dois vérifier (structure, humidité, chauffage, charges, règlement de copro)." },
      { label: "Négocier le prix", prompt: "Appartement affiché 320 000€, sur le marché depuis 3 mois, DPE D, travaux de cuisine à prévoir. Comment négocier ? Quel prix proposer et avec quels arguments ?" },
    ],
  },

  "job-finder": {
    steps: [
      "Partagez votre profil (expérience, compétences, niveau) et le type de poste recherché",
      "Collez une offre d'emploi pour une analyse détaillée",
      "Obtenez une stratégie de candidature et une lettre de motivation automatique",
    ],
    examples: [
      { label: "Analyser une offre", prompt: "Analyse cette offre de développeur React Senior chez une fintech : [COLLEZ L'OFFRE]. Est-ce que mon profil (5 ans React, 2 ans Next.js, pas d'expérience finance) correspond ? Qu'est-ce que je dois mettre en avant ?" },
      { label: "Optimiser mon CV", prompt: "Voici mon CV actuel : [COLLEZ LE CONTENU]. Je postule à des postes de Product Manager en startup. Dis-moi ce qui manque, ce qui est inutile, et comment reformuler mes expériences pour maximiser mes chances." },
      { label: "Préparer un entretien", prompt: "J'ai un entretien technique pour un poste de Data Scientist chez Leboncoin. Prépare-moi 10 questions probables (Python, ML, SQL, cas pratiques) avec les réponses attendues." },
      { label: "Générer une lettre", prompt: "Postule pour moi : voici l'offre [OFFRE] et mon profil [PROFIL]. Génère une lettre de motivation percutante et personnalisée." },
    ],
  },

  "cover-letter": {
    steps: [
      "Collez l'offre d'emploi complète",
      "Décrivez votre expérience et 1-2 réalisations concrètes",
      "Précisez le ton souhaité (dynamique, formel, créatif)",
    ],
    examples: [
      { label: "Lettre pour startup tech", prompt: "Offre : Lead Frontend React chez une startup SaaS B2B, 5 ans d'XP requis, culture flat hierarchy, valeurs : autonomie et impact. Mon profil : 6 ans React/TypeScript, j'ai migré une app monolithique en micro-frontend chez mon employeur actuel (+40% perf). Rédige une lettre dynamique, max 350 mots." },
      { label: "Lettre reconversion", prompt: "Je me reconvertis du marketing digital vers le product management. J'ai 4 ans en growth marketing et je viens d'obtenir ma certification PSPO. Offre : Junior PM dans une scale-up e-commerce. Aide-moi à valoriser ma reconversion sans que ça soit une faiblesse." },
      { label: "Lettre grand groupe", prompt: "Poste de consultant senior en transformation digitale chez Capgemini. Mon expérience : 8 ans en conseil, spécialiste retail et supply chain. Rédige une lettre formelle et structurée qui montre ma maîtrise des enjeux métier et tech." },
      { label: "Lettre sans expérience", prompt: "Alternance développeur web, je suis en BUT informatique 2e année. J'ai fait 3 projets perso (un SaaS en React/Node, une app mobile Flutter). Pas d'expérience professionnelle. Aide-moi à compenser avec mes projets et ma motivation." },
    ],
  },

  "car-finder": {
    steps: [
      "Indiquez votre budget total (achat + assurance + entretien) et votre usage principal",
      "Collez une annonce ou demandez une comparaison de modèles",
      "Obtenez une analyse détaillée et une checklist avant achat",
    ],
    examples: [
      { label: "Comparer des modèles", prompt: "Budget 15 000€ pour une voiture d'occasion. Usage : 80% ville (Paris), quelques longs trajets. Je hésite entre une Peugeot 208, une Renault Clio et une Toyota Yaris. Compare fiabilité, coût d'entretien, consommation et revente à 5 ans." },
      { label: "Analyser une annonce", prompt: "Analyse cette annonce : Volkswagen Golf 7 TDI 115, 2016, 98 000km, 11 500€, carnet d'entretien VW partout, 2 propriétaires, CT valide 2025, vendu par un particulier. Est-ce que c'est un bon prix ? Red flags ?" },
      { label: "Coût total de possession", prompt: "Je veux acheter une Tesla Model 3 occasion 2020 à 28 000€. Calcule le coût total de possession sur 5 ans : assurance estimée, entretien, électricité vs essence, dépréciation. Compare avec une BMW Série 3 essence équivalente." },
      { label: "Checklist inspection", prompt: "Je vais voir demain une Renault Kadjar 2018 diesel chez un particulier. Génère-moi une checklist complète d'inspection : extérieur, intérieur, moteur, essai, documents à vérifier." },
    ],
  },

  "fullstack-dev": {
    steps: [
      "Décrivez votre stack technique et le problème ou la feature à développer",
      "Collez votre code pour une review ou un debug",
      "Obtenez du code production-ready avec explications",
    ],
    examples: [
      { label: "Créer une API REST", prompt: "Crée une API REST en FastAPI pour gérer des articles de blog : CRUD complet, authentification JWT, pagination, filtre par catégorie. Base de données PostgreSQL avec SQLAlchemy async. Inclure les schémas Pydantic et la structure de projet." },
      { label: "Composant React complexe", prompt: "Crée un composant React TypeScript de table de données avec : tri multi-colonnes, filtres, pagination côté client, sélection multiple avec actions bulk, export CSV. Utilise Tailwind CSS pour le style." },
      { label: "Debug une erreur", prompt: "J'obtiens cette erreur en production : [COLLEZ L'ERREUR ET LE CODE]. C'est une app Next.js 14 avec App Router. L'erreur apparaît uniquement en prod, pas en dev. Aide-moi à diagnostiquer." },
      { label: "Architecture microservices", prompt: "Je veux migrer une application monolithique FastAPI vers des microservices. L'app gère : users, produits, commandes, notifications. Propose une architecture avec les services, la communication (REST vs message queue), et les étapes de migration sans downtime." },
    ],
  },

  "security-auditor": {
    steps: [
      "Collez le code, la configuration ou l'architecture à auditer",
      "Précisez le contexte (type d'appli, stack, environnement)",
      "Obtenez un rapport de vulnérabilités priorisé avec corrections",
    ],
    examples: [
      { label: "Audit API authentification", prompt: "Audite ce système d'authentification JWT : [COLLEZ LE CODE]. Vérifie : stockage des tokens, expiration, refresh, protection contre le vol de session, brute force, et conformité aux bonnes pratiques OWASP." },
      { label: "Vérifier injection SQL", prompt: "Analyse ce repository FastAPI/SQLAlchemy pour des risques d'injection SQL et d'exposition de données : [COLLEZ LES ROUTES]. Note chaque faille avec son niveau de criticité et propose le correctif." },
      { label: "Audit config serveur", prompt: "Voici ma configuration Nginx et mes variables d'environnement (sanitisées) : [CONFIG]. Identifie les problèmes de sécurité : headers manquants, ports exposés, secrets, HTTPS, CORS trop permissif." },
      { label: "Scan dépendances", prompt: "Voici mon package.json / requirements.txt : [COLLEZ]. Identifie les dépendances avec des CVE connus, celles qui sont abandonnées, et recommande des alternatives sécurisées." },
    ],
  },

  "lead-dev": {
    steps: [
      "Présentez votre contexte technique (stack, taille équipe, maturité)",
      "Soumettez une décision d'architecture ou un code à reviewer",
      "Obtenez une analyse experte avec recommandations et ADR",
    ],
    examples: [
      { label: "Décision d'architecture", prompt: "On doit choisir entre une architecture monolithique modulaire ou des microservices pour notre SaaS B2B (5 devs, 2 000 clients, 500k req/jour prévu). Rédige un ADR (Architecture Decision Record) avec les trade-offs, notre contexte et la recommandation." },
      { label: "Code review complète", prompt: "Review cette PR : [COLLEZ LE DIFF]. Équipe junior-mid. Critères : lisibilité, performance, sécurité, tests manquants, dette technique. Donne du feedback constructif comme un lead qui mentore." },
      { label: "Standards de code", prompt: "On démarre un nouveau projet React/TypeScript/FastAPI avec 4 devs. Rédige nos conventions de code, structure de projet, règles de nommage, workflow Git (branching strategy), standards de PR et de revue." },
      { label: "Estimation technique", prompt: "Voici 5 US du prochain sprint : [COLLEZ LES STORIES]. Estime la complexité (story points), identifie les risques techniques, les dépendances et les points à clarifier avec le PO avant de commencer." },
    ],
  },

  "project-manager": {
    steps: [
      "Décrivez votre projet (objectif, périmètre, équipe, délais)",
      "Demandez un livrable spécifique : planning, risk register, rapport",
      "L'agent peut coordonner avec PO et Lead Dev pour des réponses complètes",
    ],
    examples: [
      { label: "Créer un planning", prompt: "On lance un projet de refonte de notre site e-commerce. Équipe : 2 devs, 1 designer, 1 PO. Délai : 4 mois. Phases : audit, design, dev, tests, déploiement. Crée un planning avec jalons clés, dépendances et buffer de risque." },
      { label: "Register des risques", prompt: "Projet de migration cloud (on-premise → AWS) pour une app critique utilisée 24h/24. Identifie les 10 risques principaux avec probabilité, impact, plan de mitigation et responsable." },
      { label: "Rapport d'avancement", prompt: "Sprint 3 terminé : 34/40 points livrés, 2 bugs critiques découverts en recette, le designer est absent la semaine prochaine. Rédige un rapport d'avancement pour les stakeholders avec statut RAG, causes des écarts et plan d'action." },
      { label: "Gérer un dérapage", prompt: "On est à J-30 de la livraison et on a 3 semaines de retard sur le développement. Le client est difficile à joindre. Aide-moi à construire un plan de rattrapage réaliste et préparer la conversation avec le client." },
    ],
  },

  "product-owner": {
    steps: [
      "Décrivez le contexte produit et les besoins utilisateurs",
      "Demandez des user stories, une priorisation ou une roadmap",
      "Collaborez avec le Scrum Master et Lead Dev via les connexions inter-agents",
    ],
    examples: [
      { label: "Rédiger des user stories", prompt: "Feature : système de notifications in-app pour notre SaaS RH. Utilisateurs : managers et RH. Rédige 5 user stories complètes avec critères d'acceptation GIVEN/WHEN/THEN et story points estimés." },
      { label: "Prioriser le backlog", prompt: "Voici 12 features en attente : [LISTEZ]. Budget équipe : 2 sprints (2 devs). Applique le scoring RICE et le modèle MoSCoW pour prioriser. Justifie chaque décision avec des arguments business." },
      { label: "Définir la roadmap", prompt: "On a levé des fonds, on passe de 2 à 6 devs. Produit actuel : MVP avec 200 clients. Objectif Q4 : 1 000 clients. Aide-moi à construire la roadmap Q3-Q4 avec les grandes thématiques, les epics et les critères de succès." },
      { label: "Analyser des feedbacks", prompt: "Voici 50 feedbacks clients collectés ce mois : [COLLEZ LES FEEDBACKS]. Identifie les thèmes récurrents, priorise les pain points et propose 3 user stories à ajouter au backlog en priorité." },
    ],
  },

  "scrum-master": {
    steps: [
      "Indiquez la taille de votre équipe, la durée de sprint et le contexte",
      "Demandez un format de cérémonie, une analyse de vélocité ou une aide à un problème",
      "Obtenez des templates prêts à l'emploi et des recommandations concrètes",
    ],
    examples: [
      { label: "Planifier un sprint", prompt: "Sprint 8, équipe de 4 devs (capacité 120h). Backlog : 15 stories pour 95 points. Vélocité moyenne : 35 pts. Aide-moi à choisir les stories, définir le sprint goal et décomposer les tâches techniques." },
      { label: "Animer une rétro", prompt: "L'équipe traverse une période de tension (deadlines serrées, 2 bugs critiques en prod ce sprint). Propose un format de rétrospective adapté à ce contexte avec le déroulé, les questions et comment gérer les tensions." },
      { label: "Analyser la vélocité", prompt: "Voici nos 8 derniers sprints : [Sprint 1: 32pts, Sprint 2: 28pts, Sprint 3: 41pts, Sprint 4: 25pts, Sprint 5: 38pts, Sprint 6: 30pts, Sprint 7: 35pts, Sprint 8: 22pts]. Analyse la tendance, identifie les anomalies et préconise des actions." },
      { label: "Résoudre un impediment", prompt: "Impediment : les déploiements manuels prennent 3h par sprint et bloquent les tests. L'infra est gérée par une autre équipe peu réactive. Comment structurer la résolution de cet impediment et escalader efficacement ?" },
    ],
  },

  "profile-finder": {
    steps: [
      "Décrivez le profil recherché : rôle, compétences, séniorité, localisation",
      "Précisez le canal de recherche (LinkedIn, GitHub, Stack Overflow…)",
      "Obtenez des requêtes Boolean prêtes à l'emploi et des templates de message",
    ],
    examples: [
      { label: "Boolean Search LinkedIn", prompt: "Je cherche un développeur React Senior freelance, basé en France ou remote EU. 5+ ans XP, expérience startup ou scale-up. Génère 3 requêtes Boolean Search LinkedIn avec variantes, et explique chaque opérateur." },
      { label: "Analyser un profil", prompt: "Analyse ce profil LinkedIn pour un poste de Data Engineer senior chez nous (stack : Python, Spark, Airflow, GCP) : [COLLEZ LE PROFIL]. Score de matching, points forts, lacunes, et 3 questions à poser en entretien." },
      { label: "Message de prise de contact", prompt: "J'ai trouvé un excellent profil CTO sur LinkedIn. Il est passif (pas en recherche active). Il a co-fondé 2 startups SaaS. Rédige un message LinkedIn de prise de contact percutant, personnalisé, max 300 caractères (InMail court)." },
      { label: "Stratégie de sourcing", prompt: "On recrute 3 développeurs fullstack Node.js/React en 2 mois. Équipe RH : 1 personne. Budget limité (pas de LinkedIn Recruiter). Propose une stratégie de sourcing multicanal avec les actions prioritaires, les communautés à cibler et les outils gratuits." },
    ],
  },
};
