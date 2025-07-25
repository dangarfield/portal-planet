// Game state management

function createEventDeck() {
  const cards = [
    // Good cards
    { type: 'good', name: 'Elemental Surge', description: 'Add a stone of your choice to any portal card', effect: 'extraStone', visual: 'elemental-surge.svg', count: 2 },
    { type: 'good', name: 'Transmutation', description: 'Change the color of one stone on a portal card', effect: 'changeColor', visual: 'transmutation.svg', count: 2 },
    { type: 'good', name: 'Portal Boost', description: 'Pick a random stone and place it on a corresponding world card', effect: 'portalAdd', visual: 'portal-boost.svg', count: 2 },
    { type: 'good', name: 'Elemental Harmony', description: 'Draw 4 stones next turn. Keep this card, apply then discard on your next turn', effect: 'drawFour', visual: 'elemental-harmony.svg', count: 2 },
    { type: 'good', name: 'Elemental Shield', description: 'Negate the effect of your next bad card. Keep this card, apply then discard when used', effect: 'shield', visual: 'elemental-shield.svg', count: 2 },
    
    // Bad cards
    { type: 'bad', name: 'Fire Thief', description: 'Portal thief steals a fire stone from a world card. Discard any fire stone from your hand or world', effect: 'stealFire', visual: 'fire-thief.svg', count: 2 },
    { type: 'bad', name: 'Water Thief', description: 'Portal thief steals a water stone from a world card. Discard any water stone from your hand or world', effect: 'stealWater', visual: 'water-thief.svg', count: 2 },
    { type: 'bad', name: 'Earth Thief', description: 'Portal thief steals an earth stone from a world card. Discard any earth stone from your hand or world', effect: 'stealEarth', visual: 'earth-thief.svg', count: 2 },
    { type: 'bad', name: 'Portal Chaos', description: 'Swap two stones on a portal card immediately', effect: 'chaosSwap', visual: 'portal-chaos.svg', count: 2 },
    { type: 'bad', name: 'Portal Disruption', description: 'Remove a random stone from a portal card', effect: 'chaosRemove', visual: 'portal-disruption.svg', count: 2 },
  ];
  
  // Expand deck based on card counts
  const expandedDeck = [];
  cards.forEach(card => {
    for (let i = 0; i < card.count; i++) {
      expandedDeck.push({ ...card });
    }
  });
  
  // Shuffle the expanded deck
  for (let i = expandedDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [expandedDeck[i], expandedDeck[j]] = [expandedDeck[j], expandedDeck[i]];
  }
  
  return expandedDeck;
}

export class GameState {
  constructor() {
    this.currentPlayer = 0;
    this.turnCount = 1;
    this.currentPhase = 'draw'; // draw, act, portal, pickup
    
    // Stone bag - 30 of each element
    this.bag = {
      fire: 30,
      water: 30,
      earth: 30
    };
    
    // Player hands
    this.playerHands = [[], []];
    
    // Portal cards (3 cards, 7 hexagons each in 2,3,2 pattern)
    this.portalCards = [
      { stones: Array(7).fill(null) },
      { stones: Array(7).fill(null) },
      { stones: Array(7).fill(null) }
    ];
    
    // World cards (3 cards, 19 hexagons each - Fire, Water, Earth themed)
    this.worldCards = [
      { 
        layout: this.generateWorldLayout('fire'),
        stones: Array(19).fill(null),
        capturedTreasures: [],
        theme: 'fire'
      },
      { 
        layout: this.generateWorldLayout('water'),
        stones: Array(19).fill(null),
        capturedTreasures: [],
        theme: 'water'
      },
      { 
        layout: this.generateWorldLayout('earth'),
        stones: Array(19).fill(null),
        capturedTreasures: [],
        theme: 'earth'
      }
    ];
    
    // Validate that each world has exactly 3 treasures
    this.worldCards.forEach((world, index) => {
      const treasureCount = world.layout.filter(pos => pos === 'treasure').length;
      if (treasureCount !== 3) {
        // Force exactly 3 treasures using predetermined safe positions
        const safePositions = [
          [0, 7, 16],   // World 1: corners/edges
          [2, 10, 18],  // World 2: spread out
          [4, 12, 15]   // World 3: different pattern
        ];
        
        // Reset layout and place treasures at safe positions
        const elements = ['fire', 'water', 'earth'];
        world.layout = Array(19).fill(null).map((_, i) => elements[i % 3]);
        
        // Shuffle elements
        for (let i = world.layout.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [world.layout[i], world.layout[j]] = [world.layout[j], world.layout[i]];
        }
        
        // Place treasures at safe positions
        const positions = safePositions[index] || [0, 9, 18];
        positions.forEach(pos => {
          if (pos < 19) world.layout[pos] = 'treasure';
        });
      }
    });
    
    // Final validation: count total treasures
    const totalTreasures = this.worldCards.reduce((sum, world) => 
      sum + world.layout.filter(pos => pos === 'treasure').length, 0
    );
    
    if (totalTreasures !== 9) {
      // Silent error correction - ensure exactly 9 treasures total
      this.worldCards.forEach((world, index) => {
        const elements = ['fire', 'water', 'earth'];
        world.layout = Array(19).fill(null).map((_, i) => elements[i % 3]);
        
        // Place treasures at predetermined positions
        const positions = [[0, 7, 16], [2, 10, 18], [4, 12, 15]][index];
        positions.forEach(pos => {
          if (pos < 19) world.layout[pos] = 'treasure';
        });
      });
    }
    
    // Event cards
    this.eventDeck = createEventDeck();
    this.currentEventCard = null;
    
    // Player shields for negating bad event cards
    this.playerShield = [false, false];
    
    // Game state tracking
    this.portalInteractions = [false, false, false]; // Track if player interacted with each portal this turn
    this.initialPortalStates = null; // Snapshot of portal states at start of action phase
    this.portalMoves = [null, null, null]; // Track the specific move made on each portal: { type: 'add'|'remove', hexIndex: number, stone: string }
    this.gameWon = false;
    this.gameLost = false;
  }
  
  generateWorldLayout(primaryElement = null) {
    // Generate purely random world layout - ignore primaryElement parameter
    const elements = ['fire', 'water', 'earth'];
    const worldLayout = [];
    
    // Create 19 positions with equal distribution of elements
    for (let i = 0; i < 19; i++) {
      worldLayout.push(elements[i % 3]);
    }
    
    // Shuffle the elements for random distribution
    for (let i = worldLayout.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [worldLayout[i], worldLayout[j]] = [worldLayout[j], worldLayout[i]];
    }
    
    // Now place exactly 3 treasures in random positions
    const treasurePositions = this.generateTreasurePositions();
    treasurePositions.forEach(pos => {
      worldLayout[pos] = 'treasure';
    });
    
    return worldLayout;
  }

  generateTreasurePositions() {
    // Generate exactly 3 treasure positions for each world (19 positions total)
    // Use a simple approach that guarantees 3 treasures without over-constraining
    const treasures = [];
    const allPositions = Array.from({length: 19}, (_, i) => i);
    
    // Shuffle all positions to get random selection
    for (let i = allPositions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allPositions[i], allPositions[j]] = [allPositions[j], allPositions[i]];
    }
    
    // Take the first 3 positions from shuffled array
    treasures.push(allPositions[0], allPositions[1], allPositions[2]);
    
    // Verify we have exactly 3 treasures
    if (treasures.length !== 3) {
      // Fallback: use positions that are guaranteed to be spread out
      return [0, 9, 18];
    }
    
    return treasures;
  }
    
  canPlaceStone(portalIndex, stoneElement) {
    return this.currentPhase === 'act' && 
           this.playerHands[this.currentPlayer].includes(stoneElement);
  }
  
  canRemoveStone(portalIndex) {
    return this.currentPhase === 'act' && 
           this.portalCards[portalIndex].stones.some(stone => stone !== null);
  }
  
  canTransferPattern(portalIndex, worldIndex) {
    const portal = this.portalCards[portalIndex];
    const stoneCount = portal.stones.filter(stone => stone !== null).length;
    return this.currentPhase === 'portal' && stoneCount >= 3;
  }
  
  checkGameWin() {
    const totalCapturedTreasures = this.worldCards.reduce((total, world) => 
      total + world.capturedTreasures.length, 0
    );
    return totalCapturedTreasures >= 9; // All 9 treasures captured
  }
  
  checkGameLoss() {
    // Game loss conditions can be added here
    // For example: if bag is empty and no valid moves
    const totalBagStones = this.bag.fire + this.bag.water + this.bag.earth;
    const totalHandStones = this.playerHands[0].length + this.playerHands[1].length;
    return totalBagStones === 0 && totalHandStones === 0 && !this.checkGameWin();
  }
}

// Utility functions
export function drawStones(bag, count = 3) {
  const availableElements = [];
  
  // Create array of available stones
  for (let element in bag) {
    for (let i = 0; i < bag[element]; i++) {
      availableElements.push(element);
    }
  }
  
  const drawnStones = [];
  for (let i = 0; i < count && availableElements.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * availableElements.length);
    const drawnElement = availableElements.splice(randomIndex, 1)[0];
    drawnStones.push(drawnElement);
    bag[drawnElement]--;
  }
  
  return drawnStones;
}

export function drawEventCard(state) {
  if (state.eventDeck.length === 0) {
    state.eventDeck = createEventDeck();
  }
  
  const randomIndex = Math.floor(Math.random() * state.eventDeck.length);
  state.currentEventCard = state.eventDeck.splice(randomIndex, 1)[0];
}

// Get adjacent positions for a hexagon in the 3,4,5,4,3 layout
function getAdjacentPositions(position) {
  // World layout (21 positions):   0  1  2     (3 hexes)
  //                              3  4  5  6    (4 hexes)
  //                            7  8  9 10 11   (5 hexes)
  //                             12 13 14 15    (4 hexes)
  //                              16 17 18      (3 hexes)
  
  const adjacencyMap = {
    0: [1, 3, 4],
    1: [0, 2, 4, 5],
    2: [1, 5, 6],
    3: [0, 4, 7, 8],
    4: [0, 1, 3, 5, 8, 9],
    5: [1, 2, 4, 6, 9, 10],
    6: [2, 5, 10, 11],
    7: [3, 8, 12],
    8: [3, 4, 7, 9, 12, 13],
    9: [4, 5, 8, 10, 13, 14],
    10: [5, 6, 9, 11, 14, 15],
    11: [6, 10, 15],
    12: [7, 8, 13, 16],
    13: [8, 9, 12, 14, 16, 17],
    14: [9, 10, 13, 15, 17, 18],
    15: [9, 10, 14, 18],
    16: [12, 13, 17],
    17: [13, 14, 16, 18],
    18: [14, 15, 17]
  };
  
  return adjacencyMap[position] || [];
}

export function checkTreasureCaptures(state) {
  let newCapturesFound = false;
  
  state.worldCards.forEach((world, worldIndex) => {
    // Find all treasure positions in the layout
    const treasurePositions = world.layout
      .map((element, index) => element === 'treasure' ? index : -1)
      .filter(index => index !== -1);
    
    treasurePositions.forEach(treasurePos => {
      // Skip if already captured
      if (world.capturedTreasures.includes(treasurePos)) return;
      
      // Check if treasure is surrounded by stones OR other treasures
      const adjacentPositions = getAdjacentPositions(treasurePos);
      const isSurrounded = adjacentPositions.every(adjPos => {
        // Position is considered "filled" if it has a stone OR is a treasure position
        const hasStone = world.stones[adjPos] !== null;
        const isTreasure = world.layout[adjPos] === 'treasure';
        return hasStone || isTreasure;
      });
      
      if (isSurrounded) {
        world.capturedTreasures.push(treasurePos);
        newCapturesFound = true;
      }
    });
  });
  
  return newCapturesFound;
}

export function checkGameWin(state) {
  const totalCapturedTreasures = state.worldCards.reduce((total, world) => 
    total + world.capturedTreasures.length, 0
  );
  return totalCapturedTreasures >= 9; // All 9 treasures captured
}

export function getTotalCapturedTreasures(state) {
  return state.worldCards.reduce((total, world) => 
    total + world.capturedTreasures.length, 0
  );
}

export function checkGameLoss(state) {
  // Game loss conditions can be added here
  // For example: if bag is empty and no valid moves
  const totalBagStones = state.bag.fire + state.bag.water + state.bag.earth;
  const totalHandStones = state.playerHands[0].length + state.playerHands[1].length;
  return totalBagStones === 0 && totalHandStones === 0 && !checkGameWin(state);
}

export function updatePortalInteractions(state) {
  if (!state.initialPortalStates) return;
  
  // Compare current portal states with initial states and track specific moves
  for (let i = 0; i < state.portalCards.length; i++) {
    const initialStones = state.initialPortalStates[i];
    const currentStones = state.portalCards[i].stones;
    
    // Find what changed
    let moveFound = null;
    for (let j = 0; j < initialStones.length; j++) {
      if (initialStones[j] !== currentStones[j]) {
        if (initialStones[j] === null && currentStones[j] !== null) {
          // Stone was added
          moveFound = { type: 'add', hexIndex: j, stone: currentStones[j] };
        } else if (initialStones[j] !== null && currentStones[j] === null) {
          // Stone was removed
          moveFound = { type: 'remove', hexIndex: j, stone: initialStones[j] };
        }
        break; // Only one move allowed per portal
      }
    }
    
    state.portalMoves[i] = moveFound;
    state.portalInteractions[i] = moveFound !== null;
  }
}

export function canMakeMove(state, portalIndex, moveType, hexIndex, stone) {
  const currentMove = state.portalMoves[portalIndex];
  
  // If no move has been made on this portal, any move is allowed
  if (!currentMove) return true;
  
  // If a move has been made, only allow undoing that exact move
  if (moveType === 'add' && currentMove.type === 'remove' && 
      currentMove.hexIndex === hexIndex && currentMove.stone === stone) {
    return true; // Undoing a removal by adding the same stone back
  }
  
  if (moveType === 'remove' && currentMove.type === 'add' && 
      currentMove.hexIndex === hexIndex && currentMove.stone === stone) {
    return true; // Undoing an addition by removing the same stone
  }
  
  return false; // Any other move is not allowed
}

export function snapshotPortalStates(state) {
  // Create a deep copy of current portal states
  state.initialPortalStates = state.portalCards.map(card => [...card.stones]);
  // Reset portal moves
  state.portalMoves = [null, null, null];
}

export function nextPhase(state) {
  const phases = ['draw', 'act', 'portal', 'pickup'];
  const currentIndex = phases.indexOf(state.currentPhase);
  
  if (currentIndex === phases.length - 1) {
    // End of turn
    state.currentPlayer = (state.currentPlayer + 1) % 2;
    state.turnCount++;
    state.currentPhase = 'draw';
    state.portalInteractions = [false, false, false];
    state.initialPortalStates = null; // Reset snapshot
    state.portalMoves = [null, null, null]; // Reset moves
  } else {
    state.currentPhase = phases[currentIndex + 1];
    
    // If entering action phase, snapshot the current portal states
    if (state.currentPhase === 'act') {
      snapshotPortalStates(state);
      state.portalInteractions = [false, false, false]; // Reset interactions
    }
  }
}
