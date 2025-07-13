// Centralized Balatro game data and utilities

// Ranks
export const RANKS = [
  { value: "2", label: "2", id: 2 },
  { value: "3", label: "3", id: 3 },
  { value: "4", label: "4", id: 4 },
  { value: "5", label: "5", id: 5 },
  { value: "6", label: "6", id: 6 },
  { value: "7", label: "7", id: 7 },
  { value: "8", label: "8", id: 8 },
  { value: "9", label: "9", id: 9 },
  { value: "10", label: "10", id: 10 },
  { value: "J", label: "Jack", id: 11 },
  { value: "Q", label: "Queen", id: 12 },
  { value: "K", label: "King", id: 13 },
  { value: "A", label: "Ace", id: 14 },
] as const;

export const RANK_VALUES = RANKS.map((rank) => rank.value);
export const RANK_LABELS = RANKS.map((rank) => rank.label);

export const RANK_GROUPS = [
  { value: "face", label: "Face Card (J,Q,K)" },
  { value: "even", label: "Even Card (2,4,6,8,10)" },
  { value: "odd", label: "Odd Card (A,3,5,7,9)" },
] as const;

export const RANK_GROUP_VALUES = RANK_GROUPS.map((group) => group.value);

// Suits
export const SUITS = [
  { value: "Spades", label: "Spades" },
  { value: "Hearts", label: "Hearts" },
  { value: "Diamonds", label: "Diamonds" },
  { value: "Clubs", label: "Clubs" },
] as const;

export const SUIT_VALUES = SUITS.map((suit) => suit.value);
export const SUIT_LABELS = SUITS.map((suit) => suit.label);

export const SUIT_GROUPS = [
  { value: "red", label: "Red Suit (Hearts, Diamonds)" },
  { value: "black", label: "Black Suit (Spades, Clubs)" },
] as const;

export const SUIT_GROUP_VALUES = SUIT_GROUPS.map((group) => group.value);

// Rarities
export const RARITIES = [
  { value: "common", label: "Common" },
  { value: "uncommon", label: "Uncommon" },
  { value: "rare", label: "Rare" },
  { value: "epic", label: "Epic" },
  { value: "legendary", label: "Legendary" },
] as const;

export const RARITY_VALUES = RARITIES.map((rarity) => rarity.value);
export const RARITY_LABELS = RARITIES.map((rarity) => rarity.label);

// Poker Hands
export const POKER_HANDS = [
  { value: "High Card", label: "High Card" },
  { value: "Pair", label: "Pair" },
  { value: "Two Pair", label: "Two Pair" },
  { value: "Three of a Kind", label: "Three of a Kind" },
  { value: "Straight", label: "Straight" },
  { value: "Flush", label: "Flush" },
  { value: "Full House", label: "Full House" },
  { value: "Four of a Kind", label: "Four of a Kind" },
  { value: "Five of a Kind", label: "Five of a Kind" },
  { value: "Straight Flush", label: "Straight Flush" },
  { value: "Royal Flush", label: "Royal Flush" },
  { value: "Flush House", label: "Flush House" },
  { value: "Flush Five", label: "Flush Five" },
] as const;

export const POKER_HAND_VALUES = POKER_HANDS.map((hand) => hand.value);
export const POKER_HAND_LABELS = POKER_HANDS.map((hand) => hand.label);

// Enhancements
export const ENHANCEMENTS = [
  { key: "m_gold", value: "m_gold", label: "Gold" },
  { key: "m_steel", value: "m_steel", label: "Steel" },
  { key: "m_glass", value: "m_glass", label: "Glass" },
  { key: "m_wild", value: "m_wild", label: "Wild" },
  { key: "m_mult", value: "m_mult", label: "Mult" },
  { key: "m_lucky", value: "m_lucky", label: "Lucky" },
  { key: "m_stone", value: "m_stone", label: "Stone" },
  { key: "m_bonus", value: "m_bonus", label: "Bonus" },
] as const;

export const ENHANCEMENT_KEYS = ENHANCEMENTS.map(
  (enhancement) => enhancement.key
);
export const ENHANCEMENT_VALUES = ENHANCEMENTS.map(
  (enhancement) => enhancement.value
);
export const ENHANCEMENT_LABELS = ENHANCEMENTS.map(
  (enhancement) => enhancement.label
);

// Editions
export const EDITIONS = [
  { key: "e_foil", value: "e_foil", label: "Foil (+50 Chips)" },
  { key: "e_holo", value: "e_holo", label: "Holographic (+10 Mult)" },
  {
    key: "e_polychrome",
    value: "e_polychrome",
    label: "Polychrome (X1.5 Mult)",
  },
  { key: "e_negative", value: "e_negative", label: "Negative (+1 Joker slot)" },
] as const;

export const EDITION_KEYS = EDITIONS.map((edition) => edition.key);
export const EDITION_VALUES = EDITIONS.map((edition) => edition.value);
export const EDITION_LABELS = EDITIONS.map((edition) => edition.label);

// Seals
export const SEALS = [
  { key: "Gold", value: "Gold", label: "Gold Seal ($3 when played)" },
  { key: "Red", value: "Red", label: "Red Seal (Retrigger card)" },
  { key: "Blue", value: "Blue", label: "Blue Seal (Creates Planet card)" },
  {
    key: "Purple",
    value: "Purple",
    label: "Purple Seal (Creates Tarot when discarded)",
  },
] as const;

export const SEAL_KEYS = SEALS.map((seal) => seal.key);
export const SEAL_VALUES = SEALS.map((seal) => seal.value);
export const SEAL_LABELS = SEALS.map((seal) => seal.label);

// Tarot Cards
export const TAROT_CARDS = [
  { key: "c_fool", value: "c_fool", label: "The Fool" },
  { key: "c_magician", value: "c_magician", label: "The Magician" },
  {
    key: "c_high_priestess",
    value: "c_high_priestess",
    label: "The High Priestess",
  },
  { key: "c_empress", value: "c_empress", label: "The Empress" },
  { key: "c_emperor", value: "c_emperor", label: "The Emperor" },
  { key: "c_hierophant", value: "c_hierophant", label: "The Hierophant" },
  { key: "c_lovers", value: "c_lovers", label: "The Lovers" },
  { key: "c_chariot", value: "c_chariot", label: "The Chariot" },
  { key: "c_justice", value: "c_justice", label: "Justice" },
  { key: "c_hermit", value: "c_hermit", label: "The Hermit" },
  {
    key: "c_wheel_of_fortune",
    value: "c_wheel_of_fortune",
    label: "Wheel of Fortune",
  },
  { key: "c_strength", value: "c_strength", label: "Strength" },
  { key: "c_hanged_man", value: "c_hanged_man", label: "The Hanged Man" },
  { key: "c_death", value: "c_death", label: "Death" },
  { key: "c_temperance", value: "c_temperance", label: "Temperance" },
  { key: "c_devil", value: "c_devil", label: "The Devil" },
  { key: "c_tower", value: "c_tower", label: "The Tower" },
  { key: "c_star", value: "c_star", label: "The Star" },
  { key: "c_moon", value: "c_moon", label: "The Moon" },
  { key: "c_sun", value: "c_sun", label: "The Sun" },
  { key: "c_judgement", value: "c_judgement", label: "Judgement" },
  { key: "c_world", value: "c_world", label: "The World" },
] as const;

export const TAROT_CARD_KEYS = TAROT_CARDS.map((card) => card.key);
export const TAROT_CARD_VALUES = TAROT_CARDS.map((card) => card.value);
export const TAROT_CARD_LABELS = TAROT_CARDS.map((card) => card.label);

// Planet Cards
export const PLANET_CARDS = [
  { key: "c_pluto", value: "c_pluto", label: "Pluto" },
  { key: "c_mercury", value: "c_mercury", label: "Mercury" },
  { key: "c_uranus", value: "c_uranus", label: "Uranus" },
  { key: "c_venus", value: "c_venus", label: "Venus" },
  { key: "c_saturn", value: "c_saturn", label: "Saturn" },
  { key: "c_jupiter", value: "c_jupiter", label: "Jupiter" },
  { key: "c_earth", value: "c_earth", label: "Earth" },
  { key: "c_mars", value: "c_mars", label: "Mars" },
  { key: "c_neptune", value: "c_neptune", label: "Neptune" },
  { key: "c_planet_x", value: "c_planet_x", label: "Planet X" },
  { key: "c_ceres", value: "c_ceres", label: "Ceres" },
  { key: "c_eris", value: "c_eris", label: "Eris" },
] as const;

export const PLANET_CARD_KEYS = PLANET_CARDS.map((card) => card.key);
export const PLANET_CARD_VALUES = PLANET_CARDS.map((card) => card.value);
export const PLANET_CARD_LABELS = PLANET_CARDS.map((card) => card.label);

// Spectral Cards
export const SPECTRAL_CARDS = [
  { key: "c_familiar", value: "c_familiar", label: "Familiar" },
  { key: "c_grim", value: "c_grim", label: "Grim" },
  { key: "c_incantation", value: "c_incantation", label: "Incantation" },
  { key: "c_talisman", value: "c_talisman", label: "Talisman" },
  { key: "c_aura", value: "c_aura", label: "Aura" },
  { key: "c_wraith", value: "c_wraith", label: "Wraith" },
  { key: "c_sigil", value: "c_sigil", label: "Sigil" },
  { key: "c_ouija", value: "c_ouija", label: "Ouija" },
  { key: "c_ectoplasm", value: "c_ectoplasm", label: "Ectoplasm" },
  { key: "c_immolate", value: "c_immolate", label: "Immolate" },
  { key: "c_ankh", value: "c_ankh", label: "Ankh" },
  { key: "c_deja_vu", value: "c_deja_vu", label: "Deja Vu" },
  { key: "c_hex", value: "c_hex", label: "Hex" },
  { key: "c_trance", value: "c_trance", label: "Trance" },
  { key: "c_medium", value: "c_medium", label: "Medium" },
  { key: "c_cryptid", value: "c_cryptid", label: "Cryptid" },
  { key: "c_soul", value: "c_soul", label: "The Soul" },
  { key: "c_black_hole", value: "c_black_hole", label: "Black Hole" },
] as const;

export const SPECTRAL_CARD_KEYS = SPECTRAL_CARDS.map((card) => card.key);
export const SPECTRAL_CARD_VALUES = SPECTRAL_CARDS.map((card) => card.value);
export const SPECTRAL_CARD_LABELS = SPECTRAL_CARDS.map((card) => card.label);

// All Consumables Combined
export const ALL_CONSUMABLES = [
  ...TAROT_CARDS,
  ...PLANET_CARDS,
  ...SPECTRAL_CARDS,
] as const;

export const ALL_CONSUMABLE_KEYS = ALL_CONSUMABLES.map((card) => card.key);
export const ALL_CONSUMABLE_VALUES = ALL_CONSUMABLES.map((card) => card.value);
export const ALL_CONSUMABLE_LABELS = ALL_CONSUMABLES.map((card) => card.label);

// Blind Types
export const BLIND_TYPES = [
  { value: "small", label: "Small Blind" },
  { value: "big", label: "Big Blind" },
  { value: "boss", label: "Boss Blind" },
] as const;

export const BLIND_TYPE_VALUES = BLIND_TYPES.map((blind) => blind.value);
export const BLIND_TYPE_LABELS = BLIND_TYPES.map((blind) => blind.label);

// Tags
export const TAGS = [
  {
    value: "uncommon",
    label: "Uncommon Tag - Next shop has free Uncommon Joker",
  },
  { value: "rare", label: "Rare Tag - Next shop has free Rare Joker" },
  {
    value: "negative",
    label: "Negative Tag - Next base Joker becomes Negative (+1 slot) and free",
  },
  {
    value: "foil",
    label: "Foil Tag - Next base Joker becomes Foil (+50 Chips) and free",
  },
  {
    value: "holo",
    label: "Holographic Tag - Next base Joker becomes Holo (+10 Mult) and free",
  },
  {
    value: "polychrome",
    label:
      "Polychrome Tag - Next base Joker becomes Polychrome (X1.5 Mult) and free",
  },
  {
    value: "investment",
    label: "Investment Tag - Gain $25 after defeating next Boss Blind",
  },
  {
    value: "voucher",
    label: "Voucher Tag - Adds a Voucher to next shop",
  },
  { value: "boss", label: "Boss Tag - Re-rolls the next Boss Blind" },
  {
    value: "standard",
    label: "Standard Tag - Immediately open free Mega Standard Pack",
  },
  {
    value: "charm",
    label: "Charm Tag - Immediately open free Mega Arcana Pack",
  },
  {
    value: "meteor",
    label: "Meteor Tag - Immediately open free Mega Celestial Pack",
  },
  {
    value: "buffoon",
    label: "Buffoon Tag - Immediately open free Mega Buffoon Pack",
  },
  {
    value: "handy",
    label: "Handy Tag - Gain $1 for each hand played this run",
  },
  {
    value: "garbage",
    label: "Garbage Tag - Gain $1 for each unused discard this run",
  },
  {
    value: "ethereal",
    label: "Ethereal Tag - Immediately open free Spectral Pack",
  },
  {
    value: "coupon",
    label: "Coupon Tag - Next shop items are free ($0)",
  },
  {
    value: "double",
    label: "Double Tag - Gives copy of next Tag selected",
  },
  {
    value: "juggle",
    label: "Juggle Tag - +3 Hand Size for next round only",
  },
  { value: "d_six", label: "D6 Tag - Next shop rerolls start at $0" },
  {
    value: "top_up",
    label: "Top-up Tag - Create up to 2 Common Jokers",
  },
  {
    value: "speed",
    label: "Speed Tag - Gives $5 for each Blind skipped this run",
  },
  {
    value: "orbital",
    label: "Orbital Tag - Upgrades random Poker Hand by 3 levels",
  },
  {
    value: "economy",
    label: "Economy Tag - Doubles your money (max +$40)",
  },
] as const;

// Consumable Types
export const CONSUMABLE_TYPES = [
  { value: "any", label: "Any Consumable" },
  { value: "tarot", label: "Tarot Card" },
  { value: "planet", label: "Planet Card" },
  { value: "spectral", label: "Spectral Card" },
] as const;

export const CONSUMABLE_TYPE_VALUES = CONSUMABLE_TYPES.map(
  (type) => type.value
);
export const CONSUMABLE_TYPE_LABELS = CONSUMABLE_TYPES.map(
  (type) => type.label
);

// Comparison Operators
export const COMPARISON_OPERATORS = [
  { value: "equals", label: "equals" },
  { value: "not_equals", label: "not equals" },
  { value: "greater_than", label: "greater than" },
  { value: "less_than", label: "less than" },
  { value: "greater_equals", label: "greater than or equal to" },
  { value: "less_equals", label: "less than or equal to" },
] as const;

export const COMPARISON_OPERATOR_VALUES = COMPARISON_OPERATORS.map(
  (op) => op.value
);
export const COMPARISON_OPERATOR_LABELS = COMPARISON_OPERATORS.map(
  (op) => op.label
);

// Card Scope
export const CARD_SCOPES = [
  { value: "scoring", label: "Scoring cards only" },
  { value: "all_played", label: "All played cards" },
] as const;

export const CARD_SCOPE_VALUES = CARD_SCOPES.map((scope) => scope.value);
export const CARD_SCOPE_LABELS = CARD_SCOPES.map((scope) => scope.label);

// Utilities

// Convert a rank string to its numeric ID
export const getRankId = (rank: string): number => {
  const rankData = RANKS.find((r) => r.value === rank || r.label === rank);
  return rankData?.id ?? (rank === "Ace" ? 14 : parseInt(rank) || 14);
};

// Get rank data by value
export const getRankByValue = (value: string) => {
  return RANKS.find((rank) => rank.value === value);
};

// Get rank data by ID
export const getRankById = (id: number) => {
  return RANKS.find((rank) => rank.id === id);
};

// Get suit data by value
export const getSuitByValue = (value: string) => {
  return SUITS.find((suit) => suit.value === value);
};

// Get enhancement data by key
export const getEnhancementByKey = (key: string) => {
  return ENHANCEMENTS.find((enhancement) => enhancement.key === key);
};

// Get edition data by key
export const getEditionByKey = (key: string) => {
  return EDITIONS.find((edition) => edition.key === key);
};

// Get seal data by key
export const getSealByKey = (key: string) => {
  return SEALS.find((seal) => seal.key === key);
};

// Get tarot card data by key
export const getTarotCardByKey = (key: string) => {
  return TAROT_CARDS.find((card) => card.key === key);
};

// Get planet card data by key
export const getPlanetCardByKey = (key: string) => {
  return PLANET_CARDS.find((card) => card.key === key);
};

// Get spectral card data by key
export const getSpectralCardByKey = (key: string) => {
  return SPECTRAL_CARDS.find((card) => card.key === key);
};

// Get any consumable card data by key
export const getConsumableByKey = (key: string) => {
  return ALL_CONSUMABLES.find((card) => card.key === key);
};

// Check if a rank is a face card
export const isFaceCard = (rank: string): boolean => {
  return ["J", "Q", "K", "Jack", "Queen", "King"].includes(rank);
};

// Check if a rank is even
export const isEvenCard = (rank: string): boolean => {
  return ["2", "4", "6", "8", "10"].includes(rank);
};

// Check if a rank is odd
export const isOddCard = (rank: string): boolean => {
  return ["A", "3", "5", "7", "9", "Ace"].includes(rank);
};

// Check if a suit is red
export const isRedSuit = (suit: string): boolean => {
  return ["Hearts", "Diamonds"].includes(suit);
};

// Check if a suit is black
export const isBlackSuit = (suit: string): boolean => {
  return ["Spades", "Clubs"].includes(suit);
};

// Check if a card key is a tarot card
export const isTarotCard = (key: string): boolean => {
  return (TAROT_CARD_KEYS as readonly string[]).includes(key);
};

// Check if a card key is a planet card
export const isPlanetCard = (key: string): boolean => {
  return (PLANET_CARD_KEYS as readonly string[]).includes(key);
};

// Check if a card key is a spectral card
export const isSpectralCard = (key: string): boolean => {
  return (SPECTRAL_CARD_KEYS as readonly string[]).includes(key);
};

// Check if a card key is any consumable
export const isConsumableCard = (key: string): boolean => {
  return (ALL_CONSUMABLE_KEYS as readonly string[]).includes(key);
};
