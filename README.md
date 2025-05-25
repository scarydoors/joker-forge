# Joker Forge

A web app that allows you to make Balatro Jokers using Steammodded with ease.

## Implementation Status Checklist

### Triggers

#### Fully Implemented
- [x] **Hand Played** - When a hand is played (default trigger)
- [x] **Card Scored** - When an individual card is scored
- [x] **Blind Selected** - When a blind is selected
- [x] **Blind Skipped** - When a blind is skipped  
- [x] **Boss Defeated** - When a boss blind is defeated
- [x] **Booster Opened** - When a booster pack is opened
- [x] **Booster Skipped** - When a booster pack is skipped
- [x] **Consumable Used** - When a consumable is used
- [x] **Hand Drawn** - When a hand is drawn
- [x] **First Hand Drawn** - When the first hand is drawn
- [x] **Shop Exited** - When exiting the shop
- [x] **Card Discarded** - When a card is discarded
- [x] **Passive** - Always active during scoring

#### ❌ Not Implemented Yet
- [ ] **Card Destroyed** - When a card is destroyed
- [ ] **Round End** - At the end of a round
- [ ] **Ante Start** - At the start of an ante
- [ ] **Shop Entered** - When entering the shop
- [ ] **Card Bought** - When a card is purchased
- [ ] **Card Sold** - When a card is sold

---

### Conditions

#### Fully Implemented
- [x] **Hand Type** - Check poker hand type (Flush, Straight, etc.)
- [x] **Card Count** - Check number of cards in hand
- [x] **Suit Count** - Check cards of specific suits
- [x] **Rank Count** - Check cards of specific ranks  
- [x] **Card Rank** - Check individual card rank (for card_scored trigger)
- [x] **Card Suit** - Check individual card suit (for card_scored trigger)
- [x] **Card Enhancement** - Check for card enhancements (Gold, Steel, etc.)
- [x] **Card Seal** - Check for card seals (Gold, Red, Blue, Purple)
- [x] **Player Money** - Check player's current money
- [x] **Remaining Hands** - Check hands left in round
- [x] **Remaining Discards** - Check discards left in round
- [x] **Joker Count** - Check number of jokers owned
- [x] **Blind Type** - Check current blind type (Small, Big, Boss)

#### Not Implemented Yet
- [ ] **Random Chance** - Probability-based conditions
- [ ] **Internal Counter** - Check joker's internal counters
- [ ] **Ante Level** - Check current ante level
- [ ] **Hand Size** - Check current hand size
- [ ] **Deck Size** - Check remaining deck size
- [ ] **Consumable Count** - Check number of consumables owned
- [ ] **Score Threshold** - Check if score meets requirement

---

### Effects

#### Fully Implemented  
- [x] **Add Chips** - Add flat chips to score
- [x] **Add Mult** - Add flat mult to score
- [x] **Apply X Mult** - Multiply score by value
- [x] **Add Dollars** - Give money to player
- [x] **Retrigger Cards** - Retrigger scored cards (card_scored trigger only)

#### Not Implemented Yet
- [ ] **Level Up Hand** - Increase poker hand level
- [ ] **Add Discard** - Give extra discards
- [ ] **Add Hand** - Give extra hands
- [ ] **Modify Internal State** - Change joker's internal values
- [ ] **Random Chance Effect** - Probability-based effects
- [ ] **Destroy Self** - Destroy the joker
- [ ] **Add Card** - Add new playing cards to deck/hand
- [ ] **Edit Card** - Modify card properties (rank, suit, enhancement, seal)
- [ ] **Modify Game Rules** - Change fundamental game mechanics
- [ ] **Skip Blind** - Automatically skip current blind
- [ ] **Reroll Shop** - Force shop reroll

---

### Code Generation Features

#### Implemented
- [x] **Condition Function Generation** - Creates helper functions for conditions
- [x] **Effect Chaining** - Multiple effects in one rule using `extra` field
- [x] **Context-Aware Generation** - Different code for different triggers
- [x] **Parameter Validation** - Handles conditional parameter visibility
- [x] **Lua Code Output** - Generates proper SMODS-compatible Lua
- [x] **Atlas Generation** - Creates sprite atlases from uploaded images
- [x] **Mod Packaging** - Complete mod folder structure with JSON metadata

#### Not Implemented Yet
- [ ] **Blueprint Compatibility Logic** - Actual blueprint behavior code
- [ ] **Unlock Condition Generation** - Custom unlock requirements
- [ ] **Sticker Compatibility** - Perishable, Rental, etc.
- [ ] **Advanced Lua Functions** - Complex game state modifications
- [ ] **Localization Support** - Multiple language support

---

### UI Features

#### Implemented
- [x] **Rule Builder Modal** - Visual rule creation interface
- [x] **Condition Groups** - AND/OR logic between condition groups
- [x] **Parameter Fields** - Dynamic form fields based on condition/effect type
- [x] **Trigger Filtering** - Only show applicable conditions/effects for selected trigger
- [x] **Rule Description** - Human-readable rule summaries
- [x] **Joker Card Preview** - Visual joker card with hover tooltips
- [x] **Image Upload** - Custom joker sprite upload with validation
- [x] **Export System** - Generate and download complete mod packages

#### Not Implemented Yet
- [ ] **Dynamic Code Display** - Live preview of generated Lua code in rule builder
- [ ] **Advanced Validation** - Comprehensive rule validation and error checking
- [ ] **Undo/Redo System** - History management for rule editing
- [ ] **Rule Templates** - Pre-made rule templates for common effects
- [ ] **Import System** - Import existing jokers/rules from files
- [ ] **Mobile Responsiveness** - Touch-friendly interface for mobile devices
- [ ] **Help System** - Integrated tooltips and documentation

---

**Overall Implementation Status: ~50% Complete**

The core functionality for basic joker creation is solid, but many advanced features and effect types still need implementation.

# Usage

Go to [the website](https://jokerforge.jaydchw.com/) to start creating jokers

### Running Locally

1. **Prerequisites**
   - Node.js (v16 or higher)
   - npm

2. **Setup**
   ```bash
   # Clone the repository
   git clone https://github.com/Jayd-H/joker-forge.git
   cd joker-forge

   # Install dependencies
   npm install

   # Start the development server
   npm run dev
   ```

# Acknowledgements

Icons from Heroicons, favicon from SVGRepo (this should be temporary).

Thank you balatro modding discord server for answering benign questions.
