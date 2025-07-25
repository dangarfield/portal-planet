import { createMemo } from 'solid-js';
import { drawEventCard, nextPhase, checkGameWin, checkGameLoss, checkTreasureCaptures, getTotalCapturedTreasures } from '../gameState';

export function GameControls({ gameState, updateGameState }) {
  
  const canAdvancePhase = createMemo(() => {
    switch (gameState().currentPhase) {
      case 'draw':
        return gameState().playerHands[gameState().currentPlayer].length > 0;
      case 'act':
        return gameState().portalInteractions.every(interacted => interacted);
      case 'portal':
        return true; // Can always advance from portal phase
      case 'pickup':
        return gameState().currentEventCard === null; // Must resolve event card first
      default:
        return false;
    }
  });

  const handleNextPhase = () => {
    if (!canAdvancePhase()) return;
    
    updateGameState(state => {
      // Handle end of portal phase - return stones to bag
      if (state.currentPhase === 'portal') {
        const hand = state.playerHands[state.currentPlayer];
        hand.forEach(stone => {
          state.bag[stone]++;
        });
        state.playerHands[state.currentPlayer] = [];
      }
      
      // Handle pickup phase - draw event card
      if (state.currentPhase === 'portal') {
        drawEventCard(state);
      }
      
      nextPhase(state);
      
      // Check for treasure captures after any phase
      checkTreasureCaptures(state);
      
      // Check win/loss conditions
      state.gameWon = checkGameWin(state);
      state.gameLost = checkGameLoss(state);
    });
  };

  const getPhaseDescription = () => {
    switch (gameState().currentPhase) {
      case 'draw':
        return 'Draw 3 stones from the bag';
      case 'act':
        return 'Place or remove stones from portal cards (must interact with each portal)';
      case 'portal':
        return 'Transfer patterns from portals to worlds (optional), then return remaining stones to bag';
      case 'pickup':
        return 'Draw and resolve an event card';
      default:
        return '';
    }
  };

  const getNextPhaseText = () => {
    const phases = ['draw', 'act', 'portal', 'pickup'];
    const currentIndex = phases.indexOf(gameState().currentPhase);
    
    if (currentIndex === phases.length - 1) {
      return 'End Turn';
    } else {
      return `Next: ${phases[currentIndex + 1]}`;
    }
  };

  return (
    <div class="card game-controls">
      <h3>Game Controls</h3>
      
      <div class="treasure-progress">
        <h4>🏆 Treasure Progress</h4>
        <div class="treasure-counter">
          {getTotalCapturedTreasures(gameState())}/9 Treasures Captured
        </div>
        <div class="treasure-breakdown">
          {gameState().worldCards.map((world, index) => (
            <div class="world-treasure-status">
              World {index + 1}: {world.capturedTreasures.length}/3
            </div>
          ))}
        </div>
        <div class="treasure-bar">
          <div 
            class="treasure-fill" 
            style={`width: ${(getTotalCapturedTreasures(gameState()) / 9) * 100}%`}
          ></div>
        </div>
      </div>
      
      <div class="phase-info">
        <h4>Current Phase: {gameState().currentPhase}</h4>
        <p>{getPhaseDescription()}</p>
      </div>

      <div class="phase-controls">
        <button 
          class="button phase-button"
          onClick={handleNextPhase}
          disabled={!canAdvancePhase()}
        >
          <span class="button-icon">⏭️</span>
          {getNextPhaseText()}
        </button>

        {!canAdvancePhase() && (
          <div class="phase-requirements">
            {gameState().currentPhase === 'draw' && (
              <p>🎲 You must draw stones first</p>
            )}
            {gameState().currentPhase === 'act' && (
              <div>
                <p>⚡ You must interact with all portal cards:</p>
                <div class="portal-requirements">
                  {gameState().portalInteractions.map((interacted, idx) => (
                    <div class={`portal-requirement ${interacted ? 'completed' : 'pending'}`}>
                      Portal {idx + 1}: {interacted ? '✅ Done' : '❌ Pending'}
                    </div>
                  ))}
                </div>
                <p style="font-size: 0.9em; color: #ccc;">
                  🎯 Drag stones from your hand to portals, or drag stones from portals back to your hand
              </p>
            </div>
          )}
          {gameState().currentPhase === 'pickup' && gameState().currentEventCard && (
            <p>You must resolve the event card first</p>
          )}
        </div>
      )}

      {gameState().gameWon && (
        <div class="game-result win">
          <h2>🎉 Victory! 🎉</h2>
          <p>All world cards have been completed!</p>
        </div>
      )}

      {gameState().gameLost && (
        <div class="game-result loss">
          <h2>💀 Game Over 💀</h2>
          <p>No more stones available and worlds incomplete!</p>
        </div>
      )}

      <div class="game-stats">
        <h4>Game Statistics</h4>
        <div>Turn: {gameState().turnCount}</div>
        <div>Completed Worlds: {gameState().worldCards.filter(w => w.completed).length}/3</div>
        <div>Total Stones in Bag: {gameState().bag.fire + gameState().bag.water + gameState().bag.earth}</div>
      </div>
    </div>
    </div>
  );
}
