import { ConditionTypeDefinition } from "../../ruleBuilder/types";
import {
  RectangleStackIcon,
  UserIcon,
  ArchiveBoxIcon,
  InformationCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { CategoryDefinition } from "../Jokers/Triggers";
import { VOUCHERS } from "../BalatroUtils";

export const CONSUMABLE_GENERIC_TRIGGERS: string[] = [
  "consumable_used",
  "card_selected",
  "hand_highlighted",
  "before_use",
  "after_use",
];

export const CONSUMABLE_CONDITION_CATEGORIES: CategoryDefinition[] = [
  {
    label: "Card Selection",
    icon: RectangleStackIcon,
  },
  {
    label: "Player State",
    icon: UserIcon,
  },
  {
    label: "Hand State",
    icon: ArchiveBoxIcon,
  },
  {
    label: "Game Context",
    icon: InformationCircleIcon,
  },
  {
    label: "Special",
    icon: SparklesIcon,
  },
];

export const CONSUMABLE_CONDITION_TYPES: ConditionTypeDefinition[] = [
  {
    id: "cards_selected",
    label: "Cards Selected",
    description: "Check how many cards are selected/highlighted",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "operator",
        type: "select",
        label: "Operator",
        options: [
          { value: "equals", label: "equals" },
          { value: "greater_than", label: "greater than" },
          { value: "less_than", label: "less than" },
          { value: "greater_equals", label: "greater than or equal" },
          { value: "less_equals", label: "less than or equal" },
        ],
        default: "equals",
      },
      {
        id: "value",
        type: "number",
        label: "Number of Cards",
        default: 1,
        min: 0,
      },
    ],
    category: "Card Selection",
  },
  {
    id: "player_money",
    label: "Player Money",
    description: "Check the player's current money",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "operator",
        type: "select",
        label: "Operator",
        options: [
          { value: "equals", label: "equals" },
          { value: "greater_than", label: "greater than" },
          { value: "less_than", label: "less than" },
          { value: "greater_equals", label: "greater than or equal" },
          { value: "less_equals", label: "less than or equal" },
        ],
        default: "greater_equals",
      },
      {
        id: "value",
        type: "number",
        label: "Dollar Amount",
        default: 5,
        min: 0,
      },
    ],
    category: "Player State",
  },
  {
    id: "ante_level",
    label: "Ante Level",
    description: "Check the current ante level",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "operator",
        type: "select",
        label: "Operator",
        options: [
          { value: "equals", label: "equals" },
          { value: "not_equals", label: "not equals" },
          { value: "greater_than", label: "greater than" },
          { value: "less_than", label: "less than" },
          { value: "greater_equals", label: "greater than or equal" },
          { value: "less_equals", label: "less than or equal" },
        ],
        default: "greater_equals",
      },
      {
        id: "value",
        type: "number",
        label: "Ante Level",
        default: 1,
        min: 1,
      },
    ],
    category: "Game Context",
  },
  {
    id: "voucher_redeemed",
    label: "Voucher Redeemed",
    description: "Check if a specific Voucher was redeemed during the run",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "voucher",
        type: "select",
        label: "Voucher",
        options: [...VOUCHERS()],
        default: "v_overstock_norm",
      },
    ],
    category: "Game Context",
  },
  {
    id: "hand_size",
    label: "Hand Size",
    description: "Check the current hand size",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "operator",
        type: "select",
        label: "Operator",
        options: [
          { value: "equals", label: "equals" },
          { value: "not_equals", label: "not equals" },
          { value: "greater_than", label: "greater than" },
          { value: "less_than", label: "less than" },
          { value: "greater_equals", label: "greater than or equal" },
          { value: "less_equals", label: "less than or equal" },
        ],
        default: "equals",
      },
      {
        id: "value",
        type: "number",
        label: "Hand Size",
        default: 8,
        min: 1,
      },
    ],
    category: "Player State",
  },
  {
    id: "remaining_hands",
    label: "Remaining Hands",
    description: "Check how many hands the player has left",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "operator",
        type: "select",
        label: "Operator",
        options: [
          { value: "equals", label: "equals" },
          { value: "not_equals", label: "not equals" },
          { value: "greater_than", label: "greater than" },
          { value: "less_than", label: "less than" },
          { value: "greater_equals", label: "greater than or equal" },
          { value: "less_equals", label: "less than or equal" },
        ],
        default: "equals",
      },
      {
        id: "value",
        type: "number",
        label: "Number of Hands",
        default: 1,
        min: 0,
      },
    ],
    category: "Player State",
  },
  {
    id: "in_blind",
    label: "In Blind",
    description: "Check if the player is currently in a blind (gameplay)",
    applicableTriggers: ["consumable_used"],
    params: [],
    category: "Game Context",
  },
];

export function getConsumableConditionsForTrigger(
  triggerId: string
): ConditionTypeDefinition[] {
  return CONSUMABLE_CONDITION_TYPES.filter((condition) =>
    condition.applicableTriggers?.includes(triggerId)
  );
}

export function getConsumableConditionTypeById(
  id: string
): ConditionTypeDefinition | undefined {
  return CONSUMABLE_CONDITION_TYPES.find((condition) => condition.id === id);
}
