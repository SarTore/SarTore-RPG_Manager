import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useSession } from '../context/SessionContext';
import { useI18n } from '../lib/i18n';
import { Button } from './ui/Button';
import { CharacterCard } from './CharacterCard';
import { CharacterForm } from './CharacterForm';
import { CombatTracker } from './CombatTracker';
import { DiceRoller } from './DiceRoller';
import { BulkActions } from './BulkActions';
import { SessionNotes } from './SessionNotes';
import { PlayerDashboard } from './PlayerDashboard';
import { QuickReference } from './QuickReference';
import { LanguageSelector } from './LanguageSelector';
import BattleMap from './battle-map/BattleMapNew';
import { GroupsManager } from './GroupsManager';
import { CombatParticipants } from './CombatParticipants';
import { Character } from '../lib/types';
import { 
  Plus, 
  Moon, 
  Sun, 
  BookOpen, 
  Download, 
  Upload, 
  RotateCcw,
  Settings,
  Users,
  Languages,
  Map,
  UsersRound,
  Swords
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function DnDSessionManager() {
  const { theme, toggleTheme } = useTheme();
  const { session, addCharacter, updateCharacter, resetSession, loadSession } = useSession();
  const { t } = useI18n();
  const [showCharacterForm, setShowCharacterForm] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | undefined>();
  const [showQuickReference, setShowQuickReference] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'characters' | 'groups' | 'participants' | 'combat' | 'battlemap' | 'dice' | 'bulk' | 'notes'>('dashboard');

  const handleAddCharacter = (characterData: Omit<Character, 'id'>) => {
    const newCharacterData = {
      ...characterData,
      groupIds: [],
      isInCombat: false,
      mapPosition: undefined
    };
    addCharacter(newCharacterData);
    setShowCharacterForm(false);
  };

  const handleEditCharacter = (character: Character) => {
    setEditingCharacter(character);
    setShowCharacterForm(true);
  };

  const handleUpdateCharacter = (characterData: Omit<Character, 'id'>) => {
    if (editingCharacter) {
      updateCharacter(editingCharacter.id, characterData);
    }
    setShowCharacterForm(false);
    setEditingCharacter(undefined);
  };

  const handleExportSession = () => {
    const dataStr = JSON.stringify(session, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dnd-session-${session.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSession = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const sessionData = JSON.parse(e.target?.result as string);
          loadSession(sessionData);
        } catch (error) {
          alert(t('errorLoadingSession'));
        }
      };
      reader.readAsText(file);
    }
  };

  const tabs = [
    { id: 'dashboard', label: t('dashboard'), icon: Users },
    { id: 'characters', label: t('characters'), icon: Users },
    { id: 'groups', label: t('groups'), icon: UsersRound },
    { id: 'participants', label: t('combatParticipants'), icon: Swords },
    { id: 'combat', label: t('combat'), icon: 'sword' },
    { id: 'battlemap', label: t('battleMap'), icon: Map },
    { id: 'dice', label: t('dice'), icon: 'dice' },
    { id: 'bulk', label: t('bulkActions'), icon: Settings },
    { id: 'notes', label: t('notes'), icon: 'scroll' },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <img src="/images/d20-dice-rpg-fantasy-gaming-icon.jpg" alt={t('dndLogo')} className="w-8 h-8" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('appTitle')}
              </h1>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {session.name}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowLanguageSelector(true)}
                title={t('language')}
              >
                <Languages className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowQuickReference(true)}
                title={t('quickReference')}
              >
                <BookOpen className="w-4 h-4" />
              </Button>
              
              <input
                type="file"
                accept=".json"
                onChange={handleImportSession}
                className="hidden"
                id="import-session"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => document.getElementById('import-session')?.click()}
                title={t('importSession')}
              >
                <Upload className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleExportSession}
                title={t('exportSession')}
              >
                <Download className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (confirm(t('resetSessionConfirm'))) {
                    resetSession();
                  }
                }}
                title={t('resetSession')}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                title={t('switchTheme', { mode: theme === 'light' ? t('darkMode') : t('lightMode') })}
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-1 bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => {
              const IconComponent = tab.icon === 'sword' 
                ? () => <img src="/images/minimalist_fantasy_combat_sword_icon.png" alt={t('combat')} className="w-4 h-4" />
                : tab.icon === 'dice'
                ? () => <img src="/images/clean_modern_d20_dice_icon_fantasy_gaming.jpg" alt={t('dice')} className="w-4 h-4" />
                : tab.icon === 'scroll'
                ? () => <img src="/images/fantasy_parchment_scroll_icon_blank.jpg" alt={t('notes')} className="w-4 h-4" />
                : tab.icon;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    'flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                    activeTab === tab.id
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'dashboard' && <PlayerDashboard />}
          
          {activeTab === 'characters' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('characters')}</h2>
                <Button onClick={() => setShowCharacterForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('addCharacter')}
                </Button>
              </div>
              
              {session.characters.length === 0 ? (
                <div className="text-center py-12">
                  <img src="/images/d20-dice-rpg-fantasy-gaming-icon.jpg" alt={t('noCharacters')} className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('noCharactersYet')}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{t('addCharactersToStart')}</p>
                  <Button onClick={() => setShowCharacterForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('addFirstCharacter')}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {session.characters.map((character, index) => (
                    <CharacterCard
                      key={character.id}
                      character={character}
                      isCurrentTurn={session.combat.isActive && session.combat.currentTurn === index}
                      onEdit={handleEditCharacter}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'groups' && <GroupsManager />}
          {activeTab === 'participants' && <CombatParticipants />}
          {activeTab === 'battlemap' && (
            <BattleMap
              characters={session.characters}
              combatants={session.characters.filter(char => char.isInCombat || false)}
              currentTurnCharacterId={session.combat.isActive && session.combat.participants.length > 0 
                ? session.combat.participants[session.combat.currentTurn] 
                : undefined}
            />
          )}
          {activeTab === 'combat' && <CombatTracker />}
          {activeTab === 'dice' && <DiceRoller />}
          {activeTab === 'bulk' && <BulkActions />}
          {activeTab === 'notes' && <SessionNotes />}
        </div>
      </div>

      {/* Character Form Modal */}
      <CharacterForm
        character={editingCharacter}
        onSave={editingCharacter ? handleUpdateCharacter : handleAddCharacter}
        onCancel={() => {
          setShowCharacterForm(false);
          setEditingCharacter(undefined);
        }}
        isOpen={showCharacterForm}
      />

      {/* Quick Reference Modal */}
      <QuickReference
        isOpen={showQuickReference}
        onClose={() => setShowQuickReference(false)}
      />

      {/* Language Selector Modal */}
      <LanguageSelector
        isOpen={showLanguageSelector}
        onClose={() => setShowLanguageSelector(false)}
      />
    </div>
  );
}