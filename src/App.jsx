import { createSignal, createEffect, For } from 'solid-js';
import './App.css';
import { GameState } from './gameState';
import { PortalCard } from './components/PortalCard';
import { WorldCard } from './components/WorldCard';
import { PlayerHand } from './components/PlayerHand';
import { GameControls } from './components/GameControls';
import { EventCard } from './components/EventCard';
import { Rules } from './components/Rules';
import { DebugControls } from './components/DebugControls';

function App() {
  const [gameState, setGameState] = createSignal(new GameState());
  
  const updateGameState = (updater) => {
    setGameState(prev => {
      // Create a completely new state object with all new references
      const newPlayerHands = [
        [...prev.playerHands[0]], 
        [...prev.playerHands[1]]
      ];
      
      const newPortalCards = prev.portalCards.map(card => ({
        ...card,
        stones: [...card.stones]
      }));
      
      const newWorldCards = prev.worldCards.map(card => ({
        ...card,
        layout: [...card.layout],
        stones: [...card.stones],
        capturedTreasures: [...card.capturedTreasures]
      }));
      
      const newState = {
        ...prev,
        bag: { ...prev.bag },
        playerHands: newPlayerHands,
        portalCards: newPortalCards,
        worldCards: newWorldCards,
        portalInteractions: [...prev.portalInteractions],
        eventDeck: [...prev.eventDeck]
      };
      
      // Apply the update
      updater(newState);
      
      return newState;
    });
  };

  return (
    <div class="game-container">
      <header class="game-header">
        <h1>🌀 Portal Stone Game</h1>
        <div class="game-info">
          <div>Current Player: {gameState().currentPlayer + 1}</div>
          <div>Phase: {gameState().currentPhase}</div>
          <div>Turn: {gameState().turnCount}</div>
        </div>
      </header>

      <div class="game-board">
        {/* World Cards */}
        <div class="world-cards">
          <For each={gameState().worldCards}>
            {(worldCard, index) => (
              <WorldCard 
                card={worldCard} 
                index={index()} 
                gameState={gameState}
                updateGameState={updateGameState}
              />
            )}
          </For>
        </div>

        {/* Portal Cards */}
        <div class="portal-cards">
          <For each={gameState().portalCards}>
            {(portalCard, index) => (
              <PortalCard 
                card={portalCard} 
                index={index()} 
                gameState={gameState}
                updateGameState={updateGameState}
              />
            )}
          </For>
        </div>

        {/* Player Hand */}
        <PlayerHand 
          gameState={gameState}
          updateGameState={updateGameState}
        />

        {/* Event Card */}
        {gameState().currentEventCard && (
          <EventCard 
            card={gameState().currentEventCard}
            gameState={gameState}
            updateGameState={updateGameState}
          />
        )}

        {/* Game Controls */}
        <GameControls 
          gameState={gameState}
          updateGameState={updateGameState}
        />

        {/* Win/Loss Messages */}
        {gameState().gameWon && (
          <div class="game-message win-message">
            <h2>🏆 Victory!</h2>
            <p>All 9 treasures have been captured!</p>
            <p>The worlds are now under your protection!</p>
          </div>
        )}

        {gameState().gameLost && (
          <div class="game-message loss-message">
            <h2>💀 Game Over</h2>
            <p>The darkness has consumed the worlds...</p>
            <p>Better luck next time!</p>
          </div>
        )}

      </div>
      
      <Rules />
      
      <DebugControls 
        gameState={gameState}
        updateGameState={updateGameState}
      />
    </div>
  );
}

export default App;
