'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, LanguageCode } from './translations';

interface I18nContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: typeof translations.en;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY = 'preferred-language';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  useEffect(() => {
    // Load saved language from localStorage
    const saved = localStorage.getItem(STORAGE_KEY) as LanguageCode;
    if (saved && translations[saved]) {
      setLanguageState(saved);
    }
    // 如果没有保存的语言偏好，保持默认的英文，不再检测浏览器语言
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  };

  const value = {
    language,
    setLanguage,
    t: translations[language],
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

export const languages = [
  { code: 'en' as LanguageCode, name: 'English', flag: '🇺🇸' },
  { code: 'zh' as LanguageCode, name: '中文', flag: '🇨🇳' },
  { code: 'es' as LanguageCode, name: 'Español', flag: '🇪🇸' },
];
