import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Toaster from "@/components/Toaster";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://agent-flow-toz3.vercel.app"),
  title: {
    default: "AgenToolFlow — La marketplace d'agents IA",
    template: "%s | AgenToolFlow",
  },
  description:
    "Découvrez, abonnez-vous et déployez des agents IA spécialisés. Automatisez vos emails, recrutement, immobilier, dev et plus encore. Opérationnel en 2 minutes.",
  keywords: [
    "agent IA", "intelligence artificielle", "automatisation IA", "marketplace IA",
    "agent email IA", "agent recrutement IA", "agent immobilier IA", "ChatGPT entreprise",
    "automatisation entreprise", "SaaS IA France", "agent IA français",
  ],
  authors: [{ name: "AgenToolFlow" }],
  creator: "AgenToolFlow",
  publisher: "AgenToolFlow",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    title: "AgenToolFlow — La marketplace d'agents IA",
    description: "Automatisez vos tâches répétitives avec des agents IA spécialisés. Déployez en un clic, opérationnel en 2 minutes.",
    type: "website",
    locale: "fr_FR",
    siteName: "AgenToolFlow",
    url: "https://agent-flow-toz3.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "AgenToolFlow — La marketplace d'agents IA",
    description: "Automatisez vos tâches répétitives avec des agents IA spécialisés.",
  },
  alternates: {
    canonical: "https://agent-flow-toz3.vercel.app",
  },
  verification: {
    google: "kHrtTxcrWNy1eTo541haA34nKx98RZa_iTvLvEaHqDk",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors" suppressHydrationWarning>
        <ThemeProvider>
          <LanguageProvider>
            <ToastProvider>
              <AuthProvider>
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
                <Toaster />
              </AuthProvider>
            </ToastProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
