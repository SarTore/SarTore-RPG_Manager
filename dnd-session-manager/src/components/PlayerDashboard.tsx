import React from 'react';
import { useSession } from '../context/SessionContext';
import { useI18n } from '../lib/i18n';
import { Users, Heart, Shield, Zap, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PlayerDashboard() {
  const { session } = useSession();
  const { t } = useI18n();
  
  const players = session.characters.filter(c => c.isPlayer);
  const npcs = session.characters.filter(c => !c.isPlayer);
  
  const getHealthStatus = (character: any) => {
    const percentage = (character.currentHp / character.maxHp) * 100;
    if (percentage === 0) return { label: t('unconscious'), color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900' };
    if (percentage <= 25) return { label: t('critical'), color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900' };
    if (percentage <= 50) return { label: t('injured'), color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900' };
    return { label: t('healthy'), color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900' };
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <Users className="w-5 h-5 mr-2" />
          {t('playerDashboard')}
        </h2>
        <div className="flex items-center space-x-4 text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            {t('playersCount', { players: players.length, npcs: npcs.length })}
          </span>
          {session.combat.isActive && (
            <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded-full">
              {t('combatActive')}
            </span>
          )}
        </div>
      </div>

      {session.characters.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {t('noCharactersInSession')}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Players Section */}
          {players.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                {t('playerCharacters')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {players.map((character) => {
                  const healthStatus = getHealthStatus(character);
                  return (
                    <div key={character.id} className={cn(
                      'p-4 rounded-lg border-2',
                      session.combat.isActive && session.characters[session.combat.currentTurn]?.id === character.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700'
                    )}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-gray-900 dark:text-white">{character.name}</h4>
                        {session.combat.isActive && session.characters[session.combat.currentTurn]?.id === character.id && (
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                            {t('currentTurn')}
                          </span>
                        )}
                      </div>
                      
                      {character.playerName && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {t('player')}: {character.playerName}
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="text-center">
                          <div className="text-xs text-gray-500 dark:text-gray-400">{t('ac')}</div>
                          <div className="font-bold text-gray-900 dark:text-white flex items-center justify-center">
                            <Shield className="w-3 h-3 mr-1" />
                            {character.armorClass}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500 dark:text-gray-400">{t('hp')}</div>
                          <div className="font-bold text-gray-900 dark:text-white flex items-center justify-center">
                            <Heart className="w-3 h-3 mr-1" />
                            {character.currentHp}/{character.maxHp}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500 dark:text-gray-400">{t('init')}</div>
                          <div className="font-bold text-gray-900 dark:text-white">
                            {character.initiative}
                          </div>
                        </div>
                      </div>

                      <div className={cn('text-xs px-2 py-1 rounded-full text-center', healthStatus.bg, healthStatus.color)}>
                        {healthStatus.label}
                      </div>

                      {character.conditions.length > 0 && (
                        <div className="mt-2">
                          <div className="flex items-center mb-1">
                            <AlertTriangle className="w-3 h-3 mr-1 text-yellow-600 dark:text-yellow-400" />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('conditions')}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {character.conditions.map((condition) => (
                              <span
                                key={condition}
                                className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs px-1 py-0.5 rounded"
                              >
                                {t(condition.toLowerCase())}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Spell Slots for Players */}
                      {character.spellSlots && Object.values(character.spellSlots).some(slot => slot.max > 0) && (
                        <div className="mt-2">
                          <div className="flex items-center mb-1">
                            <Zap className="w-3 h-3 mr-1 text-blue-600 dark:text-blue-400" />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('spellSlots')}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            {Object.entries(character.spellSlots)
                              .filter(([_, slot]) => slot.max > 0)
                              .slice(0, 6)
                              .map(([level, slot]) => {
                                const levelNum = level.replace('level', '');
                                return (
                                  <div key={level} className="text-center">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {t('spellLevel', { level: levelNum })}
                                    </div>
                                    <div className="text-xs font-medium text-gray-900 dark:text-white">
                                      {slot.current}/{slot.max}
                                    </div>
                                  </div>
                                );
                              })
                            }
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* NPCs Section */}
          {npcs.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">{t('npcsAndMonsters')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                {npcs.map((character) => {
                  const healthStatus = getHealthStatus(character);
                  return (
                    <div key={character.id} className={cn(
                      'p-3 rounded border',
                      session.combat.isActive && session.characters[session.combat.currentTurn]?.id === character.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700'
                    )}>
                      <div className="text-sm font-bold text-gray-900 dark:text-white truncate mb-1">
                        {character.name}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        {t('ac')} {character.armorClass} • {t('init')} {character.initiative}
                      </div>
                      <div className="text-xs text-gray-900 dark:text-white mb-1">
                        {t('hp')}: {character.currentHp}/{character.maxHp}
                      </div>
                      <div className={cn('text-xs px-1 py-0.5 rounded text-center', healthStatus.bg, healthStatus.color)}>
                        {healthStatus.label}
                      </div>
                      {character.conditions.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {character.conditions.slice(0, 2).map((condition) => (
                            <span
                              key={condition}
                              className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs px-1 rounded"
                            >
                              {t(condition.toLowerCase()).slice(0, 3)}
                            </span>
                          ))}
                          {character.conditions.length > 2 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">+{character.conditions.length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}