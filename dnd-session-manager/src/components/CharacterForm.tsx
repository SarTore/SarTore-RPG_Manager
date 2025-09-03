import React, { useState, useEffect } from 'react';
import { Character } from '../lib/types';
import { useI18n } from '../lib/i18n';
import { Button } from './ui/Button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CharacterFormProps {
  character?: Character;
  onSave: (character: Omit<Character, 'id'>) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export function CharacterForm({ character, onSave, onCancel, isOpen }: CharacterFormProps) {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    name: '',
    playerName: '',
    initiative: 0,
    maxHp: 1,
    currentHp: 1,
    armorClass: 10,
    conditions: [] as string[],
    notes: '',
    isPlayer: false,
    spellSlots: {
      level1: { current: 0, max: 0 },
      level2: { current: 0, max: 0 },
      level3: { current: 0, max: 0 },
      level4: { current: 0, max: 0 },
      level5: { current: 0, max: 0 },
      level6: { current: 0, max: 0 },
      level7: { current: 0, max: 0 },
      level8: { current: 0, max: 0 },
      level9: { current: 0, max: 0 },
    },
  });

  // Update form data when character prop changes
  useEffect(() => {
    if (character) {
      setFormData({
        name: character.name || '',
        playerName: character.playerName || '',
        initiative: character.initiative || 0,
        maxHp: character.maxHp || 1,
        currentHp: character.currentHp || 1,
        armorClass: character.armorClass || 10,
        conditions: character.conditions || [],
        notes: character.notes || '',
        isPlayer: character.isPlayer || false,
        spellSlots: character.spellSlots || {
          level1: { current: 0, max: 0 },
          level2: { current: 0, max: 0 },
          level3: { current: 0, max: 0 },
          level4: { current: 0, max: 0 },
          level5: { current: 0, max: 0 },
          level6: { current: 0, max: 0 },
          level7: { current: 0, max: 0 },
          level8: { current: 0, max: 0 },
          level9: { current: 0, max: 0 },
        },
      });
    } else {
      // Reset form for new character
      setFormData({
        name: '',
        playerName: '',
        initiative: 0,
        maxHp: 1,
        currentHp: 1,
        armorClass: 10,
        conditions: [],
        notes: '',
        isPlayer: false,
        spellSlots: {
          level1: { current: 0, max: 0 },
          level2: { current: 0, max: 0 },
          level3: { current: 0, max: 0 },
          level4: { current: 0, max: 0 },
          level5: { current: 0, max: 0 },
          level6: { current: 0, max: 0 },
          level7: { current: 0, max: 0 },
          level8: { current: 0, max: 0 },
          level9: { current: 0, max: 0 },
        },
      });
    }
  }, [character]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    onSave({
      ...formData,
      currentHp: formData.currentHp || formData.maxHp,
      groupIds: character?.groupIds || [],
      isInCombat: character?.isInCombat || false,
    });
  };

  const updateSpellSlot = (level: keyof typeof formData.spellSlots, field: 'current' | 'max', value: number) => {
    setFormData(prev => ({
      ...prev,
      spellSlots: {
        ...prev.spellSlots,
        [level]: {
          ...prev.spellSlots[level],
          [field]: Math.max(0, value),
        },
      },
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {character ? t('editCharacter') : t('addCharacter')}
          </h2>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            {/* Character Name - Full width when Player Name is hidden */}
            <div className={cn(
              "grid gap-4",
              formData.isPlayer ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
            )}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('characterName')} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              {/* Player Name - Only show when isPlayer is true */}
              {formData.isPlayer && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('playerName')}
                  </label>
                  <input
                    type="text"
                    value={formData.playerName}
                    onChange={(e) => setFormData({ ...formData, playerName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            {/* Player Toggle */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPlayer"
                checked={formData.isPlayer}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  isPlayer: e.target.checked,
                  // Clear player name when switching to NPC
                  playerName: e.target.checked ? formData.playerName : ''
                })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isPlayer" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('playerCharacter')}
              </label>
            </div>
          </div>

          {/* Combat Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('initiative')}
              </label>
              <input
                type="number"
                value={formData.initiative}
                onChange={(e) => setFormData({ ...formData, initiative: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('armorClass')}
              </label>
              <input
                type="number"
                value={formData.armorClass}
                onChange={(e) => setFormData({ ...formData, armorClass: parseInt(e.target.value, 10) || 10 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('maxHP')}
              </label>
              <input
                type="number"
                value={formData.maxHp}
                onChange={(e) => {
                  const newMaxHp = parseInt(e.target.value, 10) || 1;
                  setFormData({ 
                    ...formData, 
                    maxHp: newMaxHp,
                    currentHp: Math.min(formData.currentHp, newMaxHp)
                  });
                }}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('currentHP')}
              </label>
              <input
                type="number"
                value={formData.currentHp}
                onChange={(e) => setFormData({ ...formData, currentHp: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                max={formData.maxHp}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Spell Slots */}
          {formData.isPlayer && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">{t('spellSlots')}</h3>
              <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
                {Object.entries(formData.spellSlots).map(([level, slots]) => {
                  const levelNum = level.replace('level', '');
                  return (
                    <div key={level} className="text-center">
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Lv {levelNum}
                      </div>
                      <div className="flex flex-col space-y-1">
                        <input
                          type="number"
                          value={slots.current}
                          onChange={(e) => updateSpellSlot(level as keyof typeof formData.spellSlots, 'current', parseInt(e.target.value, 10) || 0)}
                          min="0"
                          max={slots.max}
                          className="w-full px-1 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center"
                          placeholder={t('current')}
                        />
                        <input
                          type="number"
                          value={slots.max}
                          onChange={(e) => updateSpellSlot(level as keyof typeof formData.spellSlots, 'max', parseInt(e.target.value, 10) || 0)}
                          min="0"
                          className="w-full px-1 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center"
                          placeholder={t('max')}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('notes')}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('characterNotesPlaceholder')}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={onCancel}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={!formData.name.trim()}>
              {character ? t('update') : t('addCharacter')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}