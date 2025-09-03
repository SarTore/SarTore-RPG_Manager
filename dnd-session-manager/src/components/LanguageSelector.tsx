import React from 'react';
import { useI18n } from '../lib/i18n';
import { Button } from './ui/Button';
import { Languages, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LanguageSelector({ isOpen, onClose }: LanguageSelectorProps) {
  const { language, setLanguage, availableLanguages, t } = useI18n();

  const handleLanguageChange = (langCode: typeof language) => {
    setLanguage(langCode);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
            <Languages className="w-5 h-5 mr-2" />
            {t('selectLanguage')}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
        
        <div className="p-4 space-y-2">
          {availableLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={cn(
                'w-full flex items-center justify-between p-3 rounded-lg border transition-colors',
                language === lang.code
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
              )}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{lang.flag}</span>
                <div className="text-left">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {lang.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {lang.code}
                  </div>
                </div>
              </div>
              {language === lang.code && (
                <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              )}
            </button>
          ))}
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('languageSavedAutomatically')}
          </p>
        </div>
      </div>
    </div>
  );
}