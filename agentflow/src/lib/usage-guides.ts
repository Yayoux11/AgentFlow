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
};
