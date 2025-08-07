import { ConditionTypeDefinition } from "../../ruleBuilder/types";
import {
  UserIcon,
  InformationCircleIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";
import { CategoryDefinition } from "../Jokers/Triggers";
import {
  RANKS,
  RANK_GROUPS,
  SUITS,
  SUIT_GROUPS,
} from "../../data/BalatroUtils";

export const CARD_GENERIC_TRIGGERS: string[] = ["card_scored", "card_held"];

export const CARD_CONDITION_CATEGORIES: CategoryDefinition[] = [
  {
    label: "Player State",
    icon: UserIcon,
  },
  {
    label: "Game Context",
    icon: InformationCircleIcon,
  },
  {
    label: "Card",
    icon: IdentificationIcon,
  },
];

export const CARD_CONDITION_TYPES: ConditionTypeDefinition[] = [
  {
    id: "player_money",
    label: "Player Money",
    description: "Check the player's current money",
    applicableTriggers: ["card_scored", "card_held"],
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
    id: "card_rank",
    label: "Card Rank",
    description: "Check the rank of the card",
    applicableTriggers: ["card_scored", "card_held"],
    params: [
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
        options: [...RANKS],
        showWhen: {
          parameter: "rank_type",
          values: ["specific"],
        },
      },
      {
        id: "rank_group",
        type: "select",
        label: "Rank Group",
        options: [...RANK_GROUPS],
        showWhen: {
          parameter: "rank_type",
          values: ["group"],
        },
      },
    ],
    category: "Card",
  },
  {
    id: "card_suit",
    label: "Card Suit",
    description: "Check the suit of the card",
    applicableTriggers: ["card_scored", "card_held"],
    params: [
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
        options: [...SUITS],
        showWhen: {
          parameter: "suit_type",
          values: ["specific"],
        },
      },
      {
        id: "suit_group",
        type: "select",
        label: "Suit Group",
        options: [...SUIT_GROUPS],
        showWhen: {
          parameter: "suit_type",
          values: ["group"],
        },
      },
    ],
    category: "Card",
  },
];

export function getCardConditionsForTrigger(
  triggerId: string
): ConditionTypeDefinition[] {
  return CARD_CONDITION_TYPES.filter((condition) =>
    condition.applicableTriggers?.includes(triggerId)
  );
}

export function getCardConditionTypeById(
  id: string
): ConditionTypeDefinition | undefined {
  return CARD_CONDITION_TYPES.find((condition) => condition.id === id);
}
