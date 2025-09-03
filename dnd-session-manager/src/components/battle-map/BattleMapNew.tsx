import React, { useRef, useEffect, useState } from 'react';
import { useI18n } from '../../lib/i18n';
import { useSession } from '../../context/SessionContext';
import { Character, MapObstacle, MapTool, ObstacleAction } from '../../lib/types';
import './BattleMap.css';

interface BattleMapProps {
  characters: Character[];
  combatants: Character[];
  currentTurnCharacterId?: string;
}

interface Position {
  x: number;
  y: number;
}

interface CharacterToken {
  character: Character;
  position: Position;
}

const BattleMap: React.FC<BattleMapProps> = ({ 
  characters, 
  combatants, 
  currentTurnCharacterId 
}) => {
  const { t } = useI18n();
  const { session, updateCharacterPosition, updateBattleMap, addObstacle, removeObstacle, updateMapState, addToHistory, undo, redo } = useSession();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tokens, setTokens] = useState<CharacterToken[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedToken, setDraggedToken] = useState<CharacterToken | null>(null);

  const canvasWidth = 800;
  const canvasHeight = 600;
  
  // Get state from session context
  const { selectedTool, scale, panOffset, gridSettings, history, historyIndex } = session.mapState;
  const obstacles = session.battleMap.obstacles;

  // Initialize tokens when combatants change
  useEffect(() => {
    const newTokens: CharacterToken[] = combatants.map((character, index) => ({
      character,
      position: character.mapPosition 
        ? { x: character.mapPosition.x * gridSettings.size, y: character.mapPosition.y * gridSettings.size }
        : {
            x: (index % 5) * gridSettings.size + gridSettings.size,
            y: Math.floor(index / 5) * gridSettings.size + gridSettings.size
          }
    }));
    setTokens(newTokens);
  }, [combatants, gridSettings.size]);

  // Draw the battle map
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.save();
    ctx.scale(scale, scale);
    ctx.translate(panOffset.x, panOffset.y);

    if (gridSettings.show) {
      drawGrid(ctx);
    }

    drawObstacles(ctx);
    
    tokens.forEach(token => {
      drawCharacterToken(ctx, token);
    });

    ctx.restore();
  };

  // Draw grid lines
  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    const { size, show } = gridSettings;
    if (!show) return;
    
    const gridWidth = Math.ceil(canvasWidth / scale);
    const gridHeight = Math.ceil(canvasHeight / scale);

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;

    for (let x = 0; x <= gridWidth; x += size) {
      ctx.beginPath();
      ctx.moveTo(x - panOffset.x, -panOffset.y);
      ctx.lineTo(x - panOffset.x, gridHeight - panOffset.y);
      ctx.stroke();
    }

    for (let y = 0; y <= gridHeight; y += size) {
      ctx.beginPath();
      ctx.moveTo(-panOffset.x, y - panOffset.y);
      ctx.lineTo(gridWidth - panOffset.x, y - panOffset.y);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  };

  // Draw obstacles
  const drawObstacles = (ctx: CanvasRenderingContext2D) => {
    obstacles.forEach(obstacle => {
      const x = obstacle.position.x * gridSettings.size;
      const y = obstacle.position.y * gridSettings.size;
      const size = gridSettings.size - 2;
      
      let color = obstacle.color;
      if (!color) {
        switch (obstacle.type) {
          case 'wall':
            color = '#6b7280';
            break;
          case 'pillar':
            color = '#78716c';
            break;
          case 'difficult_terrain':
            color = '#ca8a04';
            break;
          case 'cover':
            color = '#16a34a';
            break;
          case 'door':
            color = '#a855f7';
            break;
          default:
            color = '#6b7280';
        }
      }
      
      ctx.fillStyle = color;
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 1;
      
      if (obstacle.type === 'pillar') {
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillRect(x, y, size, size);
        ctx.strokeRect(x, y, size, size);
      }
      
      if (obstacle.type === 'difficult_terrain') {
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          const offset = i * (size / 3);
          ctx.beginPath();
          ctx.moveTo(x + offset, y);
          ctx.lineTo(x, y + offset);
          ctx.stroke();
          if (offset < size) {
            ctx.beginPath();
            ctx.moveTo(x + size, y + offset);
            ctx.lineTo(x + offset, y + size);
            ctx.stroke();
          }
        }
      } else if (obstacle.type === 'door') {
        ctx.strokeStyle = '#d946ef';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + size / 4, y + size, size / 2, Math.PI, 0);
        ctx.stroke();
      }
    });
  };

  // Draw character token
  const drawCharacterToken = (ctx: CanvasRenderingContext2D, token: CharacterToken) => {
    const { character, position } = token;
    const tokenSize = gridSettings.size - 4;
    const centerX = position.x + tokenSize / 2;
    const centerY = position.y + tokenSize / 2;

    let fillColor = character.isPlayer ? '#4a90e2' : '#e74c3c';
    const isCurrentTurn = character.id === currentTurnCharacterId;
    
    if (isCurrentTurn) {
      fillColor = '#f39c12';
    }

    ctx.fillStyle = fillColor;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, tokenSize / 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const displayText = character.name.length > 8 
      ? character.name.substring(0, 2).toUpperCase()
      : character.name.substring(0, 8);
    
    ctx.fillText(displayText, centerX, centerY);

    const healthPercentage = character.currentHp / character.maxHp;
    if (healthPercentage < 1) {
      const indicatorSize = 8;
      const indicatorX = position.x + tokenSize - indicatorSize;
      const indicatorY = position.y;
      
      let healthColor = '#27ae60';
      if (healthPercentage < 0.5) healthColor = '#f39c12';
      if (healthPercentage < 0.25) healthColor = '#e74c3c';
      
      ctx.fillStyle = healthColor;
      ctx.fillRect(indicatorX, indicatorY, indicatorSize, indicatorSize);
    }
  };

  // Obstacle management functions - Now using context
  const handleAddObstacle = (gridX: number, gridY: number) => {
    if (selectedTool === 'select') return;
    
    const existingObstacle = obstacles.find(
      obs => obs.position.x === gridX && obs.position.y === gridY
    );
    
    if (existingObstacle) {
      removeObstacle(existingObstacle.id);
      addToHistory({ type: 'remove', obstacle: existingObstacle });
    } else {
      const newObstacle: MapObstacle = {
        id: `obstacle_${Date.now()}_${Math.random()}`,
        type: selectedTool as Exclude<MapTool, 'select'>,
        position: { x: gridX, y: gridY }
      };
      addObstacle(newObstacle);
      addToHistory({ type: 'add', obstacle: newObstacle });
    }
  };
  
  const clearObstacles = () => {
    if (obstacles.length > 0) {
      obstacles.forEach(obstacle => {
        addToHistory({ type: 'remove', obstacle });
        removeObstacle(obstacle.id);
      });
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if ((event.ctrlKey || event.metaKey) && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Get cursor style based on selected tool
  const getCursorStyle = () => {
    if (isDragging) return 'grabbing';
    if (selectedTool === 'select') return 'grab';
    return 'crosshair';
  };

  // Tool definitions for UI
  const tools: { id: MapTool; label: string; icon: string }[] = [
    { id: 'select', label: t('selectTool'), icon: '👆' },
    { id: 'wall', label: t('wall'), icon: '🧱' },
    { id: 'pillar', label: t('pillar'), icon: '🏛️' },
    { id: 'difficult_terrain', label: t('difficultTerrain'), icon: '🌿' },
    { id: 'cover', label: t('cover'), icon: '🛡️' },
    { id: 'door', label: t('door'), icon: '🚪' },
  ];

  // Zoom controls
  const handleZoomIn = () => {
    updateMapState({ scale: Math.min(scale * 1.2, 3) });
  };

  const handleZoomOut = () => {
    updateMapState({ scale: Math.max(scale / 1.2, 0.3) });
  };

  // Grid settings handlers
  const handleGridToggle = (show: boolean) => {
    updateMapState({ 
      gridSettings: { ...gridSettings, show }
    });
  };

  const handleGridSizeChange = (size: number) => {
    updateMapState({ 
      gridSettings: { ...gridSettings, size }
    });
  };

  // Tool selection handler
  const handleToolChange = (tool: MapTool) => {
    updateMapState({ selectedTool: tool });
  };

  // Handle mouse events
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = (event.clientX - rect.left) / scale - panOffset.x;
    const mouseY = (event.clientY - rect.top) / scale - panOffset.y;

    const gridX = Math.floor(mouseX / gridSettings.size);
    const gridY = Math.floor(mouseY / gridSettings.size);

    if (selectedTool !== 'select') {
      handleAddObstacle(gridX, gridY);
      return;
    }

    const clickedToken = tokens.find(token => {
      const tokenSize = gridSettings.size - 4;
      return mouseX >= token.position.x && 
             mouseX <= token.position.x + tokenSize &&
             mouseY >= token.position.y && 
             mouseY <= token.position.y + tokenSize;
    });

    if (clickedToken) {
      setIsDragging(true);
      setDraggedToken(clickedToken);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !draggedToken || selectedTool !== 'select') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = (event.clientX - rect.left) / scale - panOffset.x;
    const mouseY = (event.clientY - rect.top) / scale - panOffset.y;

    const snappedX = Math.round(mouseX / gridSettings.size) * gridSettings.size;
    const snappedY = Math.round(mouseY / gridSettings.size) * gridSettings.size;

    setTokens(prevTokens => 
      prevTokens.map(token => 
        token.character.id === draggedToken.character.id
          ? { ...token, position: { x: snappedX, y: snappedY } }
          : token
      )
    );
  };

  const handleMouseUp = () => {
    if (isDragging && draggedToken) {
      // Find the current token position and save it to the character
      const currentToken = tokens.find(token => token.character.id === draggedToken.character.id);
      if (currentToken) {
        const gridX = Math.round(currentToken.position.x / gridSettings.size);
        const gridY = Math.round(currentToken.position.y / gridSettings.size);
        updateCharacterPosition(draggedToken.character.id, { x: gridX, y: gridY });
      }
    }
    setIsDragging(false);
    setDraggedToken(null);
  };

  // Redraw when dependencies change
  useEffect(() => {
    draw();
  }, [tokens, obstacles, gridSettings, scale, panOffset, currentTurnCharacterId]);

  return (
    <div className="battle-map-container">
      <div className="battle-map-controls">
        <div className="tool-controls">
          <span className="tool-label">{t('mapTools')}:</span>
          {tools.map(tool => (
            <button
              key={tool.id}
              onClick={() => handleToolChange(tool.id)}
              className={`tool-button ${selectedTool === tool.id ? 'active' : ''}`}
              title={tool.label}
            >
              <span className="tool-icon">{tool.icon}</span>
              <span className="tool-text">{tool.label}</span>
            </button>
          ))}
        </div>
        
        <div className="map-actions">
          <button 
            onClick={undo} 
            disabled={historyIndex < 0}
            className="action-button"
            title={t('undoShortcut')}
          >
            ↶ {t('undo')}
          </button>
          <button 
            onClick={redo} 
            disabled={historyIndex >= history.length - 1}
            className="action-button"
            title={t('redoShortcut')}
          >
            ↷ {t('redo')}
          </button>
          <button 
            onClick={clearObstacles} 
            disabled={obstacles.length === 0}
            className="action-button danger"
            title={t('clearObstacles')}
          >
            🗑️ {t('clearObstacles')}
          </button>
        </div>
        
        <div className="grid-controls">
          <label>
            <input
              type="checkbox"
              checked={gridSettings.show}
              onChange={(e) => handleGridToggle(e.target.checked)}
            />
            {t('showGrid')}
          </label>
          
          <label>
            {t('gridSize')}: 
            <input
              type="range"
              min="20"
              max="80"
              value={gridSettings.size}
              onChange={(e) => handleGridSizeChange(parseInt(e.target.value))}
            />
            {gridSettings.size}px
          </label>
        </div>

        <div className="zoom-controls">
          <button onClick={handleZoomOut}>{t('zoomOut')}</button>
          <span>{Math.round(scale * 100)}%</span>
          <button onClick={handleZoomIn}>{t('zoomIn')}</button>
        </div>
      </div>

      <div className="battle-map-canvas-container">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ 
            border: '2px solid #333',
            backgroundColor: '#f5f5f5',
            cursor: getCursorStyle()
          }}
        />
      </div>

      <div className="battle-map-info">
        <div>
          <p>{t('combatantsOnMap')}: {tokens.length}</p>
          <p>{t('obstaclesOnMap')}: {obstacles.length}</p>
        </div>
        <div>
          <p>{t('selectedTool')}: {tools.find(tool => tool.id === selectedTool)?.label}</p>
          <p>{t('instructions')}: {selectedTool === 'select' ? t('dragTokensToMove') : t('clickToPlaceObstacles')}</p>
        </div>
      </div>
    </div>
  );
};

export default BattleMap;