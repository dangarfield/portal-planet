import { For } from 'solid-js';
import { checkTreasureCaptures } from '../gameState';

export function WorldCard({ card, index, gameState, updateGameState }) {
  
  const handleWorldDragOver = (e) => {
    if (gameState().currentPhase !== 'portal') return;
    
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Add visual feedback
    e.currentTarget.classList.add('drag-over');
  };

  const handleWorldDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleWorldDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      console.log('=== PORTAL DROP DEBUG ===');
      console.log('Portal dropped on world:', data);
      console.log('Portal stones:', data.stones);
      console.log('World card layout:', card.layout);
      console.log('World card stones BEFORE:', card.stones);
      
      if (data.type === 'portal-card' && gameState().currentPhase === 'portal') {
        const portalStones = data.stones;
        
        console.log('Checking if portal can fit in world...');
        const fitResult = canPortalFitInWorld(portalStones, card);
        console.log('Fit result:', fitResult);
        
        if (fitResult.canFit) {
          console.log('Portal can fit! Attempting transfer...');
          
          // Transfer stones from portal to world
          updateGameState(state => {
            console.log('World card stones BEFORE transfer:', state.worldCards[index].stones);
            
            const result = transferPortalToWorld(portalStones, state.worldCards[index], state.portalCards[data.portalIndex]);
            console.log('Transfer result:', result);
            
            if (result.success) {
              console.log(`Successfully placed ${result.placedCount} stones`);
              console.log('Placement mapping:', result.placement);
              console.log('World card stones AFTER transfer:', state.worldCards[index].stones);
              
              // Clear the portal card
              state.portalCards[data.portalIndex].stones = Array(7).fill(null);
              console.log('Portal cleared');
              
              // Check for treasure captures
              const newCaptures = checkTreasureCaptures(state);
              if (newCaptures) {
                console.log('New treasures captured!');
              }
              
              console.log('Final world card stones:', state.worldCards[index].stones);
              console.log('Treasure status:', state.worldCards[index].capturedTreasures.length + '/3');
            } else {
              console.error('Transfer failed:', result.reason);
            }
          });
        } else {
          console.log('Portal pattern does not match available world spaces');
          console.log('Detailed analysis:');
          
          // Debug each possible placement
          const possiblePlacements = [
            { name: 'Top-left', mapping: [0, 1, 3, 4, 5, 8, 9] },
            { name: 'Top-right', mapping: [1, 2, 4, 5, 6, 9, 10] },
            { name: 'Center-left', mapping: [3, 4, 7, 8, 9, 12, 13] },
            { name: 'Center', mapping: [4, 5, 8, 9, 10, 13, 14] },
            { name: 'Center-right', mapping: [5, 6, 9, 10, 11, 14, 15] },
            { name: 'Bottom-left', mapping: [8, 9, 12, 13, 14, 16, 17] },
            { name: 'Bottom-right', mapping: [9, 10, 13, 14, 15, 17, 18] }
          ];
          
          possiblePlacements.forEach(placement => {
            console.log(`\n--- Checking ${placement.name} placement ---`);
            const canFit = canPortalFitAtPlacement(portalStones, card, placement.mapping);
            console.log(`Can fit: ${canFit}`);
            
            if (!canFit) {
              // Show why it can't fit - try the first placement for debugging
              const debugPlacement = possiblePlacements[0].portalToWorld;
              console.log('Debugging with first placement:', debugPlacement);
              
              for (let portalPos = 0; portalPos < 7; portalPos++) {
                const worldPos = debugPlacement[portalPos];
                const portalStone = portalStones[portalPos];
                
                if (worldPos === undefined || worldPos === -1) {
                  console.log(`  Portal pos ${portalPos} -> No world mapping`);
                  continue;
                }
                
                const worldElement = card.layout[worldPos];
                const worldStone = card.stones[worldPos];
                
                if (portalStone !== null) {
                  if (worldStone !== null) {
                    console.log(`  Portal pos ${portalPos} -> World pos ${worldPos}: Portal has ${portalStone}, but world position occupied by ${worldStone} - FAIL`);
                  } else if (worldElement !== 'treasure' && worldElement !== portalStone) {
                    console.log(`  Portal pos ${portalPos} -> World pos ${worldPos}: Portal has ${portalStone}, but world element is ${worldElement} - FAIL`);
                  } else {
                    console.log(`  Portal pos ${portalPos} -> World pos ${worldPos}: Portal ${portalStone} matches world element ${worldElement} - OK`);
                  }
                } else {
                  console.log(`  Portal pos ${portalPos} -> World pos ${worldPos}: Portal empty, world has ${worldStone || 'empty'} - OK`);
                }
              }
            }
          });
        }
      }
      console.log('=== END PORTAL DROP DEBUG ===\n');
    } catch (error) {
      console.error('Error handling world drop:', error);
    }
  };

  // Check if a portal's hexagon pattern can fit in the world's hexagon pattern
  const canPortalFitInWorld = (portalStones, worldCard) => {
    // Portal layout (7 positions):  0 1     (2 hexes)
    //                              2 3 4    (3 hexes)  
    //                               5 6     (2 hexes)
    
    // World layout (19 positions):   0  1  2     (3 hexes)
    //                              3  4  5  6    (4 hexes)
    //                            7  8  9 10 11   (5 hexes)
    //                             12 13 14 15    (4 hexes)
    //                              16 17 18      (3 hexes)
    
    // Try different positions where the portal pattern could fit in the world
    // Each array maps portal positions [0,1,2,3,4,5,6] to world positions
    const possiblePlacements = [
      // Top-left area: Portal 0,1 -> World 0,1; Portal 2,3,4 -> World 3,4,5; Portal 5,6 -> World 8,9
      { portalToWorld: [0, 1, 3, 4, 5, 8, 9] },
      // Top-right area: Portal 0,1 -> World 1,2; Portal 2,3,4 -> World 4,5,6; Portal 5,6 -> World 9,10
      { portalToWorld: [1, 2, 4, 5, 6, 9, 10] },
      // Center-left area: Portal 0,1 -> World 3,4; Portal 2,3,4 -> World 7,8,9; Portal 5,6 -> World 12,13
      { portalToWorld: [3, 4, 7, 8, 9, 12, 13] },
      // Center area: Portal 0,1 -> World 4,5; Portal 2,3,4 -> World 8,9,10; Portal 5,6 -> World 13,14
      { portalToWorld: [4, 5, 8, 9, 10, 13, 14] },
      // Center-right area: Portal 0,1 -> World 5,6; Portal 2,3,4 -> World 9,10,11; Portal 5,6 -> World 14,15
      { portalToWorld: [5, 6, 9, 10, 11, 14, 15] },
      // Bottom-left area: Portal 0,1 -> World 8,9; Portal 2,3,4 -> World 12,13,14; Portal 5,6 -> World 16,17
      { portalToWorld: [8, 9, 12, 13, 14, 16, 17] },
      // Bottom-right area: Portal 0,1 -> World 9,10; Portal 2,3,4 -> World 13,14,15; Portal 5,6 -> World 17,18
      { portalToWorld: [9, 10, 13, 14, 15, 17, 18] }
    ];
    
    for (const placement of possiblePlacements) {
      console.log('Trying placement:', placement.portalToWorld);
      if (canPortalFitAtPlacement(portalStones, worldCard, placement.portalToWorld)) {
        console.log('✅ Found working placement:', placement.portalToWorld, placement);
        return { canFit: true, placement: placement.portalToWorld };
      } else {
        console.log('❌ Placement failed');
      }
    }
    
    console.log('❌ No valid placement found');
    return { canFit: false };
  };

  // Check if portal pattern fits at a specific placement
  const canPortalFitAtPlacement = (portalStones, worldCard, portalToWorldMapping) => {
    for (let portalPos = 0; portalPos < 7; portalPos++) {
      const worldPos = portalToWorldMapping[portalPos];
      const portalStone = portalStones[portalPos];
      
      // Skip if this portal position doesn't map to a world position
      if (worldPos === -1) {
        // Portal position must be empty for unmapped positions
        if (portalStone !== null) return false;
        continue;
      }
      
      const worldElement = worldCard.layout[worldPos];
      const worldStone = worldCard.stones[worldPos];
      
      // If portal has a stone at this position
      if (portalStone !== null) {
        // World position must be empty
        if (worldStone !== null) {
          return false;
        }
        
        // Cannot place a stone on a treasure tile
        if (worldElement === 'treasure') {
          return false;
        }
      }
      // If portal is empty at this position, world can have anything (we ignore it)
    }
    
    return true;
  };

  // Transfer portal stones to world using exact placement
  const transferPortalToWorld = (portalStones, worldCard, portalCard) => {
    const fitResult = canPortalFitInWorld(portalStones, worldCard);
    
    if (!fitResult.canFit) {
      return { success: false, reason: 'Portal hexagon pattern does not match any available world positions' };
    }
    
    const placement = fitResult.placement;
    let placedCount = 0;
    
    console.log('Portal stones:', portalStones);
    console.log('Using placement:', placement);
    
    // Place stones at exact mapped positions (portal has 7 positions: 0-6)
    for (let portalPos = 0; portalPos < 7; portalPos++) {
      const worldPos = placement[portalPos];
      const portalStone = portalStones[portalPos];
      
      console.log(`Portal pos ${portalPos} -> World pos ${worldPos}, Stone: ${portalStone}`);
      
      if (portalStone !== null && worldPos !== -1 && worldPos !== undefined) {
        console.log(`Placing ${portalStone} stone at world position ${worldPos}`);
        worldCard.stones[worldPos] = portalStone;
        placedCount++;
      }
    }
    
    console.log(`Placed ${placedCount} stones total`);
    return { success: true, placedCount, placement };
  };
  
  // Get themed world title
  const getWorldTitle = (theme, index) => {
    const titles = {
      fire: '🔥 Fire Realm',
      water: '💧 Water Realm', 
      earth: '🌍 Earth Realm'
    };
    return titles[theme] || `World ${index + 1}`;
  };

  // Create hexagon layout (19 hexagons in 3,4,5,4,3 pattern)
  const getHexagonLayout = () => {
    return [
      [0, 1, 2], // Row 1: 3 hexes
      [3, 4, 5, 6], // Row 2: 4 hexes
      [7, 8, 9, 10, 11], // Row 3: 5 hexes (middle)
      [12, 13, 14, 15], // Row 4: 4 hexes
      [16, 17, 18] // Row 5: 3 hexes
    ];
  };

  const getCompletionPercentage = () => {
    const filledCount = card.stones.filter(stone => stone !== null).length;
    return Math.round((filledCount / 19) * 100);
  };

  const getTreasureStatus = () => {
    const themeNames = {
      fire: 'Fire Crystals',
      water: 'Water Pearls',
      earth: 'Earth Gems'
    };
    const treasureName = themeNames[card.theme] || 'treasures';
    return `${card.capturedTreasures.length}/3 ${treasureName} captured`;
  };

  return (
    <div 
      class={`card world-card ${card.theme}-world`}
      classList={{
        'droppable-world': gameState().currentPhase === 'portal'
      }}
      onDragOver={handleWorldDragOver}
      onDragLeave={handleWorldDragLeave}
      onDrop={handleWorldDrop}
      title={gameState().currentPhase === 'portal' ? 
        'Drop a portal here to transfer matching stone patterns' : 
        undefined}
    >
      <h3>{getWorldTitle(card.theme, index)}</h3>
      <div class="hexagon-grid">
        <For each={getHexagonLayout()}>
          {(row) => (
            <div class="hex-row">
              <For each={row}>
                {(hexIndex) => {
                  const stone = card.stones[hexIndex];
                  const element = card.layout[hexIndex];
                  const isTreasure = element === 'treasure';
                  const isCaptured = card.capturedTreasures.includes(hexIndex);
                  
                  return (
                    <div 
                      class={`hexagon ${stone || element}`}
                      classList={{
                        'treasure': isTreasure,
                        'captured-treasure': isCaptured,
                        'empty-treasure': isTreasure && !stone,
                        'world-empty': !stone && !isTreasure,
                        'world-filled': stone !== null
                      }}
                      title={
                        isTreasure ? 
                          (isCaptured ? '💎 Captured Treasure!' : '💎 Treasure - surround to capture') :
                          (stone ? `${stone} stone on ${element} element` : `Empty ${element} element`)
                      }
                    >
                      {isTreasure && !stone && !isCaptured && '💎'}
                    </div>
                  );
                }}
              </For>
            </div>
          )}
        </For>
      </div>
      
      <div class="world-info">
        <div>Progress: {getCompletionPercentage()}%</div>
        <div class="treasure-status">{getTreasureStatus()}</div>
      </div>
    </div>
  );
}
