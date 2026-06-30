"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X, Zap, LogOut, LayoutDashboard, ChevronDown, Crown, Plug } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/#features", label: "Fonctionnalités" },
  { href: "/#pricing", label: "Tarifs" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    setUserMenuOpen(false);
    router.push("/");
  }

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email.slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900">
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
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-slate-200 hover:border-slate-300 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                    {initials}
                  </div>
                  <span className="text-sm text-slate-700 max-w-[120px] truncate">
                    {user.full_name ?? user.email.split("@")[0]}
                  </span>
                  {user.is_superuser && (
                    <Crown size={13} className="text-amber-500" />
                  )}
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        {user.is_superuser && (
                          <p className="text-xs text-amber-600 font-semibold mt-0.5">Superadmin</p>
                        )}
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <LayoutDashboard size={15} />
                        Dashboard
                      </Link>
                      <Link
                        href="/settings/integrations"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Plug size={15} />
                        Intégrations
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={15} />
                        Déconnexion
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Commencer gratuitement
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-slate-600 hover:text-slate-900"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-slate-600 hover:text-slate-900 text-sm"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 flex flex-col gap-2 border-t border-slate-100">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm text-slate-700 hover:text-slate-900"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="text-sm text-red-600 text-left"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-slate-600"
                  onClick={() => setMenuOpen(false)}
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg text-center font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  Commencer gratuitement
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
