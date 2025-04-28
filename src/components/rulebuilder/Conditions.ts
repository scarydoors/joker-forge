import { ConditionTypeDefinition } from "./types";

// Common comparison operators
const COMPARISON_OPERATORS = [
  { value: "equals", label: "equals" },
  { value: "not_equals", label: "not equals" },
  { value: "greater_than", label: "greater than" },
  { value: "less_than", label: "less than" },
  { value: "greater_equals", label: "greater than or equal to" },
  { value: "less_equals", label: "less than or equal to" },
];

// Card quantifier options (how many cards should match)
const CARD_QUANTIFIERS = [
  { value: "at_least_one", label: "At least one card" },
  { value: "all", label: "All cards" },
  { value: "none", label: "No cards" },
  { value: "exactly", label: "Exactly N cards" },
  { value: "at_least", label: "At least N cards" },
  { value: "at_most", label: "At most N cards" },
];

// Card ranks for selection
const CARD_RANKS = [
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
];

// Card rank groups
const CARD_RANK_GROUPS = [
  { value: "face", label: "Face Card (J,Q,K)" },
  { value: "even", label: "Even Card (2,4,6,8,10,Q)" },
  { value: "odd", label: "Odd Card (A,3,5,7,9,J,K)" },
];

// Card suits for selection
const CARD_SUITS = [
  { value: "Spades", label: "Spades" },
  { value: "Hearts", label: "Hearts" },
  { value: "Diamonds", label: "Diamonds" },
  { value: "Clubs", label: "Clubs" },
];

// Card suit groups
const CARD_SUIT_GROUPS = [
  { value: "red", label: "Red Suit (Hearts, Diamonds)" },
  { value: "black", label: "Black Suit (Spades, Clubs)" },
];

// Hand types for selection
const HAND_TYPES = [
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
];

// Enhancement types
const ENHANCEMENT_TYPES = [
  { value: "m_gold", label: "Gold" },
  { value: "m_steel", label: "Steel" },
  { value: "m_glass", label: "Glass" },
  { value: "m_wild", label: "Wild" },
  { value: "m_mult", label: "Mult" },
  { value: "m_lucky", label: "Lucky" },
];

// Seal types
const SEAL_TYPES = [
  { value: "s_standard", label: "Standard" },
  { value: "s_lucky", label: "Lucky" },
  { value: "s_mult", label: "Mult" },
  { value: "s_wild", label: "Wild" },
  { value: "s_glass", label: "Glass" },
  { value: "s_bonus", label: "Bonus" },
];

// Condition types and their possible parameters
export const CONDITION_TYPES: ConditionTypeDefinition[] = [
  {
    id: "hand_type",
    label: "Hand Type",
    description: "Check the type of poker hand",
    params: [
      {
        id: "operator",
        type: "select",
        label: "Operator",
        options: [
          { value: "equals", label: "equals" },
          { value: "not_equals", label: "not equals" },
        ],
      },
      {
        id: "value",
        type: "select",
        label: "Hand Type",
        options: HAND_TYPES,
      },
    ],
  },
  {
    id: "card_rank",
    label: "Card Rank",
    description: "Check the rank of cards in the played hand",
    params: [
      {
        id: "quantifier",
        type: "select",
        label: "Quantifier",
        options: CARD_QUANTIFIERS,
      },
      {
        id: "count",
        type: "number",
        label: "Count",
        default: 1,
        min: 1,
        showWhen: {
          parameter: "quantifier",
          values: ["exactly", "at_least", "at_most"],
        },
      },
      {
        id: "rank_type",
        type: "select",
        label: "Rank Type",
        options: [
          { value: "specific", label: "Specific Rank" },
          { value: "group", label: "Rank Group" },
        ],
      },
      {
        id: "specific_rank",
        type: "select",
        label: "Rank",
        options: CARD_RANKS,
        showWhen: {
          parameter: "rank_type",
          values: ["specific"],
        },
      },
      {
        id: "rank_group",
        type: "select",
        label: "Rank Group",
        options: CARD_RANK_GROUPS,
        showWhen: {
          parameter: "rank_type",
          values: ["group"],
        },
      },
    ],
  },
  {
    id: "card_suit",
    label: "Card Suit",
    description: "Check the suit of cards in the played hand",
    params: [
      {
        id: "quantifier",
        type: "select",
        label: "Quantifier",
        options: CARD_QUANTIFIERS,
      },
      {
        id: "count",
        type: "number",
        label: "Count",
        default: 1,
        min: 1,
        showWhen: {
          parameter: "quantifier",
          values: ["exactly", "at_least", "at_most"],
        },
      },
      {
        id: "suit_type",
        type: "select",
        label: "Suit Type",
        options: [
          { value: "specific", label: "Specific Suit" },
          { value: "group", label: "Suit Group" },
        ],
      },
      {
        id: "specific_suit",
        type: "select",
        label: "Suit",
        options: CARD_SUITS,
        showWhen: {
          parameter: "suit_type",
          values: ["specific"],
        },
      },
      {
        id: "suit_group",
        type: "select",
        label: "Suit Group",
        options: CARD_SUIT_GROUPS,
        showWhen: {
          parameter: "suit_type",
          values: ["group"],
        },
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
        label: "Operator",
        options: COMPARISON_OPERATORS,
      },
      {
        id: "value",
        type: "number",
        label: "Number of Cards",
        min: 1,
        max: 52,
        default: 5,
      },
    ],
  },
  {
    id: "unique_suits",
    label: "Unique Suits",
    description: "Check the number of different suits in the played hand",
    params: [
      {
        id: "operator",
        type: "select",
        label: "Operator",
        options: COMPARISON_OPERATORS,
      },
      {
        id: "value",
        type: "number",
        label: "Number of Different Suits",
        min: 1,
        max: 4,
        default: 1,
      },
    ],
  },
  {
    id: "unique_ranks",
    label: "Unique Ranks",
    description: "Check the number of different ranks in the played hand",
    params: [
      {
        id: "operator",
        type: "select",
        label: "Operator",
        options: COMPARISON_OPERATORS,
      },
      {
        id: "value",
        type: "number",
        label: "Number of Different Ranks",
        min: 1,
        max: 13,
        default: 1,
      },
    ],
  },
  {
    id: "enhanced_cards",
    label: "Enhanced Cards",
    description: "Check for cards with enhancements in the played hand",
    params: [
      {
        id: "quantifier",
        type: "select",
        label: "Quantifier",
        options: CARD_QUANTIFIERS,
      },
      {
        id: "count",
        type: "number",
        label: "Count",
        default: 1,
        min: 1,
        showWhen: {
          parameter: "quantifier",
          values: ["exactly", "at_least", "at_most"],
        },
      },
      {
        id: "enhancement",
        type: "select",
        label: "Enhancement Type",
        options: [
          { value: "any", label: "Any Enhancement" },
          ...ENHANCEMENT_TYPES,
        ],
      },
    ],
  },
  {
    id: "sealed_cards",
    label: "Sealed Cards",
    description: "Check for cards with seals in the played hand",
    params: [
      {
        id: "quantifier",
        type: "select",
        label: "Quantifier",
        options: CARD_QUANTIFIERS,
      },
      {
        id: "count",
        type: "number",
        label: "Count",
        default: 1,
        min: 1,
        showWhen: {
          parameter: "quantifier",
          values: ["exactly", "at_least", "at_most"],
        },
      },
      {
        id: "seal",
        type: "select",
        label: "Seal Type",
        options: [{ value: "any", label: "Any Seal" }, ...SEAL_TYPES],
      },
    ],
  },
  {
    id: "player_money",
    label: "Player Money",
    description: "Check how much money the player has",
    params: [
      {
        id: "operator",
        type: "select",
        label: "Operator",
        options: COMPARISON_OPERATORS,
      },
      {
        id: "value",
        type: "number",
        label: "Amount ($)",
        min: 0,
        default: 10,
      },
    ],
  },
  {
    id: "remaining_hands",
    label: "Remaining Hands",
    description: "Check how many hands the player has left",
    params: [
      {
        id: "operator",
        type: "select",
        label: "Operator",
        options: COMPARISON_OPERATORS,
      },
      {
        id: "value",
        type: "number",
        label: "Number of Hands",
        min: 0,
        default: 1,
      },
    ],
  },
  {
    id: "remaining_discards",
    label: "Remaining Discards",
    description: "Check how many discards the player has left",
    params: [
      {
        id: "operator",
        type: "select",
        label: "Operator",
        options: COMPARISON_OPERATORS,
      },
      {
        id: "value",
        type: "number",
        label: "Number of Discards",
        min: 0,
        default: 1,
      },
    ],
  },
  {
    id: "joker_count",
    label: "Joker Count",
    description: "Check how many jokers the player has",
    params: [
      {
        id: "operator",
        type: "select",
        label: "Operator",
        options: COMPARISON_OPERATORS,
      },
      {
        id: "value",
        type: "number",
        label: "Number of Jokers",
        min: 0,
        default: 1,
      },
    ],
  },
  {
    id: "random_chance",
    label: "Random Chance",
    description: "Random probability check",
    params: [
      {
        id: "numerator",
        type: "number",
        label: "Numerator",
        min: 1,
        default: 1,
      },
      {
        id: "denominator",
        type: "number",
        label: "Denominator",
        min: 2,
        default: 4,
      },
    ],
  },
  {
    id: "internal_counter",
    label: "Internal Counter",
    description: "Check the value of a joker's internal counter",
    params: [
      {
        id: "counter_name",
        type: "select",
        label: "Counter",
        options: [
          { value: "counter", label: "Main Counter" },
          { value: "chips_counter", label: "Chips Counter" },
          { value: "mult_counter", label: "Mult Counter" },
          { value: "xmult_counter", label: "xMult Counter" },
        ],
      },
      {
        id: "operator",
        type: "select",
        label: "Operator",
        options: COMPARISON_OPERATORS,
      },
      {
        id: "value",
        type: "number",
        label: "Value",
        default: 1,
      },
    ],
  },
  {
    id: "blind_type",
    label: "Blind Type",
    description: "Check the type of the current blind",
    params: [
      {
        id: "blind_type",
        type: "select",
        label: "Blind Type",
        options: [
          { value: "small", label: "Small Blind" },
          { value: "big", label: "Big Blind" },
          { value: "boss", label: "Boss Blind" },
        ],
      },
    ],
  },
  {
    id: "ante_level",
    label: "Ante Level",
    description: "Check the current ante level",
    params: [
      {
        id: "operator",
        type: "select",
        label: "Operator",
        options: COMPARISON_OPERATORS,
      },
      {
        id: "value",
        type: "number",
        label: "Ante Level",
        min: 1,
        default: 1,
      },
    ],
  },
];

// Helper function to get a specific condition type by ID
export function getConditionTypeById(
  id: string
): ConditionTypeDefinition | undefined {
  return CONDITION_TYPES.find((conditionType) => conditionType.id === id);
}
