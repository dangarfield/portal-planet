# Portal Planet

My son had an idea of the a board game, this was a quick way of validating and then craeting the assets

## How to Play

**Goal:**
- The portal thief has stolen 9 treasures and hidden them across the portal realm, we must cooperate together and capture them back!

**Key Mechanism:**
- Capture a treasure on a planet by surrounding it with the corresponding element stones
- Procure stones on your portals and transfer them onto the planets if the pattern matches to capture the treasures
- TODO - visually show a match

**Inventory:**
- 3 planet boards
- 3 portal boards
- 9 treasure hex tiles
- 20 hex tiles of each type (fire, water, earth)
- 9 treasure gems
- 30 element stones of each element (fire, water, earth)
- 24 portal thief action cards

**Setup:**
- On a table place the 3 portal boards between the 3 planet boards
- Shuffle the hex tiles and randomly populate the planet boards, ensuring there are 3 treasure tiles on each planet
- Place a treasure gem on each treasure tile
- Shuffle the portal thief action cards and place on the table
- Place the 60 element stones in a bag

**Turn Phases:**
1. **Procure** - Draw 3 element stones from the bag. For each portal, you must either place a stone or remove a stone. You must interact with each portal (either by taking a stone or adding a stone)
2. **Portal** - If a portal has at least 3 stones on, it can be activated and the stones are transfered to any planet, if not, skip this phase. The stones must align in shape and position to an empty space on any planet. You can rotate the portal. You can ignore blank spaces on both the portal and the planet. You cannot place a stone on top of a treasure or if there is already a stone in place. A treasure is captured once it is surrounded either by a stone, another treasure of the edge of the planet
3. **Pickup** - Pickup a portal thief action card and do what it says. Once you have 6 or more treasures, you have to pickup 2 portal thief action cards each turn


**Notes:**

| Correct Portal Placement | Incorrect Portal Placement |
| :---: | :---: |
| ![](assets/portal-world-correct.svg) | ![](assets/portal-world-incorrect.svg) |


| Correct Treasure Capture | Incorrect Treasure Capture |
| :---: | :---: |
| ![](assets/treasure-capture-correct.svg) | ![](assets/treasure-capture-incorrect.svg) |


## Running locally

- `npm run dev`
