"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { dictionary, type Language } from "@/utils/i18n";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: keyof typeof dictionary.en) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem("royal-language") as Language | null;
    if (stored === "en" || stored === "hi") setLanguageState(stored);
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage: (next: Language) => {
        setLanguageState(next);
        window.localStorage.setItem("royal-language", next);
      },
      t: (key: keyof typeof dictionary.en) => dictionary[language][key]
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}
