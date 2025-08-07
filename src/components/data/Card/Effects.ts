import { EffectTypeDefinition } from "../../ruleBuilder/types";
import {
  SparklesIcon,
  BanknotesIcon,
  ChartBarIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { CategoryDefinition } from "../Jokers/Triggers";
import { RARITIES, STICKERS, POKER_HANDS } from "../BalatroUtils";
import { GENERIC_TRIGGERS } from "./Triggers";

export const CARD_EFFECT_CATEGORIES: CategoryDefinition[] = [
  {
    label: "Scoring",
    icon: ChartBarIcon,
  },
  {
    label: "Economy",
    icon: BanknotesIcon,
  },
  {
    label: "Special",
    icon: SparklesIcon,
  },
  {
    label: "Jokers",
    icon: UserGroupIcon,
  },
];

export const CARD_EFFECT_TYPES: EffectTypeDefinition[] = [
  {
    id: "add_mult",
    label: "Add Mult",
    description: "Add mult to the current scoring calculation",
    applicableTriggers: GENERIC_TRIGGERS,
    params: [
      {
        id: "value",
        type: "number",
        label: "Amount",
        default: 4,
        min: 1,
      },
    ],
    category: "Scoring",
  },
  {
    id: "add_chips",
    label: "Add Chips",
    description: "Add chips to the current scoring calculation",
    applicableTriggers: GENERIC_TRIGGERS,
    params: [
      {
        id: "value",
        type: "number",
        label: "Amount",
        default: 30,
        min: 1,
      },
    ],
    category: "Scoring",
  },
  {
    id: "add_x_mult",
    label: "Apply XMult",
    description: "Multiply mult by the specified amount",
    applicableTriggers: GENERIC_TRIGGERS,
    params: [
      {
        id: "value",
        type: "number",
        label: "Multiplier",
        default: 1.5,
        min: 1,
      },
    ],
    category: "Scoring",
  },
  {
    id: "add_x_chips",
    label: "Apply XChips",
    description: "Multiply chips by the specified amount",
    applicableTriggers: GENERIC_TRIGGERS,
    params: [
      {
        id: "value",
        type: "number",
        label: "Multiplier",
        default: 2,
        min: 1,
      },
    ],
    category: "Scoring",
  },
  {
    id: "edit_dollars",
    label: "Edit Dollars",
    description: "Modify the player's money",
    applicableTriggers: GENERIC_TRIGGERS,
    params: [
      {
        id: "operation",
        type: "select",
        label: "Operation",
        options: [
          { value: "add", label: "Add" },
          { value: "subtract", label: "Subtract" },
          { value: "set", label: "Set To" },
        ],
        default: "add",
      },
      {
        id: "value",
        type: "number",
        label: "Dollar Amount",
        default: 1,
        min: 1,
      },
    ],
    category: "Economy",
  },
  {
    id: "destroy_card",
    label: "Destroy Card",
    description: "Destroy this card",
    applicableTriggers: GENERIC_TRIGGERS,
    params: [
      {
        id: "setGlassTrigger",
        type: "select",
        label: "Should Jokers like Glass Joker Trigger?",
        options: [
          { value: "true", label: "Yes" },
          { value: "false", label: "No" },
        ],
        default: "false",
      },
    ],
    category: "Special",
  },
  {
    id: "retrigger_card",
    label: "Retrigger Card",
    description: "Trigger this card's effect additional times",
    applicableTriggers: ["card_scored", "card_held"],
    params: [
      {
        id: "retriggers",
        type: "number",
        label: "Number of Retriggers",
        default: 1,
        min: 1,
      },
    ],
    category: "Scoring",
  },
  {
    id: "create_joker",
    label: "Create Joker",
    description: "Create a random or specific joker card",
    applicableTriggers: GENERIC_TRIGGERS,
    params: [
      {
        id: "joker_type",
        type: "select",
        label: "Joker Type",
        options: [
          { value: "random", label: "Random Joker" },
          { value: "specific", label: "Specific Joker" },
        ],
        default: "random",
      },
      {
        id: "rarity",
        type: "select",
        label: "Rarity",
        options: () => [
          { value: "random", label: "Any Rarity" },
          ...RARITIES(),
        ],
        default: "random",
        showWhen: {
          parameter: "joker_type",
          values: ["random"],
        },
      },
      {
        id: "joker_key",
        type: "text",
        label: "Joker Key (e.g., j_joker, j_greedy_joker)",
        default: "j_joker",
        showWhen: {
          parameter: "joker_type",
          values: ["specific"],
        },
      },
      {
        id: "edition",
        type: "select",
        label: "Edition",
        options: [
          { value: "none", label: "No Edition" },
          { value: "e_foil", label: "Foil" },
          { value: "e_holo", label: "Holographic" },
          { value: "e_polychrome", label: "Polychrome" },
          { value: "e_negative", label: "Negative" },
        ],
        default: "none",
      },
      {
        id: "sticker",
        type: "select",
        label: "Sticker",
        options: [{ value: "none", label: "No Sticker" }, ...STICKERS],
        default: "none",
      },
      {
        id: "ignore_slots",
        type: "select",
        label: "___ Joker Slots",
        options: [
          { value: "respect", label: "Respect" },
          { value: "ignore", label: "Ignore" },
        ],
        default: "respect",
      },
    ],
    category: "Jokers",
  },
  {
    id: "destroy_joker",
    label: "Destroy Joker",
    description: "Destroy an existing joker",
    applicableTriggers: GENERIC_TRIGGERS,
    params: [
      {
        id: "selection_method",
        type: "select",
        label: "Selection Method",
        options: [
          { value: "random", label: "Random Joker" },
          { value: "specific", label: "Specific Joker" },
          { value: "position", label: "By Position" },
        ],
        default: "random",
      },
      {
        id: "joker_key",
        type: "text",
        label: "Joker Key (e.g., j_joker, j_greedy_joker)",
        default: "j_joker",
        showWhen: {
          parameter: "selection_method",
          values: ["specific"],
        },
      },
      {
        id: "position",
        type: "select",
        label: "Position",
        options: [
          { value: "first", label: "First Joker" },
          { value: "last", label: "Last Joker" },
        ],
        default: "first",
        showWhen: {
          parameter: "selection_method",
          values: ["position"],
        },
      },
    ],
    category: "Jokers",
  },
  {
    id: "copy_joker",
    label: "Copy Joker",
    description: "Copy an existing joker",
    applicableTriggers: GENERIC_TRIGGERS,
    params: [
      {
        id: "selection_method",
        type: "select",
        label: "Selection Method",
        options: [
          { value: "random", label: "Random Joker" },
          { value: "specific", label: "Specific Joker" },
          { value: "position", label: "By Position" },
        ],
        default: "random",
      },
      {
        id: "joker_key",
        type: "text",
        label: "Joker Key (e.g., j_joker, j_greedy_joker)",
        default: "j_joker",
        showWhen: {
          parameter: "selection_method",
          values: ["specific"],
        },
      },
      {
        id: "position",
        type: "select",
        label: "Position",
        options: [
          { value: "first", label: "First Joker" },
          { value: "last", label: "Last Joker" },
        ],
        default: "first",
        showWhen: {
          parameter: "selection_method",
          values: ["position"],
        },
      },
      {
        id: "edition",
        type: "select",
        label: "Edition for Copy",
        options: [
          { value: "none", label: "No Edition" },
          { value: "e_foil", label: "Foil" },
          { value: "e_holo", label: "Holographic" },
          { value: "e_polychrome", label: "Polychrome" },
          { value: "e_negative", label: "Negative" },
        ],
        default: "none",
      },
    ],
    category: "Jokers",
  },
  {
    id: "level_up_hand",
    label: "Level Up Hand",
    description: "Increase the level of a poker hand",
    applicableTriggers: GENERIC_TRIGGERS,
    params: [
      {
        id: "hand_selection",
        type: "select",
        label: "Hand Selection",
        options: [
          { value: "current", label: "Current Hand (Scored)" },
          { value: "specific", label: "Specific Hand" },
          { value: "most", label: "Most Played" },
          { value: "least", label: "Least Played" },
          { value: "random", label: "Random Hand" },
        ],
        default: "current",
      },
      {
        id: "specific_hand",
        type: "select",
        label: "Specific Hand",
        options: [...POKER_HANDS],
        showWhen: {
          parameter: "hand_selection",
          values: ["specific"],
        },
      },
      {
        id: "value",
        type: "number",
        label: "Levels",
        default: 1,
        min: 1,
      },
    ],
    category: "Scoring",
  },
];

export function getCardEffectsForTrigger(
  triggerId: string
): EffectTypeDefinition[] {
  return CARD_EFFECT_TYPES.filter((effect) =>
    effect.applicableTriggers?.includes(triggerId)
  );
}

export function getCardEffectTypeById(
  id: string
): EffectTypeDefinition | undefined {
  return CARD_EFFECT_TYPES.find((effect) => effect.id === id);
}
