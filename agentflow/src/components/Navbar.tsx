"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X, Zap, LogOut, Settings, Moon, Sun, Bell, Crown, Mail } from "lucide-react";
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
  const pathname = usePathname();

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email.slice(0, 2).toUpperCase();

  function handleLogout() {
    logout();
    setUserMenuOpen(false);
    router.push("/");
  }

  async function handleResendVerification() {
    setResending(true);
    try { await api.post("/auth/resend-verification", {}); setResent(true); }
    finally { setResending(false); }
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const mainLinks = user
    ? [
        { href: "/dashboard", label: t("nav.dashboard") },
        { href: "/marketplace", label: t("nav.marketplace") },
      ]
    : [
        { href: "/marketplace", label: t("nav.marketplace") },
        { href: "/#features", label: t("nav.features") },
        { href: "/#pricing", label: t("nav.pricing") },
      ];

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
            <button onClick={handleResendVerification} disabled={resending} className="font-semibold underline hover:no-underline disabled:opacity-50">
              {resending ? t("nav.verify_sending") : t("nav.verify_resend")}
            </button>
          )}
        </div>
      )}

      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-15 py-3">

            {/* Left: Logo + main nav */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-white flex-shrink-0">
                <span className="bg-indigo-600 text-white rounded-lg p-1.5">
                  <Zap size={16} strokeWidth={2.5} />
                </span>
                AgenToolFlow
              </Link>

              <nav className="hidden md:flex items-center gap-1">
                {mainLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive(link.href)
                        ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right: actions */}
            <div className="hidden md:flex items-center gap-1">
              {/* Theme */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
              </button>

              {user && (
                <>
                  {/* Notifications */}
                  <div className="relative">
                    <button
                      onClick={() => { setNotifOpen((v) => !v); setUserMenuOpen(false); }}
                      className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Bell size={17} />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </button>

                    {notifOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
                        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
                          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</p>
                            {unreadCount > 0 && (
                              <button onClick={markAllRead} className="text-xs text-indigo-600 hover:underline">Tout lire</button>
                            )}
                          </div>
                          <div className="max-h-72 overflow-y-auto">
                            {notifications.length === 0 ? (
                              <p className="px-4 py-8 text-center text-sm text-slate-400 dark:text-slate-500">Aucune notification</p>
                            ) : (
                              notifications.map((n) => (
                                <button key={n.id} onClick={() => markRead(n.id)}
                                  className={`w-full text-left px-4 py-3 border-b border-slate-50 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${!n.read ? "bg-indigo-50/50 dark:bg-indigo-900/10" : ""}`}
                                >
                                  <div className="flex items-start gap-2.5">
                                    {!n.read && <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0 mt-1.5" />}
                                    <div className={!n.read ? "" : "pl-4"}>
                                      <p className="text-xs font-semibold text-slate-900 dark:text-white">{n.title}</p>
                                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{n.body}</p>
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

                  {/* Settings */}
                  <Link
                    href="/settings"
                    className={`p-2 rounded-lg transition-colors ${
                      isActive("/settings")
                        ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                    aria-label="Paramètres"
                  >
                    <Settings size={17} />
                  </Link>

                  {/* User avatar */}
                  <div className="relative ml-1">
                    <button
                      onClick={() => setUserMenuOpen((v) => !v)}
                      className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all"
                    >
                      <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                        {initials}
                      </div>
                      <span className="text-sm text-slate-700 dark:text-slate-300 max-w-[100px] truncate">
                        {user.full_name ?? user.email.split("@")[0]}
                      </span>
                      {user.is_superuser && <Crown size={12} className="text-amber-500" />}
                    </button>

                    {userMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
                          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                              {user.full_name ?? user.email.split("@")[0]}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{user.email}</p>
                            {user.is_superuser && (
                              <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">
                                <Crown size={9} /> {t("nav.superadmin")}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <LogOut size={14} />
                            {t("nav.logout")}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}

              {!loading && !user && (
                <div className="flex items-center gap-2 ml-1">
                  <Link href="/login" className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    {t("nav.login")}
                  </Link>
                  <Link href="/register" className="text-sm bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                    {t("nav.register")}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile */}
            <div className="md:hidden flex items-center gap-1">
              <button onClick={toggleTheme} className="p-2 text-slate-500 dark:text-slate-400">
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button className="p-2 text-slate-600 dark:text-slate-300" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 flex flex-col gap-1">
            {mainLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className="px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <>
                <Link href="/settings" className="px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => setMenuOpen(false)}>
                  Paramètres
                </Link>
                <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="px-3 py-2 rounded-lg text-sm text-red-600 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  {t("nav.logout")}
                </button>
              </>
            )}
            {!loading && !user && (
              <div className="pt-2 flex flex-col gap-2">
                <Link href="/login" className="px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300" onClick={() => setMenuOpen(false)}>{t("nav.login")}</Link>
                <Link href="/register" className="px-3 py-2 rounded-lg text-sm bg-indigo-600 text-white text-center font-medium" onClick={() => setMenuOpen(false)}>{t("nav.register")}</Link>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
}
