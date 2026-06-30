"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Star, SlidersHorizontal, ArrowRight, Check } from "lucide-react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import type { Agent, Subscription } from "@/lib/types";

const CATEGORIES = [
  "Tous", "Productivité", "Marketing", "Finance",
  "RH", "Support client", "Développement", "Analyse de données",
];

type SortKey = "popular" | "price-asc" | "price-desc" | "rating";

export default function MarketplacePage() {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [sortBy, setSortBy] = useState<SortKey>("popular");

  useEffect(() => {
    api.get<Agent[]>("/agents")
      .then(setAgents)
      .catch(() => setError("Impossible de charger les agents. Le backend est-il démarré ?"))
      .finally(() => setFetching(false));
  }, []);

  useEffect(() => {
    if (user) {
      api.get<Subscription>("/subscriptions/me").then(setSubscription).catch(() => null);
    }
  }, [user]);

  const hasFullAccess = !!user && (user.is_superuser || subscription?.plan === "pro" || subscription?.plan === "enterprise");

  const filtered = agents
    .filter((a) => {
      const matchCat = activeCategory === "Tous" || a.category === activeCategory;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q));
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price_monthly - b.price_monthly;
      if (sortBy === "price-desc") return b.price_monthly - a.price_monthly;
      if (sortBy === "rating") return b.rating - a.rating;
      return b.reviews_count - a.reviews_count;
    });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Marketplace d&apos;agents IA</h1>
          <p className="text-slate-500 mb-8">
            {fetching ? "Chargement…" : `${agents.length} agents IA spécialisés. Abonnez-vous ou achetez à l'unité.`}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher un agent…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
              >
                <option value="popular">Plus populaires</option>
                <option value="rating">Mieux notés</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Error state */}
        {error && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-slate-500">{error}</p>
          </div>
        )}

        {/* Loading skeletons */}
        {fetching && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
                <div className="w-10 h-10 bg-slate-100 rounded-xl mb-4" />
                <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-100 rounded w-full mb-1" />
                <div className="h-3 bg-slate-100 rounded w-2/3 mb-4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {!fetching && !error && (
          <>
            <p className="text-sm text-slate-500 mb-6">
              {filtered.length} agent{filtered.length > 1 ? "s" : ""} trouvé{filtered.length > 1 ? "s" : ""}
            </p>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtered.map((agent) => (
                  <div
                    key={agent.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-indigo-200 transition-all group"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-3xl">{agent.icon}</div>
                        {agent.reviews_count > 200 && (
                          <span className="text-xs bg-amber-50 text-amber-700 border border-amber-100 font-medium px-2 py-0.5 rounded-full">
                            Populaire
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                        {agent.name}
                      </h3>
                      <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-3">
                        {agent.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {agent.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        <span className="font-medium text-slate-700">{agent.rating}</span>
                        <span>({agent.reviews_count} avis)</span>
                      </div>
                    </div>
                    <div className="px-6 pb-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      {hasFullAccess ? (
                        <div className="flex items-center gap-1.5">
                          <Check size={14} className="text-emerald-500" strokeWidth={2.5} />
                          <span className="text-sm font-semibold text-emerald-600">Accès inclus</span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-lg font-bold text-slate-900">{agent.price_monthly}€</span>
                          <span className="text-xs text-slate-400">/mois</span>
                        </div>
                      )}
                      <Link
                        href={`/agents/${agent.slug}`}
                        className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        Utiliser <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-slate-500 text-lg">Aucun agent pour &quot;{search}&quot;</p>
                <button
                  onClick={() => { setSearch(""); setActiveCategory("Tous"); }}
                  className="mt-4 text-sm text-indigo-600 hover:underline"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
