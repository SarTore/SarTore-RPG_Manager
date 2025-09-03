import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from './translations';
import { translationsJa } from './translations-ja';
import { translationsZhCn } from './translations-zh-cn';
import { translationsFr } from './translations-fr';
import { translationsPtBr } from './translations-pt-br';
import useLocalStorage from '../hooks/useLocalStorage';

// Combine all translations
const allTranslations = {
  ...translations,
  ...translationsJa,
  ...translationsZhCn,
  ...translationsFr,
  ...translationsPtBr
};

type Language = 'en' | 'pt-BR' | 'ja' | 'zh-CN' | 'fr';
type TranslationKey = keyof typeof translations.en;

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey | string, params?: Record<string, string | number>) => string;
  availableLanguages: { code: Language; name: string; flag: string }[];
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const availableLanguages = [
  { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
  { code: 'pt-BR' as Language, name: 'Português (BR)', flag: '🇧🇷' },
  { code: 'ja' as Language, name: '日本語', flag: '🇯🇵' },
  { code: 'zh-CN' as Language, name: '简体中文', flag: '🇨🇳' },
  { code: 'fr' as Language, name: 'Français', flag: '🇫🇷' }
];

function getSystemLanguage(): Language {
  const browserLang = navigator.language.toLowerCase();
  
  if (browserLang.startsWith('pt-br') || browserLang.startsWith('pt_br')) {
    return 'pt-BR';
  }
  if (browserLang.startsWith('ja')) {
    return 'ja';
  }
  if (browserLang.startsWith('zh-cn') || browserLang.startsWith('zh_cn') || browserLang.startsWith('zh-hans')) {
    return 'zh-CN';
  }
  if (browserLang.startsWith('fr')) {
    return 'fr';
  }
  
  return 'en'; // Default to English
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useLocalStorage<Language>(
    'dnd-language',
    getSystemLanguage()
  );

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: TranslationKey | string, params?: Record<string, string | number>): string => {
    const translations = allTranslations[language] || allTranslations.en;
    
    // Handle nested keys (e.g., 'conditionsEffects.blinded')
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    
    // Fallback to English if translation not found
    if (value === undefined) {
      let englishValue: any = allTranslations.en;
      for (const k of keys) {
        englishValue = englishValue?.[k];
        if (englishValue === undefined) break;
      }
      value = englishValue || key;
    }
    
    if (typeof value !== 'string') {
      return key; // Return key if value is not a string
    }
    
    // Handle parameter interpolation
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }
    
    return value;
  };

  const contextValue: I18nContextType = {
    language,
    setLanguage,
    t,
    availableLanguages
  };

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}