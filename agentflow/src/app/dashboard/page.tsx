"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Zap, BarChart3, ArrowUpRight, Star, Settings, Play, Pause,
  Bell, CreditCard, Users, TrendingUp, Clock, Plus, Loader2, Crown,
  MessageSquare, Activity,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import type { Agent, Subscription, UsageStats } from "@/lib/types";

const PLAN_LABEL: Record<string, string> = { starter: "Starter", pro: "Pro", enterprise: "Enterprise" };
const PLAN_COLOR: Record<string, string> = {
  starter: "bg-slate-100 text-slate-600",
  pro: "bg-indigo-100 text-indigo-700",
  enterprise: "bg-amber-100 text-amber-700",
};

interface Analytics {
  total_requests: number;
  requests_this_month: number;
  tokens_this_month: number;
  per_agent: { slug: string; name: string; icon: string; request_count: number }[];
  recent_activity: {
    agent_name: string;
    agent_icon: string;
    agent_slug: string;
    prompt_preview: string;
    tokens: number;
    created_at: string;
  }[];
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "À l'instant";
  if (m < 60) return `Il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Il y a ${h}h`;
  return `Il y a ${Math.floor(h / 24)}j`;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [fetching, setFetching] = useState(true);
  const [pausedIds, setPausedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    Promise.allSettled([
      api.get<Agent[]>("/agents"),
      api.get<Subscription>("/subscriptions/me"),
      api.get<UsageStats>("/subscriptions/usage"),
      api.get<Analytics>("/users/me/analytics"),
    ]).then(([agentsRes, subRes, usageRes, analyticsRes]) => {
      if (agentsRes.status === "fulfilled") setAgents(agentsRes.value);
      if (subRes.status === "fulfilled") setSubscription(subRes.value);
      if (usageRes.status === "fulfilled") setUsage(usageRes.value);
      if (analyticsRes.status === "fulfilled") setAnalytics(analyticsRes.value);
    }).finally(() => setFetching(false));
  }, [user]);

  function toggleAgent(id: string) {
    setPausedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  const plan = usage?.plan ?? subscription?.plan ?? "starter";
  const usagePercent = usage && usage.limit > 0 ? Math.min((usage.request_count / usage.limit) * 100, 100) : 0;
  const initials = user.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user.email.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900 truncate">
                  {user.full_name ?? user.email.split("@")[0]}
                </h1>
                {user.is_superuser && <Crown size={15} className="text-amber-500 flex-shrink-0" />}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PLAN_COLOR[plan] ?? "bg-slate-100 text-slate-600"}`}>
                  {PLAN_LABEL[plan] ?? plan}
                </span>
                {subscription?.status === "past_due" && (
                  <span className="text-xs text-red-600 font-medium">Paiement en attente</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button className="relative p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors">
              <Bell size={20} />
            </button>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Ajouter un agent</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Requêtes ce mois",
              value: fetching ? "—" : (analytics?.requests_this_month ?? usage?.request_count ?? 0).toLocaleString(),
              icon: <BarChart3 size={18} className="text-indigo-600" />,
              sub: usage?.limit === -1 ? "Illimité" : `/ ${usage?.limit?.toLocaleString() ?? "—"} max`,
            },
            {
              label: "Tokens ce mois",
              value: fetching ? "—" : (analytics?.tokens_this_month ?? 0).toLocaleString(),
              icon: <Zap size={18} className="text-emerald-600" />,
              sub: "Entrée + sortie",
            },
            {
              label: "Total requêtes",
              value: fetching ? "—" : (analytics?.total_requests ?? 0).toLocaleString(),
              icon: <TrendingUp size={18} className="text-violet-600" />,
              sub: "Depuis la création",
            },
            {
              label: "Agents actifs",
              value: fetching ? "—" : (analytics?.per_agent.length ?? 0).toString(),
              icon: <Activity size={18} className="text-amber-600" />,
              sub: plan === "starter" ? "3 max (Starter)" : "Illimité",
            },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-slate-500">{s.label}</p>
                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">{s.icon}</div>
              </div>
              <p className="text-2xl font-bold text-slate-900 mb-0.5">{s.value}</p>
              <p className="text-xs text-slate-400">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agents list */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-900">Agents de la plateforme</h2>
                <Link href="/marketplace" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  Marketplace <ArrowUpRight size={14} />
                </Link>
              </div>

              {fetching ? (
                <div className="p-6 space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-slate-100 rounded w-1/3" />
                        <div className="h-3 bg-slate-100 rounded w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {agents.map((agent) => {
                    const paused = pausedIds.has(agent.id);
                    const agentUsage = analytics?.per_agent.find((p) => p.slug === agent.slug);
                    return (
                      <div key={agent.id} className="px-6 py-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative flex-shrink-0">
                            <div className="text-2xl">{agent.icon}</div>
                            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${!paused ? "bg-emerald-500" : "bg-slate-300"}`} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 text-sm truncate">{agent.name}</p>
                            <p className="text-xs text-slate-500 truncate">{agent.category}</p>
                          </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} size={11} className={i <= Math.round(agent.rating) ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-200"} />
                          ))}
                          <span className="text-xs text-slate-500 ml-1">{agent.rating}</span>
                        </div>
                        {agentUsage && (
                          <span className="hidden md:inline text-xs text-slate-400">
                            {agentUsage.request_count} req.
                          </span>
                        )}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`hidden sm:inline text-xs font-medium px-2 py-0.5 rounded-full ${!paused ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                            {!paused ? "Actif" : "En pause"}
                          </span>
                          <button
                            onClick={() => toggleAgent(agent.id)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${!paused ? "bg-slate-100 text-slate-500 hover:bg-slate-200" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"}`}
                          >
                            {!paused ? <Pause size={14} /> : <Play size={14} />}
                          </button>
                          <Link href={`/agents/${agent.slug}`} className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                            <Settings size={14} />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="px-6 py-4 border-t border-slate-100">
                <Link
                  href="/marketplace"
                  className="flex items-center justify-center gap-2 w-full py-2.5 border border-dashed border-slate-300 rounded-xl text-sm text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-all"
                >
                  <Plus size={16} /> Découvrir plus d&apos;agents
                </Link>
              </div>
            </div>

            {/* Usage par agent */}
            {analytics && analytics.per_agent.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-slate-900">Utilisation par agent</h2>
                  <span className="text-xs text-slate-400 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">Total requêtes</span>
                </div>
                <div className="space-y-3">
                  {analytics.per_agent.map((a) => {
                    const max = analytics.per_agent[0].request_count;
                    const pct = max > 0 ? (a.request_count / max) * 100 : 0;
                    return (
                      <div key={a.slug}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <span>{a.icon}</span> {a.name}
                          </span>
                          <span className="text-slate-500">{a.request_count} req.</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Subscription card */}
            <div className={`rounded-2xl p-5 text-white ${plan === "enterprise" ? "bg-amber-600" : plan === "pro" ? "bg-indigo-600" : "bg-slate-700"}`}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold opacity-80">Mon abonnement</p>
                <span className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full font-medium">
                  {PLAN_LABEL[plan] ?? plan}
                </span>
              </div>

              {plan !== "starter" ? (
                <>
                  <p className="text-3xl font-extrabold mb-1">{plan === "pro" ? "29€" : "99€"}</p>
                  <p className="opacity-60 text-sm mb-4">
                    par mois
                    {subscription?.current_period_end && ` · renouvellement le ${new Date(subscription.current_period_end).toLocaleDateString("fr-FR")}`}
                  </p>
                  {usage && usage.limit > 0 && (
                    <div className="mb-5">
                      <div className="flex justify-between text-xs opacity-70 mb-1">
                        <span>Requêtes</span>
                        <span>{usage.request_count.toLocaleString()} / {usage.limit.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full transition-all" style={{ width: `${usagePercent}%` }} />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="text-3xl font-extrabold mb-1">Gratuit</p>
                  <p className="opacity-60 text-sm mb-4">3 agents · 1 000 requêtes/mois</p>
                  {usage && (
                    <div className="mb-5">
                      <div className="flex justify-between text-xs opacity-70 mb-1">
                        <span>Requêtes</span>
                        <span>{usage.request_count} / 1 000</span>
                      </div>
                      <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white rounded-full" style={{ width: `${(usage.request_count / 1000) * 100}%` }} />
                      </div>
                    </div>
                  )}
                </>
              )}

              {plan === "starter" ? (
                <Link
                  href="/#pricing"
                  className="w-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  Passer au Pro
                </Link>
              ) : (
                <button className="w-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                  <CreditCard size={15} />
                  Gérer l&apos;abonnement
                </button>
              )}
            </div>

            {/* Activité récente — vraies données */}
            <div className="bg-white rounded-2xl border border-slate-200">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <MessageSquare size={15} className="text-slate-400" />
                <h2 className="font-bold text-slate-900 text-sm">Activité récente</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {fetching ? (
                  <div className="p-5 space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex gap-3 animate-pulse">
                        <div className="w-7 h-7 bg-slate-100 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 bg-slate-100 rounded w-1/2" />
                          <div className="h-2.5 bg-slate-100 rounded w-3/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : analytics && analytics.recent_activity.length > 0 ? (
                  analytics.recent_activity.map((a, i) => (
                    <Link key={i} href={`/agents/${a.agent_slug}`} className="px-5 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors block">
                      <div className="text-base flex-shrink-0 mt-0.5">{a.agent_icon}</div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-900 truncate">{a.agent_name}</p>
                        <p className="text-xs text-slate-500 truncate">{a.prompt_preview}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-slate-400">
                            <Clock size={10} className="inline mr-1" />{timeAgo(a.created_at)}
                          </p>
                          {a.tokens > 0 && (
                            <span className="text-xs text-slate-300">· {a.tokens} tokens</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="px-5 py-8 text-center">
                    <p className="text-xs text-slate-400 mb-2">Aucune activité pour l&apos;instant</p>
                    <Link href="/marketplace" className="text-xs text-indigo-600 hover:underline">
                      Tester un agent →
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Plan info */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Users size={15} className="text-slate-400" />
                <p className="text-sm font-bold text-slate-900">Compte</p>
              </div>
              <div className="space-y-2 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Statut</span>
                  <span className={`font-medium ${user.is_active ? "text-emerald-600" : "text-red-500"}`}>
                    {user.is_active ? "Actif" : "Désactivé"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Rôle</span>
                  <span className="font-medium text-slate-700">
                    {user.is_superuser ? "Administrateur" : "Utilisateur"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Plan</span>
                  <span className="font-medium text-slate-700">{PLAN_LABEL[plan] ?? plan}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
