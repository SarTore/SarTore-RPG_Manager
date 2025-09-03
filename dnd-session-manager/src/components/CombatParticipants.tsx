import React, { useState } from 'react';
import { useSession } from '../context/SessionContext';
import { useI18n } from '../lib/i18n';
import { Button } from './ui/Button';
import { 
  Play, 
  Square, 
  Users, 
  UserCheck, 
  UserX,
  Shield,
  Sword,
  Plus,
  CheckSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CombatParticipantsProps {
  className?: string;
}

export function CombatParticipants({ className }: CombatParticipantsProps) {
  const { session, startCombat, addToCombat, removeFromCombat } = useSession();
  const { t } = useI18n();
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>([]);
  const [useGroupInitiative, setUseGroupInitiative] = useState(false);

  const combatants = session.characters.filter(char => char.isInCombat);
  const nonCombatants = session.characters.filter(char => !char.isInCombat);
  const playerCharacters = session.characters.filter(char => char.isPlayer);
  const npcs = session.characters.filter(char => !char.isPlayer);

  const handleCharacterToggle = (characterId: string) => {
    setSelectedCharacterIds(prev => 
      prev.includes(characterId)
        ? prev.filter(id => id !== characterId)
        : [...prev, characterId]
    );
  };

  const handleSelectAll = () => {
    setSelectedCharacterIds(session.characters.map(char => char.id));
  };

  const handleSelectNone = () => {
    setSelectedCharacterIds([]);
  };

  const handleSelectPlayers = () => {
    setSelectedCharacterIds(playerCharacters.map(char => char.id));
  };

  const handleSelectNPCs = () => {
    setSelectedCharacterIds(npcs.map(char => char.id));
  };

  const handleSelectGroup = (groupId: string) => {
    const groupMembers = session.characters.filter(char => char.groupIds.includes(groupId));
    const groupMemberIds = groupMembers.map(char => char.id);
    
    // Toggle group selection
    const allSelected = groupMemberIds.every(id => selectedCharacterIds.includes(id));
    if (allSelected) {
      setSelectedCharacterIds(prev => prev.filter(id => !groupMemberIds.includes(id)));
    } else {
      setSelectedCharacterIds(prev => [...new Set([...prev, ...groupMemberIds])]);
    }
  };

  const handleStartCombat = () => {
    if (selectedCharacterIds.length === 0) return;
    startCombat(selectedCharacterIds, useGroupInitiative);
    setSelectedCharacterIds([]);
  };

  const handleAddToCombat = () => {
    if (selectedCharacterIds.length === 0) return;
    addToCombat(selectedCharacterIds);
    setSelectedCharacterIds([]);
  };

  const handleRemoveFromCombat = (characterIds: string[]) => {
    removeFromCombat(characterIds);
  };

  const getCharacterHealthStatus = (character: any) => {
    const hpPercentage = character.currentHp / character.maxHp;
    if (hpPercentage <= 0) return { status: 'unconscious', color: 'text-gray-500' };
    if (hpPercentage <= 0.25) return { status: 'critical', color: 'text-red-600' };
    if (hpPercentage <= 0.5) return { status: 'injured', color: 'text-yellow-600' };
    return { status: 'healthy', color: 'text-green-600' };
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('combatParticipants')}</h2>
        <div className="flex items-center space-x-2">
          {session.combat.isActive && (
            <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
              <Play className="w-4 h-4 mr-1" />
              {t('combatActive')} - {t('round')} {session.combat.round}
            </span>
          )}
        </div>
      </div>

      {session.characters.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('noCharactersInSession')}</h3>
          <p className="text-gray-600 dark:text-gray-400">{t('addCharactersToStartCombat')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Combat Selection Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {session.combat.isActive ? t('addToCombat') : t('selectParticipants')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {session.combat.isActive 
                  ? t('selectCharactersToAdd')
                  : t('selectCharactersForCombat')
                }
              </p>
            </div>
            
            <div className="p-4">
              {/* Quick Selection Buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  <CheckSquare className="w-4 h-4 mr-1" />
                  {t('selectAllCharacters')}
                </Button>
                <Button variant="outline" size="sm" onClick={handleSelectPlayers}>
                  <Shield className="w-4 h-4 mr-1" />
                  {t('selectAllPCs')}
                </Button>
                <Button variant="outline" size="sm" onClick={handleSelectNPCs}>
                  <Sword className="w-4 h-4 mr-1" />
                  {t('selectAllNPCs')}
                </Button>
                <Button variant="outline" size="sm" onClick={handleSelectNone}>
                  <Square className="w-4 h-4 mr-1" />
                  {t('none')}
                </Button>
              </div>
              
              {/* Group Selection */}
              {session.groups.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('selectGroup')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {session.groups.map(group => {
                      const groupMembers = session.characters.filter(char => char.groupIds.includes(group.id));
                      const allSelected = groupMembers.length > 0 && groupMembers.every(char => selectedCharacterIds.includes(char.id));
                      
                      return (
                        <Button
                          key={group.id}
                          variant={allSelected ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleSelectGroup(group.id)}
                          disabled={groupMembers.length === 0}
                        >
                          <div 
                            className="w-2 h-2 rounded-full mr-2"
                            style={{ backgroundColor: group.color }}
                          />
                          {group.name} ({groupMembers.length})
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Character List */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {nonCombatants.map(character => {
                  const healthStatus = getCharacterHealthStatus(character);
                  const isSelected = selectedCharacterIds.includes(character.id);
                  
                  return (
                    <label
                      key={character.id}
                      className={cn(
                        'flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors',
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                          : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleCharacterToggle(character.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {character.name}
                          </span>
                          {character.isPlayer && (
                            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded">
                              {t('player')}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <span>Init: {character.initiative}</span>
                          <span>AC: {character.armorClass}</span>
                          <span className={healthStatus.color}>
                            HP: {character.currentHp}/{character.maxHp}
                          </span>
                        </div>
                        
                        {character.groupIds.length > 0 && (
                          <div className="flex items-center space-x-1 mt-1">
                            {character.groupIds.map(groupId => {
                              const group = session.groups.find(g => g.id === groupId);
                              if (!group) return null;
                              
                              return (
                                <span
                                  key={groupId}
                                  className="inline-flex items-center text-xs px-2 py-1 rounded"
                                  style={{ 
                                    backgroundColor: group.color + '20',
                                    color: group.color
                                  }}
                                >
                                  {group.name}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
              
              {/* Initiative Type Toggle */}
              {session.groups.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={useGroupInitiative}
                      onChange={(e) => setUseGroupInitiative(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('groupInitiative')}
                    </span>
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {t('groupInitiativeDescription')}
                  </p>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 mt-4">
                {session.combat.isActive ? (
                  <Button
                    onClick={handleAddToCombat}
                    disabled={selectedCharacterIds.length === 0}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('addToCombat')}
                  </Button>
                ) : (
                  <Button
                    onClick={handleStartCombat}
                    disabled={selectedCharacterIds.length === 0}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {t('startCombat')}
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Current Combatants */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('inCombat')} ({combatants.length})
                </h3>
                {session.combat.isActive && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t('round')} {session.combat.round}
                  </span>
                )}
              </div>
            </div>
            
            <div className="p-4">
              {combatants.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <UserX className="w-8 h-8 mx-auto mb-2" />
                  <p>{t('noCombatants')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {combatants
                    .sort((a, b) => {
                      const aIndex = session.combat.participants.indexOf(a.id);
                      const bIndex = session.combat.participants.indexOf(b.id);
                      return aIndex - bIndex;
                    })
                    .map((character, index) => {
                      const healthStatus = getCharacterHealthStatus(character);
                      const isCurrentTurn = session.combat.isActive && 
                        session.combat.participants[session.combat.currentTurn] === character.id;
                      
                      return (
                        <div
                          key={character.id}
                          className={cn(
                            'flex items-center justify-between p-3 rounded-lg border',
                            isCurrentTurn
                              ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
                              : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                          )}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="text-sm font-mono text-gray-500 dark:text-gray-400 w-6">
                              {index + 1}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {character.name}
                                </span>
                                {character.isPlayer && (
                                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded">
                                    {t('player')}
                                  </span>
                                )}
                                {isCurrentTurn && (
                                  <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs px-2 py-1 rounded">
                                    {t('currentTurn')}
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                                <span>Init: {character.initiative}</span>
                                <span>AC: {character.armorClass}</span>
                                <span className={healthStatus.color}>
                                  HP: {character.currentHp}/{character.maxHp}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFromCombat([character.id])}
                            className="text-red-600 hover:text-red-700"
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}