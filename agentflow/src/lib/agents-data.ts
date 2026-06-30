export type Agent = {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  tags: string[];
  features: string[];
  icon: string;
  popular: boolean;
};

export const categories = [
  "Tous",
  "Productivité",
  "Marketing",
  "Finance",
  "RH",
  "Support client",
  "Développement",
  "Analyse de données",
];

export const agents: Agent[] = [
  {
    id: "email-writer",
    name: "EmailCraft",
    description: "Rédige des emails professionnels percutants en quelques secondes.",
    longDescription:
      "EmailCraft analyse votre contexte, votre destinataire et votre objectif pour générer des emails professionnels adaptés à chaque situation. Relances, propositions commerciales, réponses clients — tout y passe.",
    category: "Productivité",
    price: 9,
    rating: 4.8,
    reviews: 312,
    tags: ["Email", "Rédaction", "Productivité"],
    features: [
      "Génération d'emails en moins de 5 secondes",
      "Adaptation du ton selon le destinataire",
      "Templates pour 20+ contextes professionnels",
      "Intégration Gmail & Outlook",
      "Suivi des performances email",
    ],
    icon: "✉️",
    popular: true,
  },
  {
    id: "data-analyst",
    name: "DataSense",
    description: "Analyse vos données brutes et génère des insights actionnables.",
    longDescription:
      "DataSense ingère vos fichiers CSV, Excel ou vos bases de données et produit automatiquement des rapports visuels avec les tendances clés, anomalies et recommandations stratégiques.",
    category: "Analyse de données",
    price: 19,
    rating: 4.9,
    reviews: 198,
    tags: ["Data", "Analyse", "Reporting"],
    features: [
      "Connexion CSV, Excel, SQL, Google Sheets",
      "Génération automatique de graphiques",
      "Détection d'anomalies en temps réel",
      "Rapports PDF exportables",
      "Alertes sur seuils personnalisables",
    ],
    icon: "📊",
    popular: true,
  },
  {
    id: "social-manager",
    name: "SocialPulse",
    description: "Planifie et publie du contenu optimisé sur tous vos réseaux.",
    longDescription:
      "SocialPulse génère, programme et publie votre contenu sur LinkedIn, Twitter, Instagram et TikTok. Il analyse les meilleures heures de publication et adapte le format à chaque plateforme.",
    category: "Marketing",
    price: 14,
    rating: 4.7,
    reviews: 445,
    tags: ["Social media", "Contenu", "Marketing"],
    features: [
      "Génération de posts pour 5 plateformes",
      "Planification sur 30 jours",
      "Analyse des performances",
      "Hashtags optimisés automatiquement",
      "Recyclage intelligent de contenu",
    ],
    icon: "📱",
    popular: true,
  },
  {
    id: "support-bot",
    name: "SupportFlow",
    description: "Agent de support client 24/7 qui résout 80% des tickets automatiquement.",
    longDescription:
      "SupportFlow s'intègre à votre base de connaissances et répond aux questions clients en temps réel. Il escalade intelligemment les cas complexes vers vos équipes humaines.",
    category: "Support client",
    price: 24,
    rating: 4.6,
    reviews: 267,
    tags: ["Support", "Chat", "Automatisation"],
    features: [
      "Réponses en moins de 2 secondes",
      "Base de connaissances personnalisable",
      "Escalade automatique des cas complexes",
      "Intégration Zendesk, Intercom, Freshdesk",
      "Rapports de satisfaction quotidiens",
    ],
    icon: "🤖",
    popular: false,
  },
  {
    id: "hr-recruiter",
    name: "TalentAI",
    description: "Pré-sélectionne les meilleurs candidats et planifie les entretiens.",
    longDescription:
      "TalentAI analyse les CVs, génère des scores de compatibilité et automatise la prise de contact avec les candidats retenus. Il réduit le temps de recrutement de 60%.",
    category: "RH",
    price: 29,
    rating: 4.5,
    reviews: 134,
    tags: ["RH", "Recrutement", "IA"],
    features: [
      "Analyse de CVs en masse",
      "Score de compatibilité IA",
      "Emails de contact automatisés",
      "Planification d'entretiens intégrée",
      "Dashboard pipeline recrutement",
    ],
    icon: "👥",
    popular: false,
  },
  {
    id: "finance-tracker",
    name: "BudgetBot",
    description: "Surveille vos finances, détecte les anomalies et prédit vos flux.",
    longDescription:
      "BudgetBot se connecte à vos comptes bancaires et ERP pour surveiller vos flux en temps réel, détecter les dépenses anormales et vous fournir des prévisions de trésorerie à 90 jours.",
    category: "Finance",
    price: 34,
    rating: 4.8,
    reviews: 89,
    tags: ["Finance", "Comptabilité", "Prévisions"],
    features: [
      "Connexion aux principaux ERP",
      "Alertes en temps réel",
      "Prévisions de trésorerie à 90 jours",
      "Rapports mensuels automatiques",
      "Détection de fraude IA",
    ],
    icon: "💰",
    popular: false,
  },
  {
    id: "code-reviewer",
    name: "CodeGuard",
    description: "Review votre code, détecte les bugs et suggère des optimisations.",
    longDescription:
      "CodeGuard s'intègre à GitHub, GitLab ou Bitbucket et effectue des code reviews automatiques à chaque pull request. Il détecte les vulnérabilités, les anti-patterns et propose des refactorisations.",
    category: "Développement",
    price: 19,
    rating: 4.9,
    reviews: 521,
    tags: ["Code", "Dev", "Sécurité"],
    features: [
      "Review automatique sur PR",
      "Détection de vulnérabilités OWASP",
      "Suggestions de refactoring",
      "Support 20+ langages",
      "Intégration GitHub Actions / CI-CD",
    ],
    icon: "🔍",
    popular: true,
  },
  {
    id: "seo-optimizer",
    name: "SEOMax",
    description: "Optimise votre contenu pour le SEO et booste votre visibilité Google.",
    longDescription:
      "SEOMax analyse votre contenu existant, identifie les opportunités de mots-clés et génère des suggestions d'optimisation on-page pour chaque page de votre site.",
    category: "Marketing",
    price: 14,
    rating: 4.6,
    reviews: 378,
    tags: ["SEO", "Marketing", "Contenu"],
    features: [
      "Audit SEO complet automatisé",
      "Suggestions de mots-clés longue traîne",
      "Optimisation des méta-données",
      "Analyse de la concurrence",
      "Suivi du positionnement",
    ],
    icon: "🔎",
    popular: false,
  },
];
