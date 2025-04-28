// RuleBuilderTCO.ts - Triggers, Conditions, Outcomes definitions

// Trigger definitions
export const TRIGGERS = [
  {
    id: "poker_hand_played",
    label: "When a Poker Hand is Played",
    description: "Triggers when any poker hand is played and scored",
  },
  {
    id: "start_of_round",
    label: "At the Start of Round",
    description: "Triggers at the beginning of each round",
  },
  {
    id: "end_of_round",
    label: "At the End of Round",
    description: "Triggers at the end of each round",
  },
  {
    id: "card_discarded",
    label: "When a Card is Discarded",
    description: "Triggers whenever a card is discarded",
  },
];

// Condition types and their possible parameters
export const CONDITION_TYPES = [
  {
    id: "hand_type",
    label: "Hand Type",
    description: "Check the type of poker hand",
    params: [
      {
        id: "operator",
        type: "select",
        options: [
          { value: "equals", label: "equals" },
          { value: "not_equals", label: "not equals" },
        ],
      },
      {
        id: "value",
        type: "select",
        options: [
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
        ],
      },
    ],
  },
  {
    id: "card_rank",
    label: "Card Rank",
    description: "Check the rank of a card in the played hand",
    params: [
      {
        id: "operator",
        type: "select",
        options: [
          { value: "equals", label: "equals" },
          { value: "not_equals", label: "not equals" },
          { value: "greater_than", label: "greater than" },
          { value: "less_than", label: "less than" },
        ],
      },
      {
        id: "value",
        type: "select",
        options: [
          { value: "2", label: "2" },
          { value: "3", label: "3" },
          { value: "4", label: "4" },
          { value: "5", label: "5" },
          { value: "6", label: "6" },
          { value: "7", label: "7" },
          { value: "8", label: "8" },
          { value: "9", label: "9" },
          { value: "10", label: "10" },
          { value: "J", label: "Jack" },
          { value: "Q", label: "Queen" },
          { value: "K", label: "King" },
          { value: "A", label: "Ace" },
        ],
      },
    ],
  },
  {
    id: "card_suit",
    label: "Card Suit",
    description: "Check the suit of a card in the played hand",
    params: [
      {
        id: "operator",
        type: "select",
        options: [
          { value: "equals", label: "equals" },
          { value: "not_equals", label: "not equals" },
        ],
      },
      {
        id: "value",
        type: "select",
        options: [
          { value: "Spades", label: "Spades" },
          { value: "Hearts", label: "Hearts" },
          { value: "Diamonds", label: "Diamonds" },
          { value: "Clubs", label: "Clubs" },
        ],
      },
    ],
  },
  {
    id: "card_count",
    label: "Card Count",
    description: "Check the number of cards in the played hand",
    params: [
      {
        id: "operator",
        type: "select",
        options: [
          { value: "equals", label: "equals" },
          { value: "not_equals", label: "not equals" },
          { value: "greater_than", label: "greater than" },
          { value: "less_than", label: "less than" },
        ],
      },
      {
        id: "value",
        type: "number",
      },
    ],
  },
];

// Effect types and their possible parameters
export const EFFECT_TYPES = [
  {
    id: "add_chips",
    label: "Add Chips",
    description: "Add a flat amount of chips",
    params: [
      {
        id: "value",
        type: "number",
        label: "Amount",
      },
    ],
  },
  {
    id: "add_mult",
    label: "Add Mult",
    description: "Add a flat amount of mult",
    params: [
      {
        id: "value",
        type: "number",
        label: "Amount",
      },
    ],
  },
  {
    id: "apply_x_mult",
    label: "Apply xMult",
    description: "Multiply the score by this amount",
    params: [
      {
        id: "value",
        type: "number",
        label: "Multiplier",
        default: 1.5,
      },
    ],
  },
  {
    id: "add_money",
    label: "Add Money",
    description: "Add dollars",
    params: [
      {
        id: "value",
        type: "number",
        label: "Amount",
      },
    ],
  },
  {
    id: "level_up_hand",
    label: "Level Up Hand",
    description: "Increase the level of the played hand",
    params: [
      {
        id: "value",
        type: "number",
        label: "Levels",
        default: 1,
      },
    ],
  },
];

// Logical operator definitions for conditions
export const LOGICAL_OPERATORS = [
  { value: "and", label: "AND" },
  { value: "or", label: "OR" },
];

// Helper function to get a specific trigger, condition, or effect by ID
export function getTriggerById(id: string) {
  return TRIGGERS.find((trigger) => trigger.id === id);
}

export function getConditionTypeById(id: string) {
  return CONDITION_TYPES.find((conditionType) => conditionType.id === id);
}

export function getEffectTypeById(id: string) {
  return EFFECT_TYPES.find((effectType) => effectType.id === id);
}
