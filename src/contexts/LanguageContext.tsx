import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '@/types';

import enTranslations from '../i18n/en.json';
import hiTranslations from '../i18n/hi.json';
import teTranslations from '../i18n/te.json';
import { phraseDictionary, singleWordDictionary } from '../i18n/phraseDictionary';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = 'pf_lang';

const translationsMap: Record<Language, Record<string, any>> = {
  en: enTranslations,
  hi: hiTranslations,
  te: teTranslations,
};

// Converts camelCase or dot.path to a clean Human Title
const formatKeyFallback = (key: string): string => {
  const parts = key.split('.');
  const lastPart = parts[parts.length - 1];
  const words = lastPart
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .trim();
  if (!words) return key;
  return words.charAt(0).toUpperCase() + words.slice(1);
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'en';
    const saved = localStorage.getItem(STORAGE_KEY) as Language;
    if (saved && ['en', 'hi', 'te'].includes(saved)) return saved;
    const browserLang = navigator.language || '';
    if (browserLang.startsWith('hi')) return 'hi';
    if (browserLang.startsWith('te')) return 'te';
    return 'en';
  });

  const [isLoading, setIsLoading] = useState(false);

  // Set new language and persist
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
      window.dispatchEvent(new CustomEvent('languageChange', { detail: { language: lang } }));
    }
  };

  // Translation function with nested key support, phrase matching, and guaranteed fallback
  const t = (key: string, fallback?: string): string => {
    if (!key) return fallback || '';

    // If English, try JSON dictionary first, then fallback, then raw key
    if (language === 'en') {
      const getNested = (dict: Record<string, any>, path: string) => {
        const keys = path.split('.');
        let current: any = dict;
        for (const k of keys) {
          if (current && typeof current === 'object' && k in current) {
            current = current[k];
          } else {
            return undefined;
          }
        }
        return typeof current === 'string' ? current : undefined;
      };
      const found = getNested(translationsMap.en, key);
      if (found) return found;
      return fallback || key;
    }

    const langKey = language as 'hi' | 'te';

    // Helper for nested key lookup
    const getNested = (dict: Record<string, any>, path: string) => {
      const keys = path.split('.');
      let current: any = dict;
      for (const k of keys) {
        if (current && typeof current === 'object' && k in current) {
          current = current[k];
        } else {
          return undefined;
        }
      }
      return typeof current === 'string' ? current : undefined;
    };

    // 1. Try active language JSON file (e.g. te.json or hi.json)
    const currentDict = translationsMap[language] || translationsMap.en;
    const jsonTranslated = getNested(currentDict, key);
    if (jsonTranslated) return jsonTranslated;

    // 2. Direct exact phrase lookup in phraseDictionary
    const cleanKey = key.trim().toLowerCase();
    if (phraseDictionary[cleanKey] && phraseDictionary[cleanKey][langKey]) {
      return phraseDictionary[cleanKey][langKey];
    }

    // 3. Fallback phrase lookup in phraseDictionary
    if (fallback) {
      const cleanFallback = fallback.trim().toLowerCase();
      if (phraseDictionary[cleanFallback] && phraseDictionary[cleanFallback][langKey]) {
        return phraseDictionary[cleanFallback][langKey];
      }
    }

    // 4. Dot-separated path last segment check
    if (cleanKey.includes('.')) {
      const lastSegment = cleanKey.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim().toLowerCase();
      if (lastSegment && phraseDictionary[lastSegment] && phraseDictionary[lastSegment][langKey]) {
        return phraseDictionary[lastSegment][langKey];
      }
    }

    // 5. Single word dictionary lookup
    if (singleWordDictionary[cleanKey] && singleWordDictionary[cleanKey][langKey]) {
      return singleWordDictionary[cleanKey][langKey];
    }

    if (fallback) {
      const cleanFallback = fallback.trim().toLowerCase();
      if (singleWordDictionary[cleanFallback] && singleWordDictionary[cleanFallback][langKey]) {
        return singleWordDictionary[cleanFallback][langKey];
      }
    }

    // 6. Return explicit fallback or formatted key
    return fallback || formatKeyFallback(key);
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    isLoading
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Convenient Inline Translation Component
export const T: React.FC<{ children: string; fallback?: string }> = ({ children, fallback }) => {
  const { t } = useLanguage();
  return <>{t(children, fallback)}</>;
};