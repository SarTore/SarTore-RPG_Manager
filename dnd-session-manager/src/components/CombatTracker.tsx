import React, { useState, useEffect } from 'react';
import { useSession } from '../context/SessionContext';
import { useI18n } from '../lib/i18n';
import { Button } from './ui/Button';
import { Play, Pause, SkipForward, SkipBack, Square, Timer, RotateCcw, Minus, Plus, Zap, X, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CombatTracker() {
  const { session, startCombat, endCombat, nextTurn, previousTurn, updateCombat, sortByInitiative, updateCharacter } = useSession();
  const { t } = useI18n();
  const [turnTimer, setTurnTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showActionModal, setShowActionModal] = useState<{ characterId: string; actionType: 'damage' | 'heal' | 'condition' | 'remove_condition' } | null>(null);
  const [actionValue, setActionValue] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');

  const currentCharacter = session.characters[session.combat.currentTurn];
  const hasCharacters = session.characters.length > 0;

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerActive && session.combat.isActive) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - session.combat.turnStartTime) / 1000);
        setTurnTimer(elapsed);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isTimerActive, session.combat.isActive, session.combat.turnStartTime]);

  // Auto-start timer when combat starts or turn changes
  useEffect(() => {
    if (session.combat.isActive) {
      setIsTimerActive(true);
      const elapsed = Math.floor((Date.now() - session.combat.turnStartTime) / 1000);
      setTurnTimer(elapsed);
    } else {
      setIsTimerActive(false);
      setTurnTimer(0);
    }
  }, [session.combat.isActive, session.combat.currentTurn, session.combat.turnStartTime]);

  const handleStartCombat = () => {
    if (!hasCharacters) return;
    // Start combat with all characters by default
    const allCharacterIds = session.characters.map(char => char.id);
    startCombat(allCharacterIds);
  };

  const handleEndCombat = () => {
    endCombat();
    setIsTimerActive(false);
    setTurnTimer(0);
  };

  const handleNextTurn = () => {
    nextTurn();
  };

  const handlePreviousTurn = () => {
    previousTurn();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (!session.combat.turnTimeLimit) return 'text-gray-600 dark:text-gray-400';
    const remaining = session.combat.turnTimeLimit - turnTimer;
    if (remaining <= 10) return 'text-red-600 dark:text-red-400';
    if (remaining <= 30) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getTimeText = (seconds: number) => {
    if (seconds === 30) return t('seconds', { count: 30 });
    if (seconds === 60) return t('minute');
    if (seconds === 120) return t('minutes', { count: 2 });
    if (seconds === 300) return t('minutes', { count: 5 });
    return `${seconds}s`;
  };

  const commonConditions = [t('poisoned'), t('stunned'), t('prone'), t('blinded'), t('charmed'), t('frightened'), t('restrained'), t('unconscious'), t('paralyzed'), t('grappled')];

  const handleQuickAction = (characterId: string, actionType: 'damage' | 'heal' | 'condition' | 'remove_condition') => {
    setShowActionModal({ characterId, actionType });
    setActionValue('');
    setSelectedCondition('');
  };

  const executeAction = () => {
    if (!showActionModal) return;
    
    const { characterId, actionType } = showActionModal;
    const character = session.characters.find(c => c.id === characterId);
    if (!character) return;

    const value = parseInt(actionValue, 10);
    
    switch (actionType) {
      case 'damage':
        if (isNaN(value) || value <= 0) return;
        updateCharacter(characterId, {
          currentHp: Math.max(0, character.currentHp - value)
        });
        break;
      case 'heal':
        if (isNaN(value) || value <= 0) return;
        updateCharacter(characterId, {
          currentHp: Math.min(character.maxHp, character.currentHp + value)
        });
        break;
      case 'condition':
        if (!selectedCondition || character.conditions.includes(selectedCondition)) return;
        updateCharacter(characterId, {
          conditions: [...character.conditions, selectedCondition]
        });
        break;
      case 'remove_condition':
        if (!selectedCondition) return;
        updateCharacter(characterId, {
          conditions: character.conditions.filter(c => c !== selectedCondition)
        });
        break;
    }
    
    setShowActionModal(null);
    setActionValue('');
    setSelectedCondition('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <img src="/images/minimalist_fantasy_combat_sword_icon.png" alt="Combat" className="w-5 h-5 mr-2" />
          {t('combatTracker')}
        </h2>
        <div className="flex items-center space-x-2">
          {session.combat.isActive && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Timer className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {t('round')} {session.combat.round}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Combat Status */}
      <div className="mb-4">
        {!session.combat.isActive ? (
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              {hasCharacters ? t('readyToStartCombat') : t('addCharactersToStartCombat')}
            </div>
            <Button 
              onClick={handleStartCombat} 
              disabled={!hasCharacters}
              className="flex items-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>{t('startCombat')}</span>
            </Button>
            <Button
              variant="outline"
              onClick={sortByInitiative}
              disabled={!hasCharacters}
              className="ml-2 flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t('sortByInitiative')}</span>
            </Button>
          </div>
        ) : (
          <div>
            {/* Current Turn Display */}
            {currentCharacter && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">
                      {t('turnsTurn', { name: currentCharacter.name })}
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {t('characterStats', { 
                        ac: currentCharacter.armorClass, 
                        current: currentCharacter.currentHp, 
                        max: currentCharacter.maxHp,
                        init: currentCharacter.initiative
                      })}
                    </p>
                    {currentCharacter.playerName && (
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        {t('player')}: {currentCharacter.playerName}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className={cn('text-2xl font-bold', getTimerColor())}>
                      {formatTime(turnTimer)}
                    </div>
                    {session.combat.turnTimeLimit && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        / {formatTime(session.combat.turnTimeLimit)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Combat Controls */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Button onClick={handlePreviousTurn} variant="outline" size="sm">
                <SkipBack className="w-4 h-4 mr-1" />
                {t('previous')}
              </Button>
              <Button onClick={handleNextTurn} size="sm">
                <SkipForward className="w-4 h-4 mr-1" />
                {t('nextTurn')}
              </Button>
              <Button onClick={handleEndCombat} variant="destructive" size="sm">
                <Square className="w-4 h-4 mr-1" />
                {t('endCombat')}
              </Button>
            </div>

            {/* Turn Timer Controls */}
            <div className="flex items-center space-x-2 mb-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('turnLimit')}
              </label>
              <select
                value={session.combat.turnTimeLimit || ''}
                onChange={(e) => updateCombat({ turnTimeLimit: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">{t('noLimit')}</option>
                <option value="30">{t('seconds', { count: 30 })}</option>
                <option value="60">{t('minute')}</option>
                <option value="120">{t('minutes', { count: 2 })}</option>
                <option value="300">{t('minutes', { count: 5 })}</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  updateCombat({ turnStartTime: Date.now() });
                  setTurnTimer(0);
                }}
              >
                {t('resetTimer')}
              </Button>
            </div>

            {/* Initiative Order */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('initiativeOrder')}</h3>
              <div className="space-y-1">
                {session.characters.map((character, index) => (
                  <div
                    key={character.id}
                    className={cn(
                      'flex items-center justify-between p-2 rounded border',
                      index === session.combat.currentTurn
                        ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600'
                        : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                        index === session.combat.currentTurn
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                      )}>
                        {index + 1}
                      </div>
                      <div>
                        <div className={cn(
                          'font-medium',
                          index === session.combat.currentTurn
                            ? 'text-blue-900 dark:text-blue-100'
                            : 'text-gray-900 dark:text-white'
                        )}>
                          {character.name}
                        </div>
                        {character.playerName && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {character.playerName}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className={cn(
                        'font-medium',
                        index === session.combat.currentTurn
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-400'
                      )}>
                        {t('init')}: {character.initiative}
                      </span>
                      <span className={cn(
                        'text-xs px-2 py-1 rounded',
                        character.currentHp === 0
                          ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          : character.currentHp < character.maxHp * 0.3
                          ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                          : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      )}>
                        {character.currentHp}/{character.maxHp} {t('hp')}
                      </span>
                      
                      {/* Individual Action Buttons */}
                      <div className="flex items-center space-x-1 ml-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickAction(character.id, 'damage')}
                          className="p-1 h-6 w-6 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title={t('applyDamage')}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickAction(character.id, 'heal')}
                          className="p-1 h-6 w-6 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                          title={t('applyHealing')}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickAction(character.id, 'condition')}
                          className="p-1 h-6 w-6 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                          title={t('addCondition')}
                        >
                          <Zap className="w-3 h-3" />
                        </Button>
                        {character.conditions.length > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuickAction(character.id, 'remove_condition')}
                            className="p-1 h-6 w-6 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                            title={t('removeCondition')}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-90vw mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {showActionModal.actionType === 'damage' && t('applyDamage')}
                {showActionModal.actionType === 'heal' && t('applyHealing')}
                {showActionModal.actionType === 'condition' && t('addCondition')}
                {showActionModal.actionType === 'remove_condition' && t('removeCondition')}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowActionModal(null)}
                className="p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="mb-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {t('target')}: {session.characters.find(c => c.id === showActionModal.characterId)?.name}
              </div>
              
              {(showActionModal.actionType === 'damage' || showActionModal.actionType === 'heal') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {showActionModal.actionType === 'damage' ? t('damageAmount') : t('healingAmount')}
                  </label>
                  <input
                    type="number"
                    value={actionValue}
                    onChange={(e) => setActionValue(e.target.value)}
                    min="1"
                    placeholder={t('enterAmount')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
              )}
              
              {(showActionModal.actionType === 'condition' || showActionModal.actionType === 'remove_condition') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('condition')}
                  </label>
                  {showActionModal.actionType === 'condition' ? (
                    <select
                      value={selectedCondition}
                      onChange={(e) => setSelectedCondition(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    >
                      <option value="">{t('selectCondition')}</option>
                      {commonConditions.map(condition => (
                        <option key={condition} value={condition}>{condition}</option>
                      ))}
                    </select>
                  ) : (
                    <select
                      value={selectedCondition}
                      onChange={(e) => setSelectedCondition(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    >
                      <option value="">{t('selectCondition')}</option>
                      {(() => {
                        const character = session.characters.find(c => c.id === showActionModal.characterId);
                        return character?.conditions.map(condition => (
                          <option key={condition} value={condition}>{condition}</option>
                        )) || [];
                      })()}
                    </select>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowActionModal(null)}
              >
                {t('cancel')}
              </Button>
              <Button
                onClick={executeAction}
                disabled={
                  ((showActionModal.actionType === 'damage' || showActionModal.actionType === 'heal') && (!actionValue || parseInt(actionValue, 10) <= 0)) ||
                  ((showActionModal.actionType === 'condition' || showActionModal.actionType === 'remove_condition') && !selectedCondition)
                }
                className={cn(
                  showActionModal.actionType === 'damage' && 'bg-red-600 hover:bg-red-700',
                  showActionModal.actionType === 'heal' && 'bg-green-600 hover:bg-green-700',
                  showActionModal.actionType === 'condition' && 'bg-amber-600 hover:bg-amber-700',
                  showActionModal.actionType === 'remove_condition' && 'bg-purple-600 hover:bg-purple-700'
                )}
              >
                {showActionModal.actionType === 'damage' && t('applyDamage')}
                {showActionModal.actionType === 'heal' && t('applyHealing')}
                {showActionModal.actionType === 'condition' && t('addCondition')}
                {showActionModal.actionType === 'remove_condition' && t('removeCondition')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}