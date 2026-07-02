"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Upload, Trash2, Loader2, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api-client";

type KnowledgeBase = {
  id: string;
  name: string;
  file_name: string;
  agent_slug: string | null;
  chunk_count: number;
  status: "processing" | "ready" | "error";
  created_at: string;
};

export default function KnowledgePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [kbs, setKbs] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [agentSlug, setAgentSlug] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) fetchKbs();
  }, [user]);

  async function fetchKbs() {
    setLoading(true);
    try {
      const data = await api.get<KnowledgeBase[]>("/knowledge");
      setKbs(data);
    } catch {
      setError("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !name.trim()) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      if (agentSlug.trim()) formData.append("agent_slug", agentSlug.trim());
      formData.append("file", file);

      const kb = await api.postForm<KnowledgeBase>("/knowledge", formData);
      setKbs((prev) => [kb, ...prev]);
      setName("");
      setAgentSlug("");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await api.delete(`/knowledge/${id}`);
      setKbs((prev) => prev.filter((kb) => kb.id !== id));
    } catch {
      setError("Erreur de suppression");
    } finally {
      setDeletingId(null);
    }
  }

  if (authLoading || loading) {
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
            <BookOpen className="text-indigo-600 dark:text-indigo-400" size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Base de connaissances</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Vos documents sont indexés et utilisés automatiquement par les agents (RAG)</p>
          </div>
        </div>

        {/* Upload form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Ajouter un document</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Nom *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: FAQ support client"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Agent (optionnel)</label>
                <input
                  value={agentSlug}
                  onChange={(e) => setAgentSlug(e.target.value)}
                  placeholder="Ex: support-bot (vide = global)"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Fichier * (PDF, TXT, MD — max 10 Mo)</label>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.txt,.md,text/plain,text/markdown,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-slate-600 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-900/30 dark:file:text-indigo-400 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/50"
                required
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle size={14} />
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={uploading || !file || !name.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              {uploading ? "Traitement en cours…" : "Indexer le document"}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="space-y-3">
          {kbs.length === 0 ? (
            <div className="text-center py-16 text-slate-400 dark:text-slate-600">
              <FileText size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">Aucun document indexé</p>
            </div>
          ) : (
            kbs.map((kb) => (
              <div key={kb.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-4">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg flex-shrink-0">
                  <FileText size={18} className="text-slate-500 dark:text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{kb.name}</p>
                    {kb.agent_slug && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 rounded font-medium">
                        {kb.agent_slug}
                      </span>
                    )}
                    {kb.status === "ready" ? (
                      <span className="text-[10px] flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 size={10} /> Prêt
                      </span>
                    ) : kb.status === "processing" ? (
                      <span className="text-[10px] flex items-center gap-1 text-amber-500">
                        <Loader2 size={10} className="animate-spin" /> Traitement…
                      </span>
                    ) : (
                      <span className="text-[10px] flex items-center gap-1 text-red-500">
                        <AlertCircle size={10} /> Erreur
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {kb.file_name} · {kb.chunk_count} chunks · {new Date(kb.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(kb.id)}
                  disabled={deletingId === kb.id}
                  className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-40"
                >
                  {deletingId === kb.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
