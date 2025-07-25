# Portal Game Assets

This directory contains SVG assets for the Portal board game.

## Hexagon Elements

### `fire-hexagon.svg`
- **Colors**: Orange/red gradient (#ff6b35 to #c1272d)
- **Symbol**: Flame with yellow/white highlights
- **Effect**: Glowing fire effect with radial gradient

### `water-hexagon.svg`
- **Colors**: Blue gradient (#4fc3f7 to #0277bd)
- **Symbol**: Water droplet with wave patterns
- **Effect**: Cool blue tones with flowing wave elements

### `earth-hexagon.svg`
- **Colors**: Green gradient (#8bc34a to #33691e)
- **Symbol**: Mountain/crystal formation with gems
- **Effect**: Natural earth tones with crystalline elements

### `treasure-hexagon.svg`
- **Colors**: Gold gradient (#ffd700 to #f57f17)
- **Symbol**: Multi-faceted diamond/gem
- **Effect**: Animated sparkles and subtle rotation
- **Special**: Animated elements for treasure emphasis

### `empty-hexagon.svg`
- **Colors**: Gray gradient (#424242 to #212121)
- **Symbol**: Dashed border pattern
- **Effect**: Subtle, muted appearance for empty slots

## Backgrounds

### `portal-background.svg`
- **Size**: 300x200px
- **Theme**: Mystical portal energy
- **Colors**: Dark blue/purple tones
- **Effects**: Animated energy rings and floating particles
- **Use**: Background for portal cards

### `world-background.svg`
- **Size**: 400x300px
- **Theme**: Ancient world/realm
- **Colors**: Green nature tones
- **Effects**: Floating energy orbs and runic symbols
- **Use**: Background for world cards

## Usage in Game

These assets can be used as:
1. **CSS backgrounds** for hexagon elements
2. **Overlay images** on game cards
3. **UI decoration** elements
4. **Visual enhancement** for game atmosphere

## Implementation

To use these assets in the game:

```css
.hexagon.fire {
  background-image: url('./assets/fire-hexagon.svg');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.portal-card {
  background-image: url('./assets/portal-background.svg');
  background-size: cover;
}

.world-card {
  background-image: url('./assets/world-background.svg');
  background-size: cover;
}
```

## Asset Features

- **Scalable**: All SVG format for crisp rendering at any size
- **Animated**: Treasure and background elements include subtle animations
- **Themed**: Each element has distinct visual identity
- **Optimized**: Clean code with reusable gradients and effects
- **Accessible**: High contrast and clear visual distinctions
