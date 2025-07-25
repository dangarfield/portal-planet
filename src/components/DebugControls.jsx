import { createSignal } from 'solid-js';

export function DebugControls({ gameState, updateGameState }) {
  const [savedStates, setSavedStates] = createSignal([]);
  const [saveSlotName, setSaveSlotName] = createSignal('');
  const [isExpanded, setIsExpanded] = createSignal(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded());
  };

  const saveGameState = () => {
    const currentState = gameState();
    console.log('Saving current game state:', currentState);
    
    const timestamp = new Date().toLocaleString();
    const slotName = saveSlotName() || `Save ${timestamp}`;
    
    // Create a deep copy of the game state
    const savedState = JSON.parse(JSON.stringify(currentState));
    console.log('Deep copied state:', savedState);
    
    // Add to saved states
    const newSavedStates = [...savedStates(), { name: slotName, state: savedState, timestamp }];
    setSavedStates(newSavedStates);
    
    // Also save to localStorage for persistence
    localStorage.setItem('portalGameSaves', JSON.stringify(newSavedStates));
    
    // Clear the input
    setSaveSlotName('');
    
    console.log('Game state saved successfully:', slotName);
    console.log('Total saved states:', newSavedStates.length);
  };

  const loadGameState = (savedState) => {
    console.log('Loading game state:', savedState.name);
    console.log('Saved state data:', savedState.state);
    
    // Use the updateGameState function properly - it expects a function that modifies the state
    updateGameState((state) => {
      const loadedState = savedState.state;
      console.log('Applying loaded state:', loadedState);
      
      // Copy all properties from loaded state to current state
      Object.assign(state, loadedState);
      
      // Ensure arrays are properly copied
      state.playerHands = [
        [...loadedState.playerHands[0]], 
        [...loadedState.playerHands[1]]
      ];
      
      state.portalCards = loadedState.portalCards.map(card => ({
        ...card,
        stones: [...card.stones]
      }));
      
      state.worldCards = loadedState.worldCards.map(card => ({
        ...card,
        layout: [...card.layout],
        stones: [...card.stones],
        capturedTreasures: [...card.capturedTreasures]
      }));
      
      state.portalInteractions = [...loadedState.portalInteractions];
      state.eventDeck = [...loadedState.eventDeck];
      state.bag = { ...loadedState.bag };
    });
    
    console.log('Game state loaded successfully:', savedState.name);
  };

  const deleteSave = (index) => {
    const newSavedStates = savedStates().filter((_, i) => i !== index);
    setSavedStates(newSavedStates);
    localStorage.setItem('portalGameSaves', JSON.stringify(newSavedStates));
  };

  const exportState = () => {
    const stateJson = JSON.stringify(gameState(), null, 2);
    const blob = new Blob([stateJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portal-game-state-${new Date().toISOString().slice(0, 19)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importState = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedState = JSON.parse(e.target.result);
          updateGameState(() => importedState);
          console.log('Game state imported from file');
        } catch (error) {
          console.error('Error importing game state:', error);
          alert('Error importing game state. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Load saved states from localStorage on component mount
  const loadSavedStates = () => {
    try {
      const saved = localStorage.getItem('portalGameSaves');
      if (saved) {
        setSavedStates(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading saved states:', error);
    }
  };

  // Load on mount
  loadSavedStates();

  return (
    <div class="debug-controls">
      <div class="debug-header" onClick={toggleExpanded}>
        <h3>🔧 Debug Controls</h3>
        <span class="debug-toggle">{isExpanded() ? '▼' : '▶'}</span>
      </div>
      
      {isExpanded() && (
        <div class="debug-content">
          <div class="debug-section">
            <h4>Save/Load Game State</h4>
            
            <div class="save-controls">
              <input
                type="text"
                placeholder="Save slot name (optional)"
                value={saveSlotName()}
                onInput={(e) => setSaveSlotName(e.target.value)}
                class="debug-input"
              />
              <button onClick={saveGameState} class="debug-button save-button">
                💾 Save State
              </button>
            </div>

            <div class="saved-states">
              {savedStates().length > 0 && (
                <div>
                  <h5>Saved States:</h5>
                  {savedStates().map((save, index) => (
                    <div class="saved-state-item" key={index}>
                      <span class="save-name">{save.name}</span>
                      <span class="save-timestamp">{save.timestamp}</span>
                      <button 
                        onClick={() => loadGameState(save)} 
                        class="debug-button load-button"
                      >
                        📂 Load
                      </button>
                      <button 
                        onClick={() => deleteSave(index)} 
                        class="debug-button delete-button"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div class="debug-section">
            <h4>Import/Export</h4>
            <div class="import-export-controls">
              <button onClick={exportState} class="debug-button export-button">
                📤 Export State to File
              </button>
              <label class="debug-button import-button">
                📥 Import State from File
                <input
                  type="file"
                  accept=".json"
                  onChange={importState}
                  style="display: none;"
                />
              </label>
            </div>
          </div>

          <div class="debug-section">
            <h4>Game Info</h4>
            <div class="game-info-debug">
              <div>Turn: {gameState().turnCount}</div>
              <div>Phase: {gameState().currentPhase}</div>
              <div>Player: {gameState().currentPlayer + 1}</div>
              <div>Bag Total: {gameState().bag.fire + gameState().bag.water + gameState().bag.earth}</div>
              <div>Total Treasures: {gameState().worldCards.reduce((sum, world) => sum + world.capturedTreasures.length, 0)}/9</div>
            </div>
          </div>

          <div class="debug-section">
            <h4>World States</h4>
            <div class="world-debug">
              {gameState().worldCards.map((world, index) => (
                <div class="world-debug-item" key={index}>
                  <h5>World {index + 1}</h5>
                  <div class="world-arrays">
                    <div><strong>Layout:</strong> [{world.layout.join(', ')}]</div>
                    <div><strong>Stones:</strong> [{world.stones.map(s => s || 'null').join(', ')}]</div>
                    <div><strong>Treasures:</strong> {world.layout.filter(el => el === 'treasure').length} positions</div>
                    <div><strong>Captured:</strong> [{world.capturedTreasures.join(', ')}]</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div class="debug-section">
            <h4>Portal States</h4>
            <div class="portal-debug">
              {gameState().portalCards.map((portal, index) => (
                <div class="portal-debug-item" key={index}>
                  <h5>Portal {index + 1}</h5>
                  <div><strong>Stones:</strong> [{portal.stones.map(s => s || 'null').join(', ')}]</div>
                  <div><strong>Stone Count:</strong> {portal.stones.filter(s => s !== null).length}/7</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
