import React from 'react';
import { useSession } from '../context/SessionContext';
import { useI18n } from '../lib/i18n';
import { ScrollText } from 'lucide-react';

export function SessionNotes() {
  const { session, updateNotes } = useSession();
  const { t } = useI18n();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center mb-4">
        <img src="/images/fantasy_parchment_scroll_icon_blank.jpg" alt="Notes" className="w-5 h-5 mr-2" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {t('sessionNotes')}
        </h2>
      </div>
      
      <textarea
        value={session.notes}
        onChange={(e) => updateNotes(e.target.value)}
        placeholder={t('notesPlaceholder')}
        rows={12}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      />
      
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        {t('lastUpdated', { date: new Date(session.lastUpdated).toLocaleString() })}
      </div>
    </div>
  );
}