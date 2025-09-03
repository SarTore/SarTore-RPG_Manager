import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { SessionData, Character, CombatState, CharacterGroup, BattleMap, MapObstacle, MapTemplate, MapState, ObstacleAction } from '../lib/types';
import useLocalStorage from '../hooks/useLocalStorage';

interface SessionContextType {
  session: SessionData;
  addCharacter: (character: Omit<Character, 'id'>) => void;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  removeCharacter: (id: string) => void;
  cloneCharacter: (id: string) => void;
  
  // Groups Management
  addGroup: (group: Omit<CharacterGroup, 'id'>) => void;
  updateGroup: (id: string, updates: Partial<CharacterGroup>) => void;
  removeGroup: (id: string) => void;
  assignCharacterToGroup: (characterId: string, groupId: string) => void;
  removeCharacterFromGroup: (characterId: string, groupId: string) => void;
  
  // Combat Management
  startCombat: (participantIds: string[], useGroupInitiative?: boolean) => void;
  endCombat: () => void;
  nextTurn: () => void;
  previousTurn: () => void;
  updateCombat: (updates: Partial<CombatState>) => void;
  addToCombat: (characterIds: string[]) => void;
  removeFromCombat: (characterIds: string[]) => void;
  
  // Battle Map Management
  updateBattleMap: (updates: Partial<BattleMap>) => void;
  addObstacle: (obstacle: Omit<MapObstacle, 'id'>) => void;
  updateObstacle: (id: string, updates: Partial<MapObstacle>) => void;
  removeObstacle: (id: string) => void;
  updateCharacterPosition: (characterId: string, position: { x: number; y: number }) => void;
  
  // Map Templates
  saveMapTemplate: (name: string, description?: string) => void;
  loadMapTemplate: (templateId: string) => void;
  removeMapTemplate: (templateId: string) => void;
  
  // Map State Management
  updateMapState: (updates: Partial<MapState>) => void;
  
  // Map History Management
  addToHistory: (action: ObstacleAction) => void;
  undo: () => void;
  redo: () => void;
  
  // Utility Functions
  updateNotes: (notes: string) => void;
  sortByInitiative: () => void;
  loadSession: (sessionData: SessionData) => void;
  resetSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

type SessionAction =
  // Character Actions
  | { type: 'ADD_CHARACTER'; character: Omit<Character, 'id'> }
  | { type: 'UPDATE_CHARACTER'; id: string; updates: Partial<Character> }
  | { type: 'REMOVE_CHARACTER'; id: string }
  | { type: 'CLONE_CHARACTER'; id: string }
  
  // Group Actions
  | { type: 'ADD_GROUP'; group: Omit<CharacterGroup, 'id'> }
  | { type: 'UPDATE_GROUP'; id: string; updates: Partial<CharacterGroup> }
  | { type: 'REMOVE_GROUP'; id: string }
  | { type: 'ASSIGN_CHARACTER_TO_GROUP'; characterId: string; groupId: string }
  | { type: 'REMOVE_CHARACTER_FROM_GROUP'; characterId: string; groupId: string }
  
  // Combat Actions
  | { type: 'START_COMBAT'; participantIds: string[]; useGroupInitiative?: boolean }
  | { type: 'END_COMBAT' }
  | { type: 'NEXT_TURN' }
  | { type: 'PREVIOUS_TURN' }
  | { type: 'UPDATE_COMBAT'; updates: Partial<CombatState> }
  | { type: 'ADD_TO_COMBAT'; characterIds: string[] }
  | { type: 'REMOVE_FROM_COMBAT'; characterIds: string[] }
  
  // Battle Map Actions
  | { type: 'UPDATE_BATTLE_MAP'; updates: Partial<BattleMap> }
  | { type: 'ADD_OBSTACLE'; obstacle: Omit<MapObstacle, 'id'> }
  | { type: 'UPDATE_OBSTACLE'; id: string; updates: Partial<MapObstacle> }
  | { type: 'REMOVE_OBSTACLE'; id: string }
  | { type: 'UPDATE_CHARACTER_POSITION'; characterId: string; position: { x: number; y: number } }
  
  // Map Template Actions
  | { type: 'SAVE_MAP_TEMPLATE'; name: string; description?: string }
  | { type: 'LOAD_MAP_TEMPLATE'; templateId: string }
  | { type: 'REMOVE_MAP_TEMPLATE'; templateId: string }
  
  // Map State Actions
  | { type: 'UPDATE_MAP_STATE'; updates: Partial<MapState> }
  
  // Map History Actions
  | { type: 'ADD_TO_HISTORY'; action: ObstacleAction }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  
  // Utility Actions
  | { type: 'UPDATE_NOTES'; notes: string }
  | { type: 'SORT_BY_INITIATIVE' }
  | { type: 'LOAD_SESSION'; session: SessionData }
  | { type: 'RESET_SESSION' };

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function generateCloneName(originalName: string): string {
  const copyRegex = /^(.+?)(?:\s*\(Copy(?:\s*(\d+))?\))?$/;
  const match = originalName.match(copyRegex);
  
  if (!match) {
    return `${originalName} (Copy)`;
  }
  
  const baseName = match[1].trim();
  const copyNumber = match[2] ? parseInt(match[2], 10) : 1;
  
  return `${baseName} (Copy ${copyNumber + 1})`;
}

function createDefaultSession(): SessionData {
  return {
    id: generateId(),
    name: 'New Session',
    characters: [],
    groups: [],
    battleMap: {
      id: generateId(),
      name: 'Default Map',
      gridSize: 40,
      mapSize: { width: 30, height: 20 },
      obstacles: [],
      backgroundColor: '#f8f9fa',
      showGrid: true,
      showCoordinates: true,
    },
    mapTemplates: [],
    combat: {
      isActive: false,
      currentTurn: 0,
      turnStartTime: 0,
      round: 1,
      participants: [],
      useGroupInitiative: false,
    },
    mapState: {
      selectedTool: 'select',
      scale: 1,
      panOffset: { x: 0, y: 0 },
      gridSettings: {
        size: 40,
        show: true
      },
      history: [],
      historyIndex: -1
    },
    notes: '',
    lastUpdated: Date.now(),
  };
}

function migrateSessionData(sessionData: any): SessionData {
  // Ensure mapState exists for backwards compatibility
  if (!sessionData.mapState) {
    sessionData.mapState = {
      selectedTool: 'select',
      scale: 1,
      panOffset: { x: 0, y: 0 },
      gridSettings: {
        size: sessionData.battleMap?.gridSize || 40,
        show: sessionData.battleMap?.showGrid !== undefined ? sessionData.battleMap.showGrid : true
      },
      history: [],
      historyIndex: -1
    };
  }
  return sessionData;
}

function sessionReducer(state: SessionData, action: SessionAction): SessionData {
  switch (action.type) {
    // Character Actions
    case 'ADD_CHARACTER':
      return {
        ...state,
        characters: [...state.characters, { 
          ...action.character, 
          id: generateId(),
          groupIds: [],
          isInCombat: false 
        }],
        lastUpdated: Date.now(),
      };

    case 'UPDATE_CHARACTER':
      return {
        ...state,
        characters: state.characters.map(char =>
          char.id === action.id ? { ...char, ...action.updates } : char
        ),
        lastUpdated: Date.now(),
      };

    case 'REMOVE_CHARACTER':
      return {
        ...state,
        characters: state.characters.filter(char => char.id !== action.id),
        combat: {
          ...state.combat,
          participants: state.combat.participants.filter(id => id !== action.id),
        },
        lastUpdated: Date.now(),
      };

    case 'CLONE_CHARACTER':
      const originalCharacter = state.characters.find(char => char.id === action.id);
      if (!originalCharacter) return state;
      
      const clonedCharacter: Character = {
        ...originalCharacter,
        id: generateId(),
        name: generateCloneName(originalCharacter.name),
        currentHp: originalCharacter.maxHp, // Reset HP to maximum
        conditions: [], // Clear temporary conditions
        isInCombat: false, // Not in combat initially
        mapPosition: undefined, // Clear map position
        groupIds: [...originalCharacter.groupIds], // Copy group assignments
      };
      
      return {
        ...state,
        characters: [...state.characters, clonedCharacter],
        lastUpdated: Date.now(),
      };

    // Group Actions
    case 'ADD_GROUP':
      return {
        ...state,
        groups: [...state.groups, { ...action.group, id: generateId() }],
        lastUpdated: Date.now(),
      };

    case 'UPDATE_GROUP':
      return {
        ...state,
        groups: state.groups.map(group =>
          group.id === action.id ? { ...group, ...action.updates } : group
        ),
        lastUpdated: Date.now(),
      };

    case 'REMOVE_GROUP':
      return {
        ...state,
        groups: state.groups.filter(group => group.id !== action.id),
        characters: state.characters.map(char => ({
          ...char,
          groupIds: char.groupIds.filter(groupId => groupId !== action.id),
        })),
        lastUpdated: Date.now(),
      };

    case 'ASSIGN_CHARACTER_TO_GROUP':
      return {
        ...state,
        characters: state.characters.map(char =>
          char.id === action.characterId
            ? { ...char, groupIds: [...new Set([...char.groupIds, action.groupId])] }
            : char
        ),
        lastUpdated: Date.now(),
      };

    case 'REMOVE_CHARACTER_FROM_GROUP':
      return {
        ...state,
        characters: state.characters.map(char =>
          char.id === action.characterId
            ? { ...char, groupIds: char.groupIds.filter(id => id !== action.groupId) }
            : char
        ),
        lastUpdated: Date.now(),
      };

    // Combat Actions
    case 'START_COMBAT':
      const participantCharacters = state.characters
        .filter(char => action.participantIds.includes(char.id))
        .sort((a, b) => b.initiative - a.initiative);
      
      return {
        ...state,
        characters: state.characters.map(char => ({
          ...char,
          isInCombat: action.participantIds.includes(char.id),
        })),
        combat: {
          ...state.combat,
          isActive: true,
          currentTurn: 0,
          turnStartTime: Date.now(),
          round: 1,
          participants: participantCharacters.map(char => char.id),
          useGroupInitiative: action.useGroupInitiative || false,
        },
        lastUpdated: Date.now(),
      };

    case 'END_COMBAT':
      return {
        ...state,
        characters: state.characters.map(char => ({ ...char, isInCombat: false })),
        combat: {
          ...state.combat,
          isActive: false,
          currentTurn: 0,
          turnStartTime: 0,
          participants: [],
        },
        lastUpdated: Date.now(),
      };

    case 'ADD_TO_COMBAT':
      const newParticipants = [...new Set([...state.combat.participants, ...action.characterIds])];
      return {
        ...state,
        characters: state.characters.map(char => ({
          ...char,
          isInCombat: char.isInCombat || action.characterIds.includes(char.id),
        })),
        combat: {
          ...state.combat,
          participants: newParticipants,
        },
        lastUpdated: Date.now(),
      };

    case 'REMOVE_FROM_COMBAT':
      return {
        ...state,
        characters: state.characters.map(char => ({
          ...char,
          isInCombat: char.isInCombat && !action.characterIds.includes(char.id),
        })),
        combat: {
          ...state.combat,
          participants: state.combat.participants.filter(id => !action.characterIds.includes(id)),
        },
        lastUpdated: Date.now(),
      };

    case 'NEXT_TURN':
      const nextTurn = (state.combat.currentTurn + 1) % state.combat.participants.length;
      const newRound = nextTurn === 0 ? state.combat.round + 1 : state.combat.round;
      return {
        ...state,
        combat: {
          ...state.combat,
          currentTurn: nextTurn,
          turnStartTime: Date.now(),
          round: newRound,
        },
        lastUpdated: Date.now(),
      };

    case 'PREVIOUS_TURN':
      const prevTurn = state.combat.currentTurn === 0 
        ? state.combat.participants.length - 1 
        : state.combat.currentTurn - 1;
      const prevRound = state.combat.currentTurn === 0 && state.combat.round > 1 
        ? state.combat.round - 1 
        : state.combat.round;
      return {
        ...state,
        combat: {
          ...state.combat,
          currentTurn: prevTurn,
          turnStartTime: Date.now(),
          round: prevRound,
        },
        lastUpdated: Date.now(),
      };

    case 'UPDATE_COMBAT':
      return {
        ...state,
        combat: { ...state.combat, ...action.updates },
        lastUpdated: Date.now(),
      };

    // Battle Map Actions
    case 'UPDATE_BATTLE_MAP':
      return {
        ...state,
        battleMap: { ...state.battleMap, ...action.updates },
        lastUpdated: Date.now(),
      };

    case 'ADD_OBSTACLE':
      return {
        ...state,
        battleMap: {
          ...state.battleMap,
          obstacles: [...state.battleMap.obstacles, { ...action.obstacle, id: generateId() }],
        },
        lastUpdated: Date.now(),
      };

    case 'UPDATE_OBSTACLE':
      return {
        ...state,
        battleMap: {
          ...state.battleMap,
          obstacles: state.battleMap.obstacles.map(obstacle =>
            obstacle.id === action.id ? { ...obstacle, ...action.updates } : obstacle
          ),
        },
        lastUpdated: Date.now(),
      };

    case 'REMOVE_OBSTACLE':
      return {
        ...state,
        battleMap: {
          ...state.battleMap,
          obstacles: state.battleMap.obstacles.filter(obstacle => obstacle.id !== action.id),
        },
        lastUpdated: Date.now(),
      };

    case 'UPDATE_CHARACTER_POSITION':
      return {
        ...state,
        characters: state.characters.map(char =>
          char.id === action.characterId
            ? { ...char, mapPosition: action.position }
            : char
        ),
        lastUpdated: Date.now(),
      };

    // Map Template Actions
    case 'SAVE_MAP_TEMPLATE':
      const newTemplate: MapTemplate = {
        id: generateId(),
        name: action.name,
        description: action.description,
        battleMap: { ...state.battleMap, id: generateId() },
      };
      return {
        ...state,
        mapTemplates: [...state.mapTemplates, newTemplate],
        lastUpdated: Date.now(),
      };

    case 'LOAD_MAP_TEMPLATE':
      const template = state.mapTemplates.find(t => t.id === action.templateId);
      if (!template) return state;
      return {
        ...state,
        battleMap: { ...template.battleMap, id: generateId() },
        lastUpdated: Date.now(),
      };

    case 'REMOVE_MAP_TEMPLATE':
      return {
        ...state,
        mapTemplates: state.mapTemplates.filter(template => template.id !== action.templateId),
        lastUpdated: Date.now(),
      };

    case 'UPDATE_MAP_STATE':
      return {
        ...state,
        mapState: { ...state.mapState, ...action.updates },
        lastUpdated: Date.now(),
      };

    // Map History Actions
    case 'ADD_TO_HISTORY':
      const newHistory = state.mapState.history.slice(0, state.mapState.historyIndex + 1);
      newHistory.push(action.action);
      return {
        ...state,
        mapState: {
          ...state.mapState,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        },
        lastUpdated: Date.now(),
      };

    case 'UNDO':
      if (state.mapState.historyIndex < 0) return state;
      
      const undoAction = state.mapState.history[state.mapState.historyIndex];
      let newStateAfterUndo = state;
      
      if (undoAction.type === 'add') {
        // Undo an add by removing the obstacle
        newStateAfterUndo = {
          ...state,
          battleMap: {
            ...state.battleMap,
            obstacles: state.battleMap.obstacles.filter(obs => obs.id !== undoAction.obstacle.id),
          },
        };
      } else {
        // Undo a remove by adding the obstacle back
        newStateAfterUndo = {
          ...state,
          battleMap: {
            ...state.battleMap,
            obstacles: [...state.battleMap.obstacles, undoAction.obstacle],
          },
        };
      }
      
      return {
        ...newStateAfterUndo,
        mapState: {
          ...state.mapState,
          historyIndex: state.mapState.historyIndex - 1,
        },
        lastUpdated: Date.now(),
      };

    case 'REDO':
      if (state.mapState.historyIndex >= state.mapState.history.length - 1) return state;
      
      const nextIndex = state.mapState.historyIndex + 1;
      const redoAction = state.mapState.history[nextIndex];
      let newStateAfterRedo = state;
      
      if (redoAction.type === 'add') {
        // Redo an add by adding the obstacle back
        newStateAfterRedo = {
          ...state,
          battleMap: {
            ...state.battleMap,
            obstacles: [...state.battleMap.obstacles, redoAction.obstacle],
          },
        };
      } else {
        // Redo a remove by removing the obstacle
        newStateAfterRedo = {
          ...state,
          battleMap: {
            ...state.battleMap,
            obstacles: state.battleMap.obstacles.filter(obs => obs.id !== redoAction.obstacle.id),
          },
        };
      }
      
      return {
        ...newStateAfterRedo,
        mapState: {
          ...state.mapState,
          historyIndex: nextIndex,
        },
        lastUpdated: Date.now(),
      };

    case 'UPDATE_NOTES':
      return {
        ...state,
        notes: action.notes,
        lastUpdated: Date.now(),
      };

    case 'SORT_BY_INITIATIVE':
      const sortedParticipants = state.combat.participants
        .map(id => state.characters.find(char => char.id === id)!)
        .filter(Boolean)
        .sort((a, b) => b.initiative - a.initiative)
        .map(char => char.id);
      
      return {
        ...state,
        combat: {
          ...state.combat,
          participants: sortedParticipants,
        },
        lastUpdated: Date.now(),
      };

    case 'LOAD_SESSION':
      return migrateSessionData(action.session);

    case 'RESET_SESSION':
      return createDefaultSession();

    default:
      return state;
  }
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [persistedSession, setPersistedSession] = useLocalStorage<SessionData>(
    'dnd-session',
    createDefaultSession()
  );

  const [session, dispatch] = useReducer(sessionReducer, migrateSessionData(persistedSession));

  // Persist session changes to localStorage
  useEffect(() => {
    setPersistedSession(session);
  }, [session, setPersistedSession]);

  const contextValue: SessionContextType = {
    session,
    addCharacter: (character) => dispatch({ type: 'ADD_CHARACTER', character }),
    updateCharacter: (id, updates) => dispatch({ type: 'UPDATE_CHARACTER', id, updates }),
    removeCharacter: (id) => dispatch({ type: 'REMOVE_CHARACTER', id }),
    cloneCharacter: (id) => dispatch({ type: 'CLONE_CHARACTER', id }),
    
    // Groups Management
    addGroup: (group) => dispatch({ type: 'ADD_GROUP', group }),
    updateGroup: (id, updates) => dispatch({ type: 'UPDATE_GROUP', id, updates }),
    removeGroup: (id) => dispatch({ type: 'REMOVE_GROUP', id }),
    assignCharacterToGroup: (characterId, groupId) => dispatch({ type: 'ASSIGN_CHARACTER_TO_GROUP', characterId, groupId }),
    removeCharacterFromGroup: (characterId, groupId) => dispatch({ type: 'REMOVE_CHARACTER_FROM_GROUP', characterId, groupId }),
    
    // Combat Management
    startCombat: (participantIds, useGroupInitiative) => dispatch({ type: 'START_COMBAT', participantIds, useGroupInitiative }),
    endCombat: () => dispatch({ type: 'END_COMBAT' }),
    nextTurn: () => dispatch({ type: 'NEXT_TURN' }),
    previousTurn: () => dispatch({ type: 'PREVIOUS_TURN' }),
    updateCombat: (updates) => dispatch({ type: 'UPDATE_COMBAT', updates }),
    addToCombat: (characterIds) => dispatch({ type: 'ADD_TO_COMBAT', characterIds }),
    removeFromCombat: (characterIds) => dispatch({ type: 'REMOVE_FROM_COMBAT', characterIds }),
    
    // Battle Map Management
    updateBattleMap: (updates) => dispatch({ type: 'UPDATE_BATTLE_MAP', updates }),
    addObstacle: (obstacle) => dispatch({ type: 'ADD_OBSTACLE', obstacle }),
    updateObstacle: (id, updates) => dispatch({ type: 'UPDATE_OBSTACLE', id, updates }),
    removeObstacle: (id) => dispatch({ type: 'REMOVE_OBSTACLE', id }),
    updateCharacterPosition: (characterId, position) => dispatch({ type: 'UPDATE_CHARACTER_POSITION', characterId, position }),
    
    // Map Templates
    saveMapTemplate: (name, description) => dispatch({ type: 'SAVE_MAP_TEMPLATE', name, description }),
    loadMapTemplate: (templateId) => dispatch({ type: 'LOAD_MAP_TEMPLATE', templateId }),
    removeMapTemplate: (templateId) => dispatch({ type: 'REMOVE_MAP_TEMPLATE', templateId }),
    
    // Map State Management
    updateMapState: (updates) => dispatch({ type: 'UPDATE_MAP_STATE', updates }),
    
    // Map History Management
    addToHistory: (action) => dispatch({ type: 'ADD_TO_HISTORY', action }),
    undo: () => dispatch({ type: 'UNDO' }),
    redo: () => dispatch({ type: 'REDO' }),
    
    // Utility Functions
    updateNotes: (notes) => dispatch({ type: 'UPDATE_NOTES', notes }),
    sortByInitiative: () => dispatch({ type: 'SORT_BY_INITIATIVE' }),
    loadSession: (sessionData) => dispatch({ type: 'LOAD_SESSION', session: sessionData }),
    resetSession: () => dispatch({ type: 'RESET_SESSION' }),
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}