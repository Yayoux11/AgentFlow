"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GitBranch, Plus, Trash2, Loader2, AlertCircle, ToggleLeft, ToggleRight, Pencil, X, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api-client";

type IntentRoute = {
  id: string;
  name: string;
  description: string;
  agent_slug: string;
  priority: number;
  is_active: boolean;
  created_at: string;
};

type CustomPrompt = {
  id: string;
  agent_slug: string;
  system_prompt: string;
  updated_at: string;
};

const AVAILABLE_AGENTS = [
  { slug: "email-writer", name: "Email Writer" },
  { slug: "data-analyst", name: "Data Analyst" },
  { slug: "social-manager", name: "Social Manager" },
  { slug: "support-bot", name: "Support Bot" },
  { slug: "hr-recruiter", name: "HR Recruiter" },
  { slug: "finance-tracker", name: "Finance Tracker" },
  { slug: "code-reviewer", name: "Code Reviewer" },
  { slug: "seo-optimizer", name: "SEO Optimizer" },
];

export default function RoutesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<"routes" | "prompts">("routes");

  // Routes state
  const [routes, setRoutes] = useState<IntentRoute[]>([]);
  const [routesLoading, setRoutesLoading] = useState(true);
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [routeForm, setRouteForm] = useState({ name: "", description: "", agent_slug: "support-bot", priority: 0 });
  const [savingRoute, setSavingRoute] = useState(false);
  const [deletingRouteId, setDeletingRouteId] = useState<string | null>(null);

  // Custom prompts state
  const [prompts, setPrompts] = useState<CustomPrompt[]>([]);
  const [promptsLoading, setPromptsLoading] = useState(true);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [savingSlug, setSavingSlug] = useState<string | null>(null);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [newPromptSlug, setNewPromptSlug] = useState("support-bot");

  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchRoutes();
      fetchPrompts();
    }
  }, [user]);

  async function fetchRoutes() {
    setRoutesLoading(true);
    try {
      const data = await api.get<IntentRoute[]>("/intent-routes");
      setRoutes(data);
    } catch {
      setError("Erreur de chargement des routes");
    } finally {
      setRoutesLoading(false);
    }
  }

  async function fetchPrompts() {
    setPromptsLoading(true);
    try {
      const data = await api.get<CustomPrompt[]>("/custom-prompts");
      setPrompts(data);
    } catch {
      setError("Erreur de chargement des prompts");
    } finally {
      setPromptsLoading(false);
    }
  }

  async function handleCreateRoute(e: React.FormEvent) {
    e.preventDefault();
    setSavingRoute(true);
    setError("");
    try {
      const route = await api.post<IntentRoute>("/intent-routes", routeForm);
      setRoutes((prev) => [route, ...prev]);
      setShowRouteForm(false);
      setRouteForm({ name: "", description: "", agent_slug: "support-bot", priority: 0 });
    } catch (err: any) {
      setError(err?.message ?? "Erreur de création");
    } finally {
      setSavingRoute(false);
    }
  }

  async function toggleRoute(route: IntentRoute) {
    try {
      const updated = await api.patch<IntentRoute>(`/intent-routes/${route.id}`, { is_active: !route.is_active });
      setRoutes((prev) => prev.map((r) => (r.id === route.id ? updated : r)));
    } catch {
      setError("Erreur de mise à jour");
    }
  }

  async function deleteRoute(id: string) {
    setDeletingRouteId(id);
    try {
      await api.delete(`/intent-routes/${id}`);
      setRoutes((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("Erreur de suppression");
    } finally {
      setDeletingRouteId(null);
    }
  }

  function startEditPrompt(p: CustomPrompt) {
    setEditingSlug(p.agent_slug);
    setEditText(p.system_prompt);
  }

  async function savePrompt(slug: string) {
    setSavingSlug(slug);
    setError("");
    try {
      const updated = await api.put<CustomPrompt>(`/custom-prompts/${slug}`, { system_prompt: editText });
      setPrompts((prev) => prev.map((p) => (p.agent_slug === slug ? updated : p)));
      setEditingSlug(null);
    } catch (err: any) {
      setError(err?.message ?? "Erreur de sauvegarde");
    } finally {
      setSavingSlug(null);
    }
  }

  async function deletePrompt(slug: string) {
    setDeletingSlug(slug);
    try {
      await api.delete(`/custom-prompts/${slug}`);
      setPrompts((prev) => prev.filter((p) => p.agent_slug !== slug));
    } catch {
      setError("Erreur de suppression");
    } finally {
      setDeletingSlug(null);
    }
  }

  async function addNewPrompt() {
    if (prompts.find((p) => p.agent_slug === newPromptSlug)) {
      setError("Un prompt existe déjà pour cet agent");
      return;
    }
    setSavingSlug(newPromptSlug);
    setError("");
    try {
      const agent = AVAILABLE_AGENTS.find((a) => a.slug === newPromptSlug);
      const defaultPrompt = `Tu es ${agent?.name ?? newPromptSlug}, un assistant IA spécialisé. Réponds toujours de manière professionnelle et précise.`;
      const created = await api.put<CustomPrompt>(`/custom-prompts/${newPromptSlug}`, { system_prompt: defaultPrompt });
      setPrompts((prev) => [...prev, created]);
      setEditingSlug(newPromptSlug);
      setEditText(created.system_prompt);
    } catch (err: any) {
      setError(err?.message ?? "Erreur de création");
    } finally {
      setSavingSlug(null);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl">
            <GitBranch className="text-indigo-600 dark:text-indigo-400" size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Routage IA & Prompts</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Configurez le routage automatique des requêtes et personnalisez les prompts système</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl mb-6 w-fit">
          {(["routes", "prompts"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                tab === t
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {t === "routes" ? "Routage d'intention" : "Prompts personnalisés"}
            </button>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <AlertCircle size={14} />
            {error}
            <button onClick={() => setError("")} className="ml-auto"><X size={14} /></button>
          </div>
        )}

        {/* Routes tab */}
        {tab === "routes" && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Routes d'intention</h2>
                <button
                  onClick={() => setShowRouteForm((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus size={13} />
                  Ajouter
                </button>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
                L'IA analyse chaque requête et redirige automatiquement vers l'agent le plus adapté.
              </p>

              {showRouteForm && (
                <form onSubmit={handleCreateRoute} className="mb-5 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Nom *</label>
                      <input
                        value={routeForm.name}
                        onChange={(e) => setRouteForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="Ex: Support technique"
                        className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Agent cible *</label>
                      <select
                        value={routeForm.agent_slug}
                        onChange={(e) => setRouteForm((f) => ({ ...f, agent_slug: e.target.value }))}
                        className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {AVAILABLE_AGENTS.map((a) => (
                          <option key={a.slug} value={a.slug}>{a.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Description (l'IA se base là-dessus pour router) *</label>
                    <textarea
                      value={routeForm.description}
                      onChange={(e) => setRouteForm((f) => ({ ...f, description: e.target.value }))}
                      placeholder="Ex: Requêtes liées aux bugs, erreurs, problèmes techniques, demandes d'aide sur le produit"
                      rows={2}
                      className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Priorité</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={routeForm.priority}
                      onChange={(e) => setRouteForm((f) => ({ ...f, priority: parseInt(e.target.value) || 0 }))}
                      className="w-20 px-2 py-1 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-xs text-slate-400">(plus élevé = prioritaire)</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={savingRoute}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {savingRoute ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                      Créer
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRouteForm(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              )}

              {routesLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-indigo-400" size={24} /></div>
              ) : routes.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-600 text-center py-8">Aucune route configurée</p>
              ) : (
                <div className="space-y-2">
                  {routes.map((route) => (
                    <div key={route.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${route.is_active ? "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50" : "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20 opacity-60"}`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{route.name}</p>
                          <span className="text-[10px] px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 rounded font-medium">
                            → {route.agent_slug}
                          </span>
                          <span className="text-[10px] text-slate-400">prio {route.priority}</span>
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">{route.description}</p>
                      </div>
                      <button
                        onClick={() => toggleRoute(route)}
                        className={`flex-shrink-0 transition-colors ${route.is_active ? "text-indigo-500" : "text-slate-400"}`}
                        title={route.is_active ? "Désactiver" : "Activer"}
                      >
                        {route.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      </button>
                      <button
                        onClick={() => deleteRoute(route.id)}
                        disabled={deletingRouteId === route.id}
                        className="flex-shrink-0 p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded transition-colors disabled:opacity-40"
                      >
                        {deletingRouteId === route.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Custom prompts tab */}
        {tab === "prompts" && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Prompts système personnalisés</h2>
                <div className="flex items-center gap-2">
                  <select
                    value={newPromptSlug}
                    onChange={(e) => setNewPromptSlug(e.target.value)}
                    className="text-xs px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {AVAILABLE_AGENTS.filter((a) => !prompts.find((p) => p.agent_slug === a.slug)).map((a) => (
                      <option key={a.slug} value={a.slug}>{a.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={addNewPrompt}
                    disabled={!!savingSlug || AVAILABLE_AGENTS.filter((a) => !prompts.find((p) => p.agent_slug === a.slug)).length === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    <Plus size={13} />
                    Ajouter
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
                Remplacez le prompt système par défaut d'un agent par votre propre instruction.
              </p>

              {promptsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-indigo-400" size={24} /></div>
              ) : prompts.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-600 text-center py-8">Aucun prompt personnalisé</p>
              ) : (
                <div className="space-y-3">
                  {prompts.map((p) => (
                    <div key={p.agent_slug} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800/60">
                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{p.agent_slug}</span>
                        <div className="flex items-center gap-1">
                          {editingSlug === p.agent_slug ? (
                            <>
                              <button
                                onClick={() => savePrompt(p.agent_slug)}
                                disabled={savingSlug === p.agent_slug}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded transition-colors disabled:opacity-50"
                              >
                                {savingSlug === p.agent_slug ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                              </button>
                              <button
                                onClick={() => setEditingSlug(null)}
                                className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                              >
                                <X size={13} />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => startEditPrompt(p)}
                              className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-colors"
                            >
                              <Pencil size={13} />
                            </button>
                          )}
                          <button
                            onClick={() => deletePrompt(p.agent_slug)}
                            disabled={deletingSlug === p.agent_slug}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                          >
                            {deletingSlug === p.agent_slug ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                          </button>
                        </div>
                      </div>
                      {editingSlug === p.agent_slug ? (
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={5}
                          className="w-full px-3 py-2 text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-900 focus:outline-none resize-none"
                        />
                      ) : (
                        <p className="px-3 py-2 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap line-clamp-4">
                          {p.system_prompt}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
