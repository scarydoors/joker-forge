import { EffectTypeDefinition } from "./types";

// Effect types and their possible parameters
export const EFFECT_TYPES: EffectTypeDefinition[] = [
  {
    id: "add_chips",
    label: "Add Chips",
    description: "Add a flat amount of chips to the hand score",
    applicableTriggers: ["hand_played", "card_scored", "passive"],
    params: [
      {
        id: "value_source",
        type: "select",
        label: "Value Source",
        options: [
          { value: "fixed", label: "Fixed Value" },
          { value: "variable", label: "Internal Variable" },
        ],
        default: "fixed",
      },
      {
        id: "value",
        type: "number",
        label: "Amount",
        default: 10,
        min: 0,
        showWhen: {
          parameter: "value_source",
          values: ["fixed"],
        },
      },
      {
        id: "variable_name",
        type: "text",
        label: "Variable Name",
        default: "var1",
        showWhen: {
          parameter: "value_source",
          values: ["variable"],
        },
      },
    ],
  },
  {
    id: "add_mult",
    label: "Add Mult",
    description: "Add a flat amount of mult to the hand score",
    applicableTriggers: ["hand_played", "card_scored", "passive"],
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
    applicableTriggers: ["hand_played", "card_scored", "passive"],
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
    id: "add_dollars",
    label: "Add Dollars",
    description: "Add money directly to your balance",
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
    id: "retrigger_cards",
    label: "Retrigger",
    description:
      "Retrigger the scored card (only for 'When a Card is Scored' trigger)",
    applicableTriggers: ["card_scored"],
    params: [
      {
        id: "repetitions",
        type: "number",
        label: "Repetitions",
        default: 1,
        min: 1,
        max: 10,
      },
    ],
  },
  {
    id: "level_up_hand",
    label: "Level Up Hand",
    description: "Increase the level of the played hand",
    applicableTriggers: ["hand_played"],
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
    id: "edit_hand",
    label: "Edit Hands",
    description: "Modify the number of hands available",
    params: [
      {
        id: "operation",
        type: "select",
        label: "Operation",
        options: [
          { value: "add", label: "Add" },
          { value: "subtract", label: "Subtract" },
          { value: "set", label: "Set to" },
        ],
        default: "add",
      },
      {
        id: "value",
        type: "number",
        label: "Amount",
        default: 1,
        min: 0,
      },
    ],
  },
  {
    id: "edit_discard",
    label: "Edit Discards",
    description: "Modify the number of discards available",
    params: [
      {
        id: "operation",
        type: "select",
        label: "Operation",
        options: [
          { value: "add", label: "Add" },
          { value: "subtract", label: "Subtract" },
          { value: "set", label: "Set to" },
        ],
        default: "add",
      },
      {
        id: "value",
        type: "number",
        label: "Amount",
        default: 1,
        min: 0,
      },
    ],
  },
  {
    id: "modify_internal_variable",
    label: "Modify Internal Variable",
    description: "Change an internal variable value for this joker",
    params: [
      {
        id: "variable_name",
        type: "text",
        label: "Variable Name",
        default: "var1",
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
          { value: "reset", label: "Reset to 0" },
        ],
      },
      {
        id: "value",
        type: "number",
        label: "Value",
        default: 1,
        showWhen: {
          parameter: "operation",
          values: ["set", "increment", "decrement", "multiply", "divide"],
        },
      },
    ],
  },
  {
    id: "add_card_to_deck",
    label: "Add Card to Deck",
    description: "Create a new playing card and add it to your deck",
    params: [
      {
        id: "suit",
        type: "select",
        label: "Suit",
        options: [
          { value: "random", label: "Random" },
          { value: "Spades", label: "Spades" },
          { value: "Hearts", label: "Hearts" },
          { value: "Diamonds", label: "Diamonds" },
          { value: "Clubs", label: "Clubs" },
        ],
        default: "random",
      },
      {
        id: "rank",
        type: "select",
        label: "Rank",
        options: [
          { value: "random", label: "Random" },
          { value: "2", label: "2" },
          { value: "3", label: "3" },
          { value: "4", label: "4" },
          { value: "5", label: "5" },
          { value: "6", label: "6" },
          { value: "7", label: "7" },
          { value: "8", label: "8" },
          { value: "9", label: "9" },
          { value: "T", label: "10" },
          { value: "J", label: "Jack" },
          { value: "Q", label: "Queen" },
          { value: "K", label: "King" },
          { value: "A", label: "Ace" },
        ],
        default: "random",
      },
      {
        id: "enhancement",
        type: "select",
        label: "Enhancement",
        options: [
          { value: "none", label: "None" },
          { value: "random", label: "Random" },
          { value: "m_gold", label: "Gold" },
          { value: "m_steel", label: "Steel" },
          { value: "m_glass", label: "Glass" },
          { value: "m_wild", label: "Wild" },
          { value: "m_mult", label: "Mult" },
          { value: "m_lucky", label: "Lucky" },
          { value: "m_stone", label: "Stone" },
        ],
        default: "none",
      },
      {
        id: "seal",
        type: "select",
        label: "Seal",
        options: [
          { value: "none", label: "None" },
          { value: "random", label: "Random" },
          { value: "Gold", label: "Gold Seal" },
          { value: "Red", label: "Red Seal" },
          { value: "Blue", label: "Blue Seal" },
          { value: "Purple", label: "Purple Seal" },
        ],
        default: "none",
      },
      {
        id: "edition",
        type: "select",
        label: "Edition",
        options: [
          { value: "none", label: "None" },
          { value: "random", label: "Random" },
          { value: "e_foil", label: "Foil" },
          { value: "e_holo", label: "Holographic" },
          { value: "e_polychrome", label: "Polychrome" },
          { value: "e_negative", label: "Negative" },
        ],
        default: "none",
      },
    ],
  },
  {
    id: "copy_triggered_card",
    label: "Copy Triggered Card",
    description: "Copy the card that triggered this effect to your deck",
    applicableTriggers: ["card_scored", "card_discarded"],
    params: [],
  },
  {
    id: "copy_played_card",
    label: "Copy Played Card",
    description: "Copy a specific card from the played hand to your deck",
    applicableTriggers: ["hand_played"],
    params: [
      {
        id: "card_index",
        type: "select",
        label: "Position in Hand",
        options: [
          { value: "any", label: "Any Position" },
          { value: "1", label: "1st Card" },
          { value: "2", label: "2nd Card" },
          { value: "3", label: "3rd Card" },
          { value: "4", label: "4th Card" },
          { value: "5", label: "5th Card" },
        ],
        default: "any",
      },
      {
        id: "card_rank",
        type: "select",
        label: "Rank",
        options: [
          { value: "any", label: "Any Rank" },
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
        default: "any",
      },
      {
        id: "card_suit",
        type: "select",
        label: "Suit",
        options: [
          { value: "any", label: "Any Suit" },
          { value: "Spades", label: "Spades" },
          { value: "Hearts", label: "Hearts" },
          { value: "Diamonds", label: "Diamonds" },
          { value: "Clubs", label: "Clubs" },
        ],
        default: "any",
      },
    ],
  },
  {
    id: "delete_triggered_card",
    label: "Delete Triggered Card",
    description: "Delete the card that triggered this effect",
    applicableTriggers: ["card_scored", "card_discarded"],
    params: [],
  },
  {
    id: "edit_triggered_card",
    label: "Edit Triggered Card",
    description: "Modify the properties of the card that triggered this effect",
    applicableTriggers: ["card_scored", "card_discarded"],
    params: [
      {
        id: "new_rank",
        type: "select",
        label: "New Rank",
        options: [
          { value: "none", label: "Don't Change" },
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
        default: "none",
      },
      {
        id: "new_suit",
        type: "select",
        label: "New Suit",
        options: [
          { value: "none", label: "Don't Change" },
          { value: "Spades", label: "Spades" },
          { value: "Hearts", label: "Hearts" },
          { value: "Diamonds", label: "Diamonds" },
          { value: "Clubs", label: "Clubs" },
        ],
        default: "none",
      },
      {
        id: "new_enhancement",
        type: "select",
        label: "New Enhancement",
        options: [
          { value: "none", label: "Don't Change" },
          { value: "remove", label: "Remove Enhancement" },
          { value: "m_gold", label: "Gold" },
          { value: "m_steel", label: "Steel" },
          { value: "m_glass", label: "Glass" },
          { value: "m_wild", label: "Wild" },
          { value: "m_mult", label: "Mult" },
          { value: "m_lucky", label: "Lucky" },
          { value: "m_stone", label: "Stone" },
        ],
        default: "none",
      },
      {
        id: "new_seal",
        type: "select",
        label: "New Seal",
        options: [
          { value: "none", label: "Don't Change" },
          { value: "remove", label: "Remove Seal" },
          { value: "Gold", label: "Gold Seal" },
          { value: "Red", label: "Red Seal" },
          { value: "Blue", label: "Blue Seal" },
          { value: "Purple", label: "Purple Seal" },
        ],
        default: "none",
      },
      {
        id: "new_edition",
        type: "select",
        label: "New Edition",
        options: [
          { value: "none", label: "Don't Change" },
          { value: "remove", label: "Remove Edition" },
          { value: "e_foil", label: "Foil" },
          { value: "e_holo", label: "Holographic" },
          { value: "e_polychrome", label: "Polychrome" },
          { value: "e_negative", label: "Negative" },
        ],
        default: "none",
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
    applicableTriggers: ["hand_played", "blind_selected", "passive"],
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

// Helper function to get effects applicable to a specific trigger
export function getEffectsForTrigger(
  triggerId: string
): EffectTypeDefinition[] {
  return EFFECT_TYPES.filter(
    (effect) =>
      !effect.applicableTriggers ||
      effect.applicableTriggers.includes(triggerId)
  );
}
