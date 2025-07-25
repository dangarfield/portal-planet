import { For, createMemo, Show } from 'solid-js';
import { drawStones, snapshotPortalStates, updatePortalInteractions, canMakeMove } from '../gameState';

export function PlayerHand({ gameState, updateGameState }) {
  
  const currentHand = createMemo(() => {
    const state = gameState(); // Call gameState as a function to get current value
    return state.playerHands[state.currentPlayer];
  });

  const handleDragStart = (e, stone, handIndex) => {
    if (gameState().currentPhase !== 'act') {
      e.preventDefault();
      return;
    }
    
    console.log('Starting drag from hand:', stone);
    
    e.dataTransfer.setData('text/plain', JSON.stringify({
      type: 'hand-stone',
      stone: stone,
      handIndex: handIndex,
      playerId: gameState().currentPlayer
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
  };

  const handleDrop = (e) => {
    e.preventDefault();
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      console.log('Drop on hand:', data);
      
      if (data.type === 'portal-stone') {
        // Check if this move is allowed (should already be checked in drag start, but double-check)
        if (!canMakeMove(gameState(), data.portalIndex, 'remove', data.hexIndex, data.stone)) {
          console.log('Move not allowed - portal already has a different move');
          return;
        }
        
        // Stone being dropped from portal to hand
        updateGameState(state => {
          // Add stone to hand
          state.playerHands[state.currentPlayer].push(data.stone);
          
          // Remove stone from portal
          state.portalCards[data.portalIndex].stones[data.hexIndex] = null;
          
          // Update portal interactions based on state comparison
          updatePortalInteractions(state);
        });
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  const handleDrawStones = () => {
    if (gameState().currentPhase !== 'draw' || currentHand().length > 0) return;
    
    updateGameState(state => {
      const drawnStones = drawStones(state.bag, 3);
      
      // Create a completely new array for the current player's hand
      state.playerHands[state.currentPlayer] = [
        ...state.playerHands[state.currentPlayer],
        ...drawnStones
      ];
      
      // Immediately progress to act phase after drawing stones
      state.currentPhase = 'act';
      
      // Snapshot portal states for interaction tracking
      snapshotPortalStates(state);
      state.portalInteractions = [false, false, false]; // Reset interactions
    });
  };

  const canDraw = () => {
    const result = gameState().currentPhase === 'draw' && currentHand().length === 0;
    return result;
  };

  const returnStonesToBag = () => {
    updateGameState(state => {
      const hand = state.playerHands[state.currentPlayer];
      hand.forEach(stone => {
        state.bag[stone]++;
      });
      state.playerHands[state.currentPlayer] = [];
    });
  };

  const getStoneCount = (element) => {
    return currentHand().filter(stone => stone === element).length;
  };

  return (
    <div 
      class="card player-hand"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <h3>Player {gameState().currentPlayer + 1} Hand</h3>
      
      {/* Debug info */}
      <div style="font-size: 0.8em; color: #ccc; margin-bottom: 10px;">
        Phase: {gameState().currentPhase} | Hand: {currentHand().length} stones
        <br />
        Hand contents: {JSON.stringify(currentHand())}
        <br />
        Can draw: {canDraw() ? 'Yes' : 'No'}
        <br/ >
        Stone Bag: Fire: {gameState().bag.fire}. Water: {gameState().bag.water}. Earth: {gameState().bag.earth}
      </div>
      
      {gameState().currentPhase === 'draw' && (
        <button 
          class="button draw-button"
          onClick={handleDrawStones}
          disabled={!canDraw()}
        >
          <span class="button-icon">🎲</span>
          {canDraw() ? 'Draw 3 Stones' : 'Already Drawn'}
        </button>
      )}
      
      {gameState().currentPhase !== 'draw' && (
        <div style="color: #888; font-style: italic;">
          Wait for draw phase
        </div>
      )}
      
      <div class="hand-contents">
        
        {/* <div class="stone-counts">
          <div class="stone-count fire">Fire: {getStoneCount('fire')}</div>
          <div class="stone-count water">Water: {getStoneCount('water')}</div>
          <div class="stone-count earth">Earth: {getStoneCount('earth')}</div>
        </div> */}
        
        <div class="hand-stones">
          <For each={currentHand()}>
            {(stone, index) => {
              const canDrag = gameState().currentPhase === 'act';
              
              return (
                <div 
                  class={`hexagon hand-hexagon ${stone}`}
                  classList={{
                    'draggable': canDrag,
                    'not-draggable': !canDrag
                  }}
                  draggable={canDrag}
                  onDragStart={(e) => handleDragStart(e, stone, index())}
                  onDragEnd={handleDragEnd}
                  title={canDrag ? 
                    `${stone} stone - drag to portal` : 
                    `${stone} stone - wait for action phase`}
                  data-stone={stone}
                  data-index={index()}
                />
              );
            }}
          </For>
          {currentHand().length === 0 && gameState().currentPhase === 'act' && (
            <div class="empty-hand-message">
              Drag stones from portals here, or draw stones first
            </div>
          )}
          {currentHand().length === 0 && gameState().currentPhase !== 'act' && gameState().currentPhase !== 'draw' && (
            <div class="empty-hand-message">
              No stones in hand
            </div>
          )}
        </div>
      </div>

      <div class="hand-info">
        <div class="hand-stats">
          <span class="stat-label">Total Stones:</span>
          <span class="stat-value">{currentHand().length}</span>
        </div>
        <div class="hand-actions">
          {gameState().currentPhase === 'portal' && currentHand().length > 0 && (
            <button 
              class="button return-button"
              onClick={returnStonesToBag}
            >
              <span class="button-icon">↩️</span>
              Return Stones to Bag
            </button>
          )}
        </div>
      </div>

      {gameState().currentPhase === 'act' && (
        <div class="phase-instructions">
          <h4>Action Phase</h4>
          <p>You must interact with each portal card (place or remove a stone)</p>
          <div class="portal-status">
            <For each={gameState().portalInteractions}>
              {(interacted, index) => (
                <div class={`portal-status-item ${interacted ? 'done' : 'pending'}`}>
                  Portal {index() + 1}: {interacted ? '✓' : '○'}
                </div>
              )}
            </For>
          </div>
        </div>
      )}
    </div>
  );
}
