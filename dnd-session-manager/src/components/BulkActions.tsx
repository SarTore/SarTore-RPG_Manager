import React, { useState } from 'react';
import { useSession } from '../context/SessionContext';
import { useI18n } from '../lib/i18n';
import { Button } from './ui/Button';
import { Users, Zap, Heart, Plus, Minus } from 'lucide-react';
import { BulkAction } from '../lib/types';
import { cn } from '@/lib/utils';

export function BulkActions() {
  const { session, updateCharacter } = useSession();
  const { t } = useI18n();
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [actionType, setActionType] = useState<BulkAction['type']>('damage');
  const [actionValue, setActionValue] = useState('');
  const [conditionToAdd, setConditionToAdd] = useState('');

  const handleCharacterToggle = (characterId: string) => {
    setSelectedCharacters(prev => 
      prev.includes(characterId)
        ? prev.filter(id => id !== characterId)
        : [...prev, characterId]
    );
  };

  const selectAll = () => {
    setSelectedCharacters(session.characters.map(c => c.id));
  };

  const selectNone = () => {
    setSelectedCharacters([]);
  };

  const selectPlayers = () => {
    setSelectedCharacters(session.characters.filter(c => c.isPlayer).map(c => c.id));
  };

  const selectNPCs = () => {
    setSelectedCharacters(session.characters.filter(c => !c.isPlayer).map(c => c.id));
  };

  const executeBulkAction = () => {
    if (selectedCharacters.length === 0) return;

    const value = parseInt(actionValue, 10);
    if ((actionType === 'damage' || actionType === 'heal') && (isNaN(value) || value <= 0)) {
      return;
    }

    selectedCharacters.forEach(characterId => {
      const character = session.characters.find(c => c.id === characterId);
      if (!character) return;

      switch (actionType) {
        case 'damage':
          updateCharacter(characterId, {
            currentHp: Math.max(0, character.currentHp - value)
          });
          break;
        case 'heal':
          updateCharacter(characterId, {
            currentHp: Math.min(character.maxHp, character.currentHp + value)
          });
          break;
        case 'condition':
          if (conditionToAdd && !character.conditions.includes(conditionToAdd)) {
            updateCharacter(characterId, {
              conditions: [...character.conditions, conditionToAdd]
            });
          }
          break;
        case 'remove_condition':
          if (conditionToAdd) {
            updateCharacter(characterId, {
              conditions: character.conditions.filter(c => c !== conditionToAdd)
            });
          }
          break;
      }
    });

    // Reset form
    setActionValue('');
    setConditionToAdd('');
    setSelectedCharacters([]);
  };

  const commonConditions = [t('poisoned'), t('stunned'), t('prone'), t('blinded'), t('charmed'), t('frightened'), t('restrained'), t('unconscious'), t('paralyzed'), t('grappled')];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <Users className="w-5 h-5 mr-2" />
          {t('bulkActions')}
        </h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {t('selected', { count: selectedCharacters.length })}
        </div>
      </div>

      {session.characters.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {t('noCharactersAvailable')}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Selection Controls */}
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <Button variant="outline" size="sm" onClick={selectAll}>
                {t('all')}
              </Button>
              <Button variant="outline" size="sm" onClick={selectNone}>
                {t('none')}
              </Button>
              <Button variant="outline" size="sm" onClick={selectPlayers}>
                {t('players')}
              </Button>
              <Button variant="outline" size="sm" onClick={selectNPCs}>
                {t('npcs')}
              </Button>
            </div>

            {/* Character Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
              {session.characters.map(character => (
                <label
                  key={character.id}
                  className={cn(
                    'flex items-center space-x-2 p-2 rounded border cursor-pointer transition-colors',
                    selectedCharacters.includes(character.id)
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedCharacters.includes(character.id)}
                    onChange={() => handleCharacterToggle(character.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {character.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {character.currentHp}/{character.maxHp} {t('hp')}
                    </div>
                  </div>
                  {character.isPlayer && (
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-1 py-0.5 rounded">
                      {t('player')}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Action Configuration */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Action Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('actionType')}
                </label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value as BulkAction['type'])}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="damage">{t('applyDamage')}</option>
                  <option value="heal">{t('applyHealing')}</option>
                  <option value="condition">{t('addCondition')}</option>
                  <option value="remove_condition">{t('removeCondition')}</option>
                </select>
              </div>

              {/* Value Input */}
              <div>
                {actionType === 'damage' || actionType === 'heal' ? (
                  <>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {actionType === 'damage' ? t('damageAmount') : t('healingAmount')}
                    </label>
                    <input
                      type="number"
                      value={actionValue}
                      onChange={(e) => setActionValue(e.target.value)}
                      min="1"
                      placeholder={t('enterAmount')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </>
                ) : (
                  <>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('condition')}
                    </label>
                    <select
                      value={conditionToAdd}
                      onChange={(e) => setConditionToAdd(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">{t('selectCondition')}</option>
                      {commonConditions.map(condition => (
                        <option key={condition} value={condition}>{condition}</option>
                      ))}
                    </select>
                  </>
                )}
              </div>

              {/* Execute Button */}
              <div className="flex items-end">
                <Button
                  onClick={executeBulkAction}
                  disabled={
                    selectedCharacters.length === 0 ||
                    ((actionType === 'damage' || actionType === 'heal') && (!actionValue || parseInt(actionValue, 10) <= 0)) ||
                    ((actionType === 'condition' || actionType === 'remove_condition') && !conditionToAdd)
                  }
                  className={cn(
                    'w-full flex items-center justify-center space-x-2',
                    actionType === 'damage' && 'bg-red-600 hover:bg-red-700',
                    actionType === 'heal' && 'bg-green-600 hover:bg-green-700'
                  )}
                >
                  {actionType === 'damage' && <Minus className="w-4 h-4" />}
                  {actionType === 'heal' && <Plus className="w-4 h-4" />}
                  {actionType === 'condition' && <Zap className="w-4 h-4" />}
                  {actionType === 'remove_condition' && <Minus className="w-4 h-4" />}
                  <span>
                    {actionType === 'damage' && t('applyDamage')}
                    {actionType === 'heal' && t('applyHealing')}
                    {actionType === 'condition' && t('addCondition')}
                    {actionType === 'remove_condition' && t('removeCondition')}
                  </span>
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('quickActions')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActionType('heal');
                  setActionValue('10');
                }}
                disabled={selectedCharacters.length === 0}
                className="text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                <Heart className="w-4 h-4 mr-1" />
                {t('heal10')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActionType('condition');
                  setConditionToAdd('Prone');
                }}
                disabled={selectedCharacters.length === 0}
              >
                {t('addProne')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  selectedCharacters.forEach(id => {
                    updateCharacter(id, { conditions: [] });
                  });
                  setSelectedCharacters([]);
                }}
                disabled={selectedCharacters.length === 0}
              >
                {t('clearConditions')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  selectedCharacters.forEach(id => {
                    const character = session.characters.find(c => c.id === id);
                    if (character) {
                      updateCharacter(id, { currentHp: character.maxHp });
                    }
                  });
                  setSelectedCharacters([]);
                }}
                disabled={selectedCharacters.length === 0}
                className="text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                {t('fullHeal')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}