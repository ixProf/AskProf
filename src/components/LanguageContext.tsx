'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { Locale, translations, TranslationDictionary } from '@/lib/translations';

interface LanguageContextType {
  locale: Locale;
  t: TranslationDictionary;
  toggleLanguage: () => void;
  setLocale: (l: Locale) => void;
  dir: 'ltr';
}

const defaultContext: LanguageContextType = {
  locale: 'en',
  t: translations.en,
  toggleLanguage: () => {},
  setLocale: () => {},
  dir: 'ltr',
};

const LanguageContext = createContext<LanguageContextType>(defaultContext);

export function LanguageProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
  }, []);

  return (
    <LanguageContext.Provider value={defaultContext}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
