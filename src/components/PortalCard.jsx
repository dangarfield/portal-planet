import { For } from 'solid-js';
import { updatePortalInteractions, canMakeMove } from '../gameState';

export function PortalCard({ card, index, gameState, updateGameState }) {
  
  const handleDragStart = (e, hexIndex) => {
    if (gameState().currentPhase !== 'act' || card.stones[hexIndex] === null) {
      e.preventDefault();
      return;
    }
    
    const stone = card.stones[hexIndex];
    
    // Check if this move is allowed
    if (!canMakeMove(gameState(), index, 'remove', hexIndex, stone)) {
      e.preventDefault();
      return;
    }
    
    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'portal-stone',
      stone: stone,
      portalIndex: index,
      hexIndex: hexIndex
    }));
    e.dataTransfer.effectAllowed = 'move';
    
    // Add visual feedback
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    // Reset visual feedback
    e.target.style.opacity = '1';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Add visual feedback for valid drop zones
    const hexElement = e.currentTarget;
    if (hexElement.classList.contains('empty')) {
      hexElement.classList.add('drag-over');
    }
  };

  const handleDragLeave = (e) => {
    const hexElement = e.currentTarget;
    hexElement.classList.remove('drag-over');
  };

  const handleDrop = (e, hexIndex) => {
    e.preventDefault();
    
    // Remove drag-over styling
    const hexElement = e.currentTarget;
    hexElement.classList.remove('drag-over');
    
    if (card.stones[hexIndex] !== null) return; // Can't drop on occupied hex
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      
      if (data.type === 'hand-stone' && gameState().currentPhase === 'act') {
        // Check if this move is allowed
        if (!canMakeMove(gameState(), index, 'add', hexIndex, data.stone)) {
          return;
        }
        
        // Stone being dropped from hand to portal
        updateGameState(state => {
          // Place stone on portal
          state.portalCards[index].stones[hexIndex] = data.stone;
          
          // Remove the first occurrence of this stone from hand
          const handArray = state.playerHands[data.playerId];
          const stoneIndex = handArray.findIndex(s => s === data.stone);
          if (stoneIndex !== -1) {
            handArray.splice(stoneIndex, 1);
          }
          
          // Update portal interactions based on state comparison
          updatePortalInteractions(state);
        });
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  const handleHexClick = (hexIndex) => {
    console.log(`Portal ${index + 1} hex ${hexIndex} clicked, phase: ${gameState().currentPhase}`);
    
    // Only allow removing stones by clicking, not placing them
    if (gameState().currentPhase !== 'act') {
      console.log('Not in act phase, click ignored');
      return;
    }
    
    // If hex has a stone, check if we can remove it
    if (card.stones[hexIndex] !== null) {
      const stone = card.stones[hexIndex];
      console.log(`Attempting to remove ${stone} stone from hex ${hexIndex}`);
      
      // Check if this move is allowed
      if (!canMakeMove(gameState(), index, 'remove', hexIndex, stone)) {
        console.log('Move not allowed by canMakeMove');
        return;
      }
      
      console.log('Removing stone and returning to hand');
      updateGameState(state => {
        const removedStone = state.portalCards[index].stones[hexIndex];
        state.portalCards[index].stones[hexIndex] = null;
        state.playerHands[state.currentPlayer].push(removedStone);
        
        // Update portal interactions based on state comparison
        updatePortalInteractions(state);
      });
    } else {
      console.log('Hex is empty, no stone to remove');
    }
    // If hex is empty, do nothing - stones must be dragged from hand
  };

  const handleRotate = () => {
    if (gameState().currentPhase !== 'portal') return;
    
    updateGameState(state => {
      const portalStones = state.portalCards[index].stones;
      
      // Rotate stones clockwise around the hexagon center
      // Layout:  0 1     (top row)
      //         2 3 4    (middle row)  
      //          5 6     (bottom row)
      // Your specified mapping: 0→1, 1→4, 2→0, 3→3 (center unchanged), 4→6, 5→2, 6→5
      const rotationMap = [1, 4, 0, 3, 6, 2, 5];
      
      const newStones = Array(7).fill(null);
      for (let i = 0; i < 7; i++) {
        if (portalStones[i] !== null) {
          newStones[rotationMap[i]] = portalStones[i];
        }
      }
      
      state.portalCards[index].stones = newStones;
    });
  };

  const handlePortalDragStart = (e) => {
    if (gameState().currentPhase !== 'portal' || getStoneCount() < 3) {
      e.preventDefault();
      return;
    }
    
    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'portal-card',
      portalIndex: index,
      stones: card.stones // Include all positions (null and non-null)
    }));
    e.dataTransfer.effectAllowed = 'move';
    
    // Add visual feedback
    e.currentTarget.style.opacity = '0.7';
    e.currentTarget.style.transform = 'scale(0.95)';
  };

  const handlePortalDragEnd = (e) => {
    // Reset visual feedback
    e.currentTarget.style.opacity = '1';
    e.currentTarget.style.transform = 'scale(1)';
  };

  const handleTransfer = (worldIndex) => {
    if (!canTransfer()) return;
    
    updateGameState(state => {
      const portalStones = state.portalCards[index].stones.filter(stone => stone !== null);
      const worldCard = state.worldCards[worldIndex];
      
      // Try to match pattern - simplified version
      // In a full implementation, you'd need more complex pattern matching
      let placedCount = 0;
      for (let i = 0; i < worldCard.elements.length && placedCount < portalStones.length; i++) {
        if (worldCard.stones[i] === null && worldCard.elements[i] === portalStones[placedCount]) {
          worldCard.stones[i] = portalStones[placedCount];
          placedCount++;
        }
      }
      
      // Clear the portal card
      state.portalCards[index].stones = Array(7).fill(null);
      
      // Check if world is complete
      worldCard.completed = worldCard.stones.every(stone => stone !== null);
    });
  }

  const getStoneCount = () => {
    return card.stones.filter(stone => stone !== null).length;
  };

  const canTransfer = () => {
    return gameState().currentPhase === 'portal' && getStoneCount() >= 3;
  };

  // Create hexagon layout (7 hexagons in 2,3,2 pattern)
  const getHexagonLayout = () => {
    return [
      [0, 1], // Top row: 2 hexes
      [2, 3, 4], // Middle row: 3 hexes
      [5, 6] // Bottom row: 2 hexes
    ];
  };

  return (
    <div 
      class={`card portal-card ${gameState().currentPhase === 'act' && !gameState().portalInteractions[index] ? 'needs-interaction' : ''}`}
      classList={{
        'draggable-portal': gameState().currentPhase === 'portal' && getStoneCount() >= 3
      }}
      draggable={gameState().currentPhase === 'portal' && getStoneCount() >= 3}
      onDragStart={handlePortalDragStart}
      onDragEnd={handlePortalDragEnd}
      title={gameState().currentPhase === 'portal' ? 
        (getStoneCount() >= 3 ? 'Drag this portal to a world card to transfer exact pattern' : 
         `Need at least 3 stones to transfer (currently ${getStoneCount()})`) : 
        undefined}
    >
      <h3>Portal {index + 1}</h3>
      
      <div class="hexagon-grid">
        <For each={getHexagonLayout()}>
          {(row) => (
            <div class="hex-row">
              <For each={row}>
                {(hexIndex) => {
                  const stone = card.stones[hexIndex];
                  const isEmpty = stone === null;
                  const canDrag = !isEmpty && gameState().currentPhase === 'act' && 
                                 canMakeMove(gameState(), index, 'remove', hexIndex, stone);
                  const canDrop = isEmpty && gameState().currentPhase === 'act';
                  
                  return (
                    <div 
                      class={`hexagon ${stone || 'empty'}`}
                      classList={{
                        'disabled': !isEmpty && !canDrag
                      }}
                      draggable={canDrag}
                      onClick={() => handleHexClick(hexIndex)}
                      onDragStart={(e) => handleDragStart(e, hexIndex)}
                      onDragEnd={handleDragEnd}
                      onDragOver={canDrop ? handleDragOver : undefined}
                      onDragLeave={canDrop ? handleDragLeave : undefined}
                      onDrop={canDrop ? (e) => handleDrop(e, hexIndex) : undefined}
                      title={stone ? 
                        (canDrag ? `${stone} stone - drag to hand or click to remove` : `${stone} stone - cannot move (portal already modified)`) : 
                        'Empty slot - drag stone from hand here'}
                    />
                  );
                }}
              </For>
            </div>
          )}
        </For>
      </div>

      {gameState().currentPhase === 'act' && !gameState().portalInteractions[index] && (
        <div class="interaction-required">
          ⚠️ Action Required
        </div>
      )}

      <div class="portal-info">
        <div>Stones: {getStoneCount()}/7</div>
        {gameState().portalInteractions[index] && (
          <div class="interaction-marker">✓ Interacted</div>
        )}
      </div>

      {gameState().currentPhase === 'portal' && getStoneCount() > 0 && (
        <div class="portal-actions">
          <button 
            class="button rotate-button"
            onClick={handleRotate}
            title="Rotate stones clockwise"
          >
            🔄 Rotate
          </button>
        </div>
      )}

      {canTransfer() && (
        <div class="transfer-info">
          <div class="transfer-hint">
            💡 Drag this portal to a world card to transfer stones
          </div>
        </div>
      )}
    </div>
  );
}
