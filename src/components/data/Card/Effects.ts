import { EffectTypeDefinition } from "../../ruleBuilder/types";
import {
  SparklesIcon,
  BanknotesIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { CategoryDefinition } from "../Jokers/Triggers";

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
];

export const CARD_EFFECT_TYPES: EffectTypeDefinition[] = [
  {
    id: "add_mult",
    label: "Add Mult",
    description: "Add mult to the current scoring calculation",
    applicableTriggers: ["card_scored", "card_held"],
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
    applicableTriggers: ["card_scored", "card_held"],
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
    applicableTriggers: ["card_scored", "card_held"],
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
    applicableTriggers: ["card_scored", "card_held"],
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
    applicableTriggers: ["card_scored", "card_held"],
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
    description: "Remove this card from play with a chance",
    applicableTriggers: ["card_scored", "card_held"],
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
