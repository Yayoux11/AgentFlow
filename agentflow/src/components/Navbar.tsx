"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X, Zap, LogOut, LayoutDashboard, ChevronDown, Crown, Plug, Moon, Sun, Key, Mail, Bell, Webhook, Users } from "lucide-react";
import { api } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { useTheme } from "@/context/ThemeContext";
import { useLang } from "@/context/LanguageContext";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const { user, loading, logout } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(!!user);
  const { theme, toggle: toggleTheme } = useTheme();
  const { t } = useLang();
  const router = useRouter();

  async function handleResendVerification() {
    setResending(true);
    try {
      await api.post("/auth/resend-verification", {});
      setResent(true);
    } finally {
      setResending(false);
    }
  }

  const navLinks = [
    { href: "/marketplace", label: t("nav.marketplace") },
    { href: "/#features", label: t("nav.features") },
    { href: "/#pricing", label: t("nav.pricing") },
  ];

  function handleLogout() {
    logout();
    setUserMenuOpen(false);
    router.push("/");
  }

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email.slice(0, 2).toUpperCase();

  const showVerificationBanner = !loading && user && !user.email_verified;

  return (
    <>
    {showVerificationBanner && (
      <div className="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-700 px-4 py-2.5 flex items-center justify-center gap-3 text-sm text-amber-800 dark:text-amber-300">
        <Mail size={15} className="flex-shrink-0" />
        <span>{t("nav.verify_banner")}</span>
        {resent ? (
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">{t("nav.verify_sent")}</span>
        ) : (
          <button
            onClick={handleResendVerification}
            disabled={resending}
            className="font-semibold underline hover:no-underline disabled:opacity-50"
          >
            {resending ? t("nav.verify_sending") : t("nav.verify_resend")}
          </button>
        )}
      </div>
    )}
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900 dark:text-white">
            <span className="bg-indigo-600 text-white rounded-lg p-1.5">
              <Zap size={18} strokeWidth={2.5} />
            </span>
            AgentFlow
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-2">
            {/* Notifications bell */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => { setNotifOpen((v) => !v); setUserMenuOpen(false); }}
                  className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-20 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</p>
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="text-xs text-indigo-600 hover:underline">Tout marquer lu</button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
                            Aucune notification
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <button
                              key={n.id}
                              onClick={() => markRead(n.id)}
                              className={`w-full text-left px-4 py-3 border-b border-slate-50 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${!n.read ? "bg-indigo-50/50 dark:bg-indigo-900/10" : ""}`}
                            >
                              <div className="flex items-start gap-2.5">
                                {!n.read && <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0 mt-1.5" />}
                                <div className={!n.read ? "" : "pl-4"}>
                                  <p className="text-xs font-semibold text-slate-900 dark:text-white leading-snug">{n.title}</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{n.body}</p>
                                  <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-1">
                                    {new Date(n.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {loading ? (
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ) : user ? (
              <div className="relative ml-1">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                    {initials}
                  </div>
                  <span className="text-sm text-slate-700 dark:text-slate-300 max-w-[120px] truncate">
                    {user.full_name ?? user.email.split("@")[0]}
                  </span>
                  {user.is_superuser && <Crown size={13} className="text-amber-500" />}
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-20 overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                        {user.is_superuser && <p className="text-xs text-amber-600 font-semibold mt-0.5">{t("nav.superadmin")}</p>}
                      </div>
                      <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <LayoutDashboard size={15} />
                        {t("nav.dashboard")}
                      </Link>
                      <Link href="/settings/integrations" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <Plug size={15} />
                        {t("nav.integrations")}
                      </Link>
                      <Link href="/settings/api-keys" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <Key size={15} />
                        {t("nav.apikeys")}
                      </Link>
                      <Link href="/settings/webhook" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <Webhook size={15} />
                        {t("nav.webhook")}
                      </Link>
                      <Link href="/team" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <Users size={15} />
                        {t("nav.team")}
                      </Link>
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <LogOut size={15} />
                        {t("nav.logout")}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                  {t("nav.login")}
                </Link>
                <Link href="/register" className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                  {t("nav.register")}
                </Link>
              </>
            )}
          </div>

          {/* Mobile: theme toggle + menu button */}
          <div className="md:hidden flex items-center gap-1">
            <button onClick={toggleTheme} className="p-2 text-slate-500 dark:text-slate-400">
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-sm" onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          <div className="pt-2 flex flex-col gap-2 border-t border-slate-100 dark:border-slate-800">
            {user ? (
              <>
                <Link href="/dashboard" className="text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white" onClick={() => setMenuOpen(false)}>{t("nav.dashboard")}</Link>
                <Link href="/settings/integrations" className="text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white" onClick={() => setMenuOpen(false)}>{t("nav.integrations")}</Link>
                <Link href="/settings/api-keys" className="text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white" onClick={() => setMenuOpen(false)}>{t("nav.apikeys")}</Link>
                <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="text-sm text-red-600 text-left">{t("nav.logout")}</button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-slate-600 dark:text-slate-300" onClick={() => setMenuOpen(false)}>{t("nav.login")}</Link>
                <Link href="/register" className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg text-center font-medium" onClick={() => setMenuOpen(false)}>{t("nav.register")}</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
    </>
  );
}
