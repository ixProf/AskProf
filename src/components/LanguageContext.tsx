'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, translations, TranslationDictionary } from '@/lib/translations';

interface LanguageContextType {
  locale: Locale;
  t: TranslationDictionary;
  toggleLanguage: () => void;
  setLocale: (l: Locale) => void;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ar');

  useEffect(() => {
    // Check saved preference
    const saved = localStorage.getItem('prof_locale') as Locale | null;
    if (saved && (saved === 'ar' || saved === 'en')) {
      setLocaleState(saved);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('prof_locale', locale);
  }, [locale]);

  const toggleLanguage = () => {
    setLocaleState((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const setLocale = (l: Locale) => {
    setLocaleState(l);
  };

  return (
    <LanguageContext.Provider
      value={{
        locale,
        t: translations[locale],
        toggleLanguage,
        setLocale,
        dir: locale === 'ar' ? 'rtl' : 'ltr',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
