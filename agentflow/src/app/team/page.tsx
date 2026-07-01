"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, UserPlus, Trash2, Mail, Crown, Loader2, Plus, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api-client";

interface Member {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  joined_at: string;
}

interface Invitation {
  id: string;
  email: string;
  status: string;
  created_at: string;
}

interface Team {
  id: string;
  name: string;
  created_at: string;
  members: Member[];
  invitations: Invitation[];
}

export default function TeamPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [creating, setCreating] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteOk, setInviteOk] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    fetchTeam();
  }, [user]);

  async function fetchTeam() {
    setLoading(true);
    try {
      const data = await api.get<Team>("/team/me");
      setTeam(data);
      setIsOwner(true);
    } catch {
      setTeam(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!teamName.trim()) return;
    setCreating(true);
    setError("");
    try {
      const data = await api.post<Team>("/team", { name: teamName.trim() });
      setTeam(data);
      setIsOwner(true);
      setTeamName("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur lors de la création");
    } finally {
      setCreating(false);
    }
  }

  async function handleInvite() {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setInviteError("");
    setInviteOk("");
    try {
      const data = await api.post<{ message: string }>("/team/invite", { email: inviteEmail.trim() });
      setInviteOk(data.message);
      setInviteEmail("");
      await fetchTeam();
    } catch (e: unknown) {
      setInviteError(e instanceof Error ? e.message : "Erreur lors de l'invitation");
    } finally {
      setInviting(false);
    }
  }

  async function handleRemove(userId: string) {
    setRemovingId(userId);
    try {
      await api.delete(`/team/members/${userId}`);
      await fetchTeam();
    } finally {
      setRemovingId(null);
    }
  }

  async function handleDeleteTeam() {
    if (!confirm("Supprimer l'équipe ? Tous les membres perdront leur accès Enterprise.")) return;
    try {
      await api.delete("/team");
      setTeam(null);
    } catch {
      setError("Impossible de supprimer l'équipe");
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Équipe Enterprise</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Gérez les membres de votre équipe et leurs accès</p>
          </div>
        </div>

        {!team ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-2">Créer votre équipe</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Donnez un nom à votre équipe pour commencer à inviter des membres. Disponible sur le plan Enterprise.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="Nom de l'équipe"
                className="flex-1 px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleCreate}
                disabled={creating || !teamName.trim()}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Créer
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Team header */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Crown size={16} className="text-amber-500" />
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">{team.name}</h2>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {team.members.length} membre{team.members.length !== 1 ? "s" : ""} · Créée le {new Date(team.created_at).toLocaleDateString()}
                  </p>
                </div>
                {isOwner && (
                  <button
                    onClick={handleDeleteTeam}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 size={13} />
                    Supprimer l&apos;équipe
                  </button>
                )}
              </div>
            </div>

            {/* Invite */}
            {isOwner && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <UserPlus size={15} />
                  Inviter un membre
                </h2>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                    placeholder="email@exemple.com"
                    className="flex-1 px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleInvite}
                    disabled={inviting || !inviteEmail.trim()}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    {inviting ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                    Inviter
                  </button>
                </div>
                {inviteOk && <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">{inviteOk}</p>}
                {inviteError && <p className="mt-2 text-xs text-red-500">{inviteError}</p>}
              </div>
            )}

            {/* Members list */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Membres</h2>
              </div>
              {/* Owner row */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-xs font-bold text-amber-700 dark:text-amber-400">
                    {(user?.full_name ?? user?.email ?? "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.full_name ?? user?.email}</p>
                    {user?.full_name && <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>}
                  </div>
                </div>
                <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">Propriétaire</span>
              </div>
              {team.members.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
                  Aucun membre pour l&apos;instant — invitez des collaborateurs !
                </div>
              ) : (
                team.members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between px-6 py-4 border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-400">
                        {(m.full_name ?? m.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{m.full_name ?? m.email}</p>
                        {m.full_name && <p className="text-xs text-slate-500 dark:text-slate-400">{m.email}</p>}
                      </div>
                    </div>
                    {isOwner && (
                      <button
                        onClick={() => handleRemove(m.user_id)}
                        disabled={removingId === m.user_id}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {removingId === m.user_id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Pending invitations */}
            {isOwner && team.invitations.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Invitations en attente</h2>
                </div>
                {team.invitations.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between px-6 py-3 border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-slate-400" />
                      <p className="text-sm text-slate-700 dark:text-slate-300">{inv.email}</p>
                    </div>
                    <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">En attente</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
