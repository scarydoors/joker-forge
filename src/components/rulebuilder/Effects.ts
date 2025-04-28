import { EffectTypeDefinition } from "./types";

// Effect types and their possible parameters
export const EFFECT_TYPES: EffectTypeDefinition[] = [
  {
    id: "add_chips",
    label: "Add Chips",
    description: "Add a flat amount of chips to the hand score",
    params: [
      {
        id: "value",
        type: "number",
        label: "Amount",
        default: 10,
        min: 0,
      },
    ],
  },
  {
    id: "add_mult",
    label: "Add Mult",
    description: "Add a flat amount of mult to the hand score",
    params: [
      {
        id: "value",
        type: "number",
        label: "Amount",
        default: 5,
        min: 0,
      },
    ],
  },
  {
    id: "apply_x_mult",
    label: "Apply xMult",
    description: "Multiply the score by this value",
    params: [
      {
        id: "value",
        type: "number",
        label: "Multiplier",
        default: 1.5,
        min: 0.1,
        max: 10,
      },
    ],
  },
  {
    id: "add_money",
    label: "Add Money",
    description: "Add dollars to the player's balance",
    params: [
      {
        id: "value",
        type: "number",
        label: "Amount",
        default: 3,
        min: 0,
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
        min: 1,
      },
    ],
  },
  {
    id: "add_discard",
    label: "Add Discard",
    description: "Add an extra discard to the current round",
    params: [
      {
        id: "value",
        type: "number",
        label: "Amount",
        default: 1,
        min: 1,
      },
    ],
  },
  {
    id: "add_hand",
    label: "Add Hand",
    description: "Add an extra hand to the current round",
    params: [
      {
        id: "value",
        type: "number",
        label: "Amount",
        default: 1,
        min: 1,
      },
    ],
  },
  {
    id: "retrigger_cards",
    label: "Retrigger Cards",
    description: "Play card effects again",
    params: [
      {
        id: "type",
        type: "select",
        label: "Card Type",
        options: [
          { value: "all", label: "All Cards" },
          { value: "specific_rank", label: "Cards of Specific Rank" },
          { value: "specific_suit", label: "Cards of Specific Suit" },
        ],
      },
      {
        id: "rank",
        type: "select",
        label: "Rank",
        showWhen: {
          parameter: "type",
          values: ["specific_rank"],
        },
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
      {
        id: "suit",
        type: "select",
        label: "Suit",
        showWhen: {
          parameter: "type",
          values: ["specific_suit"],
        },
        options: [
          { value: "Spades", label: "Spades" },
          { value: "Hearts", label: "Hearts" },
          { value: "Diamonds", label: "Diamonds" },
          { value: "Clubs", label: "Clubs" },
        ],
      },
      {
        id: "repetitions",
        type: "number",
        label: "Repetitions",
        default: 1,
        min: 1,
      },
    ],
  },
  {
    id: "modify_internal_state",
    label: "Modify Internal State",
    description: "Change an internal counter or value for this joker",
    params: [
      {
        id: "variable",
        type: "select",
        label: "Variable",
        options: [
          { value: "counter", label: "Counter" },
          { value: "chips_bonus", label: "Chips Bonus" },
          { value: "mult_bonus", label: "Mult Bonus" },
          { value: "xmult_bonus", label: "xMult Bonus" },
        ],
      },
      {
        id: "operation",
        type: "select",
        label: "Operation",
        options: [
          { value: "set", label: "Set to value" },
          { value: "increment", label: "Increment by value" },
          { value: "decrement", label: "Decrement by value" },
          { value: "multiply", label: "Multiply by value" },
          { value: "divide", label: "Divide by value" },
          { value: "reset", label: "Reset to initial value" },
        ],
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
    id: "random_chance",
    label: "Random Chance (Probability)",
    description: "Apply effect based on random chance",
    params: [
      {
        id: "numerator",
        type: "number",
        label: "Numerator",
        default: 1,
        min: 1,
      },
      {
        id: "denominator",
        type: "number",
        label: "Denominator",
        default: 3,
        min: 2,
      },
      {
        id: "effect_type",
        type: "select",
        label: "Effect if successful",
        options: [
          { value: "add_chips", label: "Add Chips" },
          { value: "add_mult", label: "Add Mult" },
          { value: "apply_x_mult", label: "Apply xMult" },
          { value: "add_money", label: "Add Money" },
          { value: "level_up_hand", label: "Level Up Hand" },
        ],
      },
      {
        id: "effect_value",
        type: "number",
        label: "Effect Value",
        default: 10,
        min: 0,
      },
    ],
  },
  {
    id: "destroy_self",
    label: "Destroy Self",
    description: "Destroy this joker",
    params: [],
  },
  {
    id: "modify_game_rules",
    label: "Modify Game Rules",
    description: "Change fundamental game rules",
    params: [
      {
        id: "rule_type",
        type: "select",
        label: "Rule Type",
        options: [
          { value: "hand_size", label: "Hand Size" },
          { value: "flush_requirement", label: "Flush Requirement" },
          { value: "straight_requirement", label: "Straight Requirement" },
          { value: "card_behavior", label: "Card Behavior" },
        ],
      },
      {
        id: "hand_size_value",
        type: "number",
        label: "New Hand Size",
        showWhen: {
          parameter: "rule_type",
          values: ["hand_size"],
        },
        default: 4,
        min: 1,
        max: 10,
      },
      {
        id: "flush_value",
        type: "number",
        label: "Cards for Flush",
        showWhen: {
          parameter: "rule_type",
          values: ["flush_requirement"],
        },
        default: 4,
        min: 3,
        max: 5,
      },
      {
        id: "straight_value",
        type: "number",
        label: "Cards for Straight",
        showWhen: {
          parameter: "rule_type",
          values: ["straight_requirement"],
        },
        default: 4,
        min: 3,
        max: 5,
      },
      {
        id: "card_behavior_type",
        type: "select",
        label: "Behavior",
        showWhen: {
          parameter: "rule_type",
          values: ["card_behavior"],
        },
        options: [
          { value: "all_face", label: "All Cards are Face Cards" },
          { value: "all_aces", label: "All Cards are Aces" },
          { value: "all_wild", label: "All Cards are Wild" },
        ],
      },
    ],
  },
];

// Helper function to get a specific effect type by ID
export function getEffectTypeById(
  id: string
): EffectTypeDefinition | undefined {
  return EFFECT_TYPES.find((effectType) => effectType.id === id);
}
