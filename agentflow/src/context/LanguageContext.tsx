"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { type Lang, type TranslationKey, getT } from "@/lib/translations";

interface LanguageContextValue {
  lang: Lang;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "fr",
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("fr");

  useEffect(() => {
    const stored = localStorage.getItem("lang") as Lang | null;
    if (stored === "fr" || stored === "en") {
      setLang(stored);
    } else {
      const detected: Lang = navigator.language.toLowerCase().startsWith("en") ? "en" : "fr";
      setLang(detected);
      localStorage.setItem("lang", detected);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, t: getT(lang) }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
