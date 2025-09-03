import React from 'react';
import { useSession } from '../context/SessionContext';
import { useI18n } from '../lib/i18n';
import { Book } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickReferenceProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickReference({ isOpen, onClose }: QuickReferenceProps) {
  const { session } = useSession();
  const { t } = useI18n();

  if (!isOpen) return null;

  const conditions = [
    { name: t('blinded'), effect: t('conditionsEffects.blinded') },
    { name: t('charmed'), effect: t('conditionsEffects.charmed') },
    { name: t('deafened'), effect: t('conditionsEffects.deafened') },
    { name: t('frightened'), effect: t('conditionsEffects.frightened') },
    { name: t('grappled'), effect: t('conditionsEffects.grappled') },
    { name: t('incapacitated'), effect: t('conditionsEffects.incapacitated') },
    { name: t('invisible'), effect: t('conditionsEffects.invisible') },
    { name: t('paralyzed'), effect: t('conditionsEffects.paralyzed') },
    { name: t('poisoned'), effect: t('conditionsEffects.poisoned') },
    { name: t('prone'), effect: t('conditionsEffects.prone') },
    { name: t('restrained'), effect: t('conditionsEffects.restrained') },
    { name: t('stunned'), effect: t('conditionsEffects.stunned') },
    { name: t('unconscious'), effect: t('conditionsEffects.unconscious') },
  ];

  const combatActions = [
    { name: t('attack'), description: t('attack') },
    { name: t('castSpell'), description: t('castSpell') },
    { name: t('dash'), description: t('dash') },
    { name: t('disengage'), description: t('disengage') },
    { name: t('dodge'), description: t('dodge') },
    { name: t('help'), description: t('help') },
    { name: t('hide'), description: t('hide') },
    { name: t('ready'), description: t('ready') },
    { name: t('search'), description: t('search') },
    { name: t('useObject'), description: t('useObject') },
  ];

  const bonusActions = [
    t('twoWeaponFighting'),
    t('bonusActionSpell'),
    t('classRaceAbilitiesBonus'),
  ];

  const reactions = [
    t('opportunityAttack'),
    t('reactionSpell'),
    t('classRaceAbilitiesReaction'),
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <Book className="w-5 h-5 mr-2" />
            {t('quickReferenceTitle')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Combat Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{t('actions')}</h3>
              <div className="space-y-2">
                {combatActions.map((action) => (
                  <div key={action.name} className="p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                    <div className="font-medium text-gray-900 dark:text-white">{action.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{action.description}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {/* Bonus Actions */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{t('bonusActions')}</h3>
                <div className="space-y-2">
                  {bonusActions.map((action) => (
                    <div key={action} className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-700">
                      <div className="text-sm text-gray-900 dark:text-white">{action}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reactions */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{t('reactions')}</h3>
                <div className="space-y-2">
                  {reactions.map((reaction) => (
                    <div key={reaction} className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-700">
                      <div className="text-sm text-gray-900 dark:text-white">{reaction}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Conditions */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{t('conditions')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {conditions.map((condition) => (
                <div key={condition.name} className="p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                  <div className="font-medium text-gray-900 dark:text-white mb-1">{condition.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{condition.effect}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Characters Summary */}
          {session.characters.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{t('currentCharacters')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {session.characters.map((character) => (
                  <div key={character.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                    <div className="font-medium text-gray-900 dark:text-white">{character.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t('characterStats', { 
                        ac: character.armorClass, 
                        current: character.currentHp, 
                        max: character.maxHp, 
                        init: character.initiative 
                      })}
                    </div>
                    {character.conditions.length > 0 && (
                      <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                        {character.conditions.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}