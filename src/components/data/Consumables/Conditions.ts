import { ConditionTypeDefinition } from "../../ruleBuilder/types";
import {
  RectangleStackIcon,
  UserIcon,
  ArchiveBoxIcon,
  InformationCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { CategoryDefinition } from "../Jokers/Triggers";

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
