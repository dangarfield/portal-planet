import { createSignal } from 'solid-js';

export function Rules() {
  const [isExpanded, setIsExpanded] = createSignal(false);

  return (
    <div class="rules-section">
      <button 
        class="rules-toggle"
        onClick={() => setIsExpanded(!isExpanded())}
      >
        📖 {isExpanded() ? 'Hide Rules' : 'Show Rules'}
      </button>
      
      {isExpanded() && (
        <div class="rules-content">
          <h2>🎯 Game Goal</h2>
          <p><strong>Capture all 9 treasure hexagons</strong> by surrounding them with stones on World Cards.</p>
          <p>Each World Card has 3 treasure hexagons (💎). Surround them to capture them!</p>

          <h2>💎 Treasure Capture Rules</h2>
          <div class="treasure-rules">
            <div class="rule-item">
              <strong>Surrounding:</strong> Place stones OR other treasures in ALL hexagons adjacent to a treasure
            </div>
            <div class="rule-item">
              <strong>Edge Treasures:</strong> Treasures on world edges need fewer surrounding positions
            </div>
            <div class="rule-item">
              <strong>Treasure Synergy:</strong> Treasures can help capture each other - adjacent treasures count as "filled"
            </div>
            <div class="rule-item">
              <strong>Victory:</strong> Capture all 9 treasures across all 3 worlds to win
            </div>
          </div>

          <h2>🎮 How to Play</h2>
          
          <div class="phase-section">
            <h3>1️⃣ Draw Phase</h3>
            <ul>
              <li>Click "Draw 3 Stones" to get stones in your hand</li>
              <li>Automatically moves to Action Phase</li>
            </ul>
          </div>

          <div class="phase-section">
            <h3>2️⃣ Action Phase</h3>
            <ul>
              <li><strong>Drag stones</strong> from your hand to Portal Cards</li>
              <li><strong>One move per portal:</strong> Either add OR remove a stone (can undo your move)</li>
              <li><strong>Must interact with all 3 portals</strong> to continue</li>
              <li>Click stones on portals to remove them back to hand</li>
            </ul>
          </div>

          <div class="phase-section">
            <h3>3️⃣ Portal Phase (Optional)</h3>
            <ul>
              <li><strong>Rotate portals:</strong> Click 🔄 Rotate to arrange stones</li>
              <li><strong>Transfer to worlds:</strong> Drag portals (3+ stones) onto World Cards</li>
              <li><strong>Pattern matching:</strong> Portal shape must fit exactly in world shape</li>
              <li>Colors and positions must match available world spaces</li>
              <li><strong>Strategic placement:</strong> Position stones to surround treasures</li>
            </ul>
          </div>

          <div class="phase-section">
            <h3>4️⃣ Pickup Phase</h3>
            <ul>
              <li>Draw and resolve an Event Card</li>
              <li>Return unused stones to the bag</li>
              <li>Check for newly captured treasures</li>
              <li>Next player's turn begins</li>
            </ul>
          </div>

          <h2>🎯 Key Rules</h2>
          <div class="key-rules">
            <div class="rule-item">
              <strong>Portal Transfers:</strong> Need minimum 3 stones to drag portal to world
            </div>
            <div class="rule-item">
              <strong>Exact Matching:</strong> Portal pattern must fit perfectly in world (same colors, same positions)
            </div>
            <div class="rule-item">
              <strong>One Action:</strong> Each portal allows one add OR one remove per turn
            </div>
            <div class="rule-item">
              <strong>Treasure Capture:</strong> Surround all adjacent hexagons to capture a treasure
            </div>
            <div class="rule-item">
              <strong>Win Condition:</strong> Capture all 9 treasures (3 per world)
            </div>
          </div>

          <h2>💡 Strategy Tips</h2>
          <ul class="tips">
            <li>Focus on treasures near world edges - they need fewer surrounding positions</li>
            <li>Use rotation to align portal patterns with treasure-surrounding positions</li>
            <li>Plan your portal moves to work toward treasure capture</li>
            <li>Coordinate with your teammate to efficiently surround treasures</li>
            <li>Look for treasure clusters - adjacent treasures help capture each other</li>
            <li>Treasures count as "filled" positions for capturing other treasures</li>
            <li>Event cards can help or hinder treasure capture - plan accordingly</li>
          </ul>

          <h2>📍 Treasure Examples</h2>
          <div class="examples">
            <div class="example-item">
              <strong>Center Treasure:</strong> Needs 6 surrounding positions filled (stones OR treasures)
            </div>
            <div class="example-item">
              <strong>Edge Treasure:</strong> Needs 4-5 surrounding positions filled (only existing adjacent positions)
            </div>
            <div class="example-item">
              <strong>Corner Treasure:</strong> Needs 3 surrounding positions filled (only 3 adjacent positions exist)
            </div>
            <div class="example-item">
              <strong>Treasure Clusters:</strong> Adjacent treasures help capture each other automatically
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
