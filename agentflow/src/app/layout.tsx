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
  title: "AgentFlow — La marketplace d'agents IA",
  description:
    "Découvrez, abonnez-vous et déployez des agents IA pour tous vos besoins. Automatisez intelligemment avec AgentFlow.",
  openGraph: {
    title: "AgentFlow — La marketplace d'agents IA",
    description: "Automatisez vos tâches répétitives avec des agents IA spécialisés. Déployez en un clic.",
    type: "website",
    locale: "fr_FR",
    siteName: "AgentFlow",
  },
  twitter: {
    card: "summary_large_image",
    title: "AgentFlow — La marketplace d'agents IA",
    description: "Automatisez vos tâches répétitives avec des agents IA spécialisés.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
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
