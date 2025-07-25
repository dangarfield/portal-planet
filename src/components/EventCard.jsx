import { For } from 'solid-js';
import { drawStones } from '../gameState';

export function EventCard({ card, gameState, updateGameState }) {
  
  const handleResolveCard = () => {
    updateGameState(state => {
      // Check if player has shield and this is a bad card
      if (card.type === 'bad' && state.playerShield && state.playerShield[state.currentPlayer]) {
        // Shield negates the bad card effect
        state.playerShield[state.currentPlayer] = false;
        console.log('Shield activated! Bad card effect negated.');
        
        // Clear the event card
        state.currentEventCard = null;
        return;
      }
      
      switch (card.effect) {
        case 'extraStone':
          // Draw an extra stone and place it on any portal card
          const extraStones = drawStones(state.bag, 1);
          if (extraStones.length > 0) {
            // Find first available portal slot
            for (let i = 0; i < state.portalCards.length; i++) {
              const emptyIndex = state.portalCards[i].stones.findIndex(stone => stone === null);
              if (emptyIndex !== -1) {
                state.portalCards[i].stones[emptyIndex] = extraStones[0];
                break;
              }
            }
          }
          break;
          
        case 'extraStone':
          // Add a stone of choice to any portal card
          const addStones = drawStones(state.bag, 1);
          if (addStones.length > 0) {
            for (let i = 0; i < state.portalCards.length; i++) {
              const emptyIndex = state.portalCards[i].stones.findIndex(stone => stone === null);
              if (emptyIndex !== -1) {
                state.portalCards[i].stones[emptyIndex] = addStones[0];
                break;
              }
            }
          }
          break;
          
        case 'changeColor':
          // Change the color of one stone on a portal card
          for (let i = 0; i < state.portalCards.length; i++) {
            const stoneIndex = state.portalCards[i].stones.findIndex(stone => stone !== null);
            if (stoneIndex !== -1) {
              const colors = ['fire', 'water', 'earth'];
              const currentColor = state.portalCards[i].stones[stoneIndex];
              const newColors = colors.filter(c => c !== currentColor);
              state.portalCards[i].stones[stoneIndex] = newColors[Math.floor(Math.random() * newColors.length)];
              break;
            }
          }
          break;
          
        case 'portalAdd':
          // Pick a random stone and place it on a corresponding world card
          const randomStones = drawStones(state.bag, 1);
          if (randomStones.length > 0) {
            const stoneType = randomStones[0];
            // Find a world card with matching element or treasure slot
            for (let i = 0; i < state.worldCards.length; i++) {
              const world = state.worldCards[i];
              for (let j = 0; j < world.layout.length; j++) {
                if (world.stones[j] === null && 
                    (world.layout[j] === stoneType || world.layout[j] === 'treasure')) {
                  world.stones[j] = stoneType;
                  return; // Exit after placing one stone
                }
              }
            }
            // If no matching slot found, return stone to bag
            state.bag[stoneType]++;
          }
          break;
          
        case 'drawFour':
          // Draw 4 stones next turn - this should be handled in draw phase
          const bonusStones = drawStones(state.bag, 4);
          state.playerHands[state.currentPlayer].push(...bonusStones);
          break;
          
        case 'shield':
          // This effect should be handled when the next bad card is drawn
          // For now, just mark that player has shield
          state.playerShield = state.playerShield || [false, false];
          state.playerShield[state.currentPlayer] = true;
          break;
          
        case 'stealFire':
          // Remove a fire stone from a world card or player hand
          let fireRemoved = false;
          // First try to remove from world cards
          for (let i = 0; i < state.worldCards.length && !fireRemoved; i++) {
            const fireIndex = state.worldCards[i].stones.findIndex(stone => stone === 'fire');
            if (fireIndex !== -1) {
              state.worldCards[i].stones[fireIndex] = null;
              fireRemoved = true;
            }
          }
          // If no fire in worlds, remove from player hand
          if (!fireRemoved) {
            const hand = state.playerHands[state.currentPlayer];
            const fireIndex = hand.findIndex(stone => stone === 'fire');
            if (fireIndex !== -1) {
              hand.splice(fireIndex, 1);
              fireRemoved = true;
            }
          }
          break;
          
        case 'stealWater':
          // Remove a water stone from a world card or player hand
          let waterRemoved = false;
          for (let i = 0; i < state.worldCards.length && !waterRemoved; i++) {
            const waterIndex = state.worldCards[i].stones.findIndex(stone => stone === 'water');
            if (waterIndex !== -1) {
              state.worldCards[i].stones[waterIndex] = null;
              waterRemoved = true;
            }
          }
          if (!waterRemoved) {
            const hand = state.playerHands[state.currentPlayer];
            const waterIndex = hand.findIndex(stone => stone === 'water');
            if (waterIndex !== -1) {
              hand.splice(waterIndex, 1);
              waterRemoved = true;
            }
          }
          break;
          
        case 'stealEarth':
          // Remove an earth stone from a world card or player hand
          let earthRemoved = false;
          for (let i = 0; i < state.worldCards.length && !earthRemoved; i++) {
            const earthIndex = state.worldCards[i].stones.findIndex(stone => stone === 'earth');
            if (earthIndex !== -1) {
              state.worldCards[i].stones[earthIndex] = null;
              earthRemoved = true;
            }
          }
          if (!earthRemoved) {
            const hand = state.playerHands[state.currentPlayer];
            const earthIndex = hand.findIndex(stone => stone === 'earth');
            if (earthIndex !== -1) {
              hand.splice(earthIndex, 1);
              earthRemoved = true;
            }
          }
          break;
          
        case 'chaosSwap':
          // Swap two stones on a portal card
          for (let i = 0; i < state.portalCards.length; i++) {
            const stones = state.portalCards[i].stones;
            const nonNullIndices = stones.map((stone, idx) => stone !== null ? idx : -1).filter(idx => idx !== -1);
            if (nonNullIndices.length >= 2) {
              const idx1 = nonNullIndices[Math.floor(Math.random() * nonNullIndices.length)];
              const idx2 = nonNullIndices[Math.floor(Math.random() * nonNullIndices.length)];
              if (idx1 !== idx2) {
                [stones[idx1], stones[idx2]] = [stones[idx2], stones[idx1]];
                break;
              }
            }
          }
          break;
          
        case 'chaosRemove':
          // Remove a random stone from a portal card
          for (let i = 0; i < state.portalCards.length; i++) {
            const stones = state.portalCards[i].stones;
            const nonNullIndices = stones.map((stone, idx) => stone !== null ? idx : -1).filter(idx => idx !== -1);
            if (nonNullIndices.length > 0) {
              const randomIndex = nonNullIndices[Math.floor(Math.random() * nonNullIndices.length)];
              const removedStone = stones[randomIndex];
              stones[randomIndex] = null;
              state.bag[removedStone]++;
              break;
            }
          }
          break;
          
        case 'returnStones':
          // Return 2 stones from hand to bag
          const hand = state.playerHands[state.currentPlayer];
          const stonesToReturn = hand.splice(0, Math.min(2, hand.length));
          stonesToReturn.forEach(stone => {
            state.bag[stone]++;
          });
          break;
      }
      
      // Clear the event card
      state.currentEventCard = null;
    });
  };

  return (
    <div class="event-card" style={`background-image: url('../assets/event-card-background.svg')`}>
      <div class="event-card-content">
        <h3>{card.name}</h3>
        <div class={`card-type ${card.type}`}>
          {card.type === 'good' ? '✨ Beneficial' : '⚠️ Challenging'}
        </div>
        
        {/* Card Visual */}
        <div class="event-card-visual">
          <img src={`../assets/${card.visual}`} alt={card.name} />
        </div>
        
        {/* Show shield status */}
        {gameState().playerShield && gameState().playerShield[gameState().currentPlayer] && (
          <div class="shield-status">
            🛡️ Shield Active - Next bad card will be negated
          </div>
        )}
        
        {/* Show if this bad card will be blocked */}
        {card.type === 'bad' && gameState().playerShield && gameState().playerShield[gameState().currentPlayer] && (
          <div class="shield-warning">
            ⚡ This effect will be blocked by your shield!
          </div>
        )}
      <p>{card.description}</p>
      
      <button 
        class="button resolve-button"
        onClick={handleResolveCard}
      >
        Resolve Effect
      </button>
    </div>
    </div>
  );
}
