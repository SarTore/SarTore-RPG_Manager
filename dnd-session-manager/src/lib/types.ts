export interface Character {
  id: string;
  name: string;
  playerName?: string;
  initiative: number;
  maxHp: number;
  currentHp: number;
  armorClass: number;
  conditions: string[];
  notes: string;
  isPlayer: boolean;
  groupIds: string[]; // Characters can belong to multiple groups
  mapPosition?: { x: number; y: number }; // Position on battle map
  isInCombat: boolean; // Whether character is participating in current combat
  spellSlots?: {
    level1: { current: number; max: number };
    level2: { current: number; max: number };
    level3: { current: number; max: number };
    level4: { current: number; max: number };
    level5: { current: number; max: number };
    level6: { current: number; max: number };
    level7: { current: number; max: number };
    level8: { current: number; max: number };
    level9: { current: number; max: number };
  };
}

export interface CharacterGroup {
  id: string;
  name: string;
  color: string;
  description?: string;
  isActive: boolean; // For group-based initiative
}

export interface MapObstacle {
  id: string;
  type: 'wall' | 'pillar' | 'difficult_terrain' | 'cover' | 'door';
  position: { x: number; y: number };
  color?: string;
}

export interface BattleMap {
  id: string;
  name: string;
  gridSize: number; // Size of each grid square in pixels
  mapSize: { width: number; height: number }; // In grid squares
  obstacles: MapObstacle[];
  backgroundColor: string;
  showGrid: boolean;
  showCoordinates: boolean;
}

export interface MapTemplate {
  id: string;
  name: string;
  description?: string;
  battleMap: BattleMap;
  thumbnail?: string;
}

export interface CombatState {
  isActive: boolean;
  currentTurn: number;
  turnStartTime: number;
  turnTimeLimit?: number; // in seconds
  round: number;
  participants: string[]; // Character IDs participating in combat
  useGroupInitiative: boolean;
  currentGroupId?: string; // When using group initiative
}

export interface SessionData {
  id: string;
  name: string;
  characters: Character[];
  groups: CharacterGroup[];
  battleMap: BattleMap;
  mapTemplates: MapTemplate[];
  combat: CombatState;
  mapState: MapState;
  notes: string;
  lastUpdated: number;
}

export interface DiceRoll {
  id: string;
  type: string;
  result: number;
  details: string;
  timestamp: number;
}

export type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';

export interface BulkAction {
  type: 'damage' | 'heal' | 'condition' | 'remove_condition';
  value: number | string;
  targetIds: string[];
}

export interface AoeTemplate {
  id: string;
  type: 'circle' | 'cone' | 'line' | 'square' | 'rectangle';
  size: number; // radius for circle, length for line, side for square
  position: { x: number; y: number };
  rotation?: number; // for cone and line
  color: string;
  opacity: number;
}

export interface MeasurementTool {
  id: string;
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
  distance: number; // in grid squares
}

// Map interaction states
export type MapTool = 'select' | 'wall' | 'pillar' | 'difficult_terrain' | 'cover' | 'door';

export interface ObstacleAction {
  type: 'add' | 'remove';
  obstacle: MapObstacle;
}

export interface MapState {
  selectedTool: MapTool;
  scale: number;
  panOffset: { x: number; y: number };
  gridSettings: {
    size: number;
    show: boolean;
  };
  history: ObstacleAction[];
  historyIndex: number;
}