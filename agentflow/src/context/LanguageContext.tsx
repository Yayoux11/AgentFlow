"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { type Lang, type TranslationKey, getT } from "@/lib/translations";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "fr",
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    // Priority: URL ?lang= > localStorage > browser language
    const url = new URL(window.location.href);
    const urlLang = url.searchParams.get("lang") as Lang | null;
    if (urlLang === "fr" || urlLang === "en") {
      setLangState(urlLang);
      localStorage.setItem("lang", urlLang);
      return;
    }
    const stored = localStorage.getItem("lang") as Lang | null;
    if (stored === "fr" || stored === "en") {
      setLangState(stored);
    } else if (navigator.language.toLowerCase().startsWith("en")) {
      setLangState("en");
    }
  }, []);

  function setLang(l: Lang) {
    localStorage.setItem("lang", l);
    setLangState(l);
    // Update URL param without page reload
    const url = new URL(window.location.href);
    url.searchParams.set("lang", l);
    window.history.replaceState({}, "", url.toString());
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: getT(lang) }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
