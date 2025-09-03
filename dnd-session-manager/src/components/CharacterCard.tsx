import React, { useState } from 'react';
import { Character } from '../lib/types';
import { useSession } from '../context/SessionContext';
import { useI18n } from '../lib/i18n';
import { Button } from './ui/Button';
import { Trash2, Edit, Heart, Shield, Clock, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CharacterCardProps {
  character: Character;
  isCurrentTurn?: boolean;
  onEdit: (character: Character) => void;
}

export function CharacterCard({ character, isCurrentTurn = false, onEdit }: CharacterCardProps) {
  const { updateCharacter, removeCharacter, cloneCharacter, session } = useSession();
  const { t } = useI18n();
  const [quickHp, setQuickHp] = useState('');

  const hpPercentage = (character.currentHp / character.maxHp) * 100;
  const getHpColor = () => {
    if (hpPercentage > 60) return 'bg-green-500';
    if (hpPercentage > 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleQuickHpChange = (type: 'damage' | 'heal') => {
    const amount = parseInt(quickHp, 10);
    if (isNaN(amount) || amount <= 0) return;

    const newHp = type === 'damage' 
      ? Math.max(0, character.currentHp - amount)
      : Math.min(character.maxHp, character.currentHp + amount);
    
    updateCharacter(character.id, { currentHp: newHp });
    setQuickHp('');
  };

  const addCondition = (condition: string) => {
    if (!character.conditions.includes(condition)) {
      updateCharacter(character.id, {
        conditions: [...character.conditions, condition]
      });
    }
  };

  const removeCondition = (condition: string) => {
    updateCharacter(character.id, {
      conditions: character.conditions.filter(c => c !== condition)
    });
  };

  return (
    <div className={cn(
      'bg-white dark:bg-gray-800 rounded-lg p-4 border-2 transition-all duration-200',
      isCurrentTurn 
        ? 'border-blue-500 shadow-lg shadow-blue-500/25 bg-blue-50 dark:bg-blue-900/20' 
        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
            {character.name}
          </h3>
          {character.isPlayer && (
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
              {t('player')}
            </span>
          )}
          {isCurrentTurn && (
            <Clock className="w-4 h-4 text-blue-500 animate-pulse" />
          )}
        </div>
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(character)}
            className="h-8 w-8"
            title={t('editCharacter')}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => cloneCharacter(character.id)}
            className="h-8 w-8 text-blue-600 hover:text-blue-700"
            title={t('cloneCharacter')}
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeCharacter(character.id)}
            className="h-8 w-8 text-red-600 hover:text-red-700"
            title={t('deleteCharacter')}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Initiative */}
      <div className="flex items-center space-x-4 mb-3">
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('initiative')}</span>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {character.initiative}
          </div>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('ac')}</span>
          <div className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <Shield className="w-4 h-4 mr-1" />
            {character.armorClass}
          </div>
        </div>
      </div>

      {/* Health */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center">
            <Heart className="w-4 h-4 mr-1" />
            {t('health')}
          </span>
          <span className="text-sm text-gray-900 dark:text-white">
            {character.currentHp} / {character.maxHp}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className={cn('h-3 rounded-full transition-all duration-300', getHpColor())}
            style={{ width: `${Math.max(0, hpPercentage)}%` }}
          />
        </div>
      </div>

      {/* Quick HP Management */}
      <div className="flex items-center space-x-2 mb-3">
        <input
          type="number"
          value={quickHp}
          onChange={(e) => setQuickHp(e.target.value)}
          placeholder={t('hp')}
          className="w-16 px-2 py-1 border rounded text-center bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickHpChange('damage')}
          disabled={!quickHp}
          className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          {t('damage')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickHpChange('heal')}
          disabled={!quickHp}
          className="text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-900/20"
        >
          {t('heal')}
        </Button>
      </div>

      {/* Conditions */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{t('conditions')}</span>
        </div>
        <div className="flex flex-wrap gap-1 mb-2">
          {character.conditions.map((condition) => (
            <span
              key={condition}
              className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs px-2 py-1 rounded-full cursor-pointer hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
              onClick={() => removeCondition(condition)}
            >
              {t(condition.toLowerCase())} ×
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {[t('poisoned'), t('stunned'), t('prone'), t('blinded'), t('charmed'), t('frightened'), t('restrained')].map((condition) => (
            <button
              key={condition}
              onClick={() => addCondition(condition)}
              className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full transition-colors"
            >
              +{condition}
            </button>
          ))}
        </div>
      </div>

      {/* Player Name */}
      {character.playerName && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {t('player')}: {character.playerName}
        </div>
      )}

      {/* Notes */}
      {character.notes && (
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">{t('notes')}:</span> {character.notes}
        </div>
      )}
    </div>
  );
}