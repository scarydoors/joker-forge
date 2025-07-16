import { EffectTypeDefinition } from "../../ruleBuilder/types";
import {
  PencilSquareIcon,
  BanknotesIcon,
  RectangleStackIcon,
  SparklesIcon,
  CakeIcon,
  UserGroupIcon,
  CursorArrowRaysIcon,
} from "@heroicons/react/24/outline";
import { CategoryDefinition } from "../Jokers/Triggers";
import {
  ENHANCEMENTS,
  SUITS,
  RANKS,
  SEALS,
  EDITIONS,
  POKER_HANDS,
} from "../BalatroUtils";

export const CONSUMABLE_EFFECT_CATEGORIES: CategoryDefinition[] = [
  {
    label: "Selected Cards",
    icon: CursorArrowRaysIcon,
  },
  {
    label: "Card Modification",
    icon: PencilSquareIcon,
  },
  {
    label: "Economy",
    icon: BanknotesIcon,
  },
  {
    label: "Card Creation",
    icon: RectangleStackIcon,
  },
  {
    label: "Hand Effects",
    icon: UserGroupIcon,
  },
  {
    label: "Consumables",
    icon: CakeIcon,
  },
  {
    label: "Special",
    icon: SparklesIcon,
  },
];

export const CONSUMABLE_EFFECT_TYPES: EffectTypeDefinition[] = [
  // ===== SELECTED CARDS EFFECTS =====
  {
    id: "enhance_cards",
    label: "Enhance Selected Cards",
    description: "Apply an enhancement to the selected cards",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "enhancement",
        type: "select",
        label: "Enhancement Type",
        options: [
          ...ENHANCEMENTS,
          { value: "random", label: "Random Enhancement" },
        ],
        default: "m_bonus",
      },
    ],
    category: "Selected Cards",
  },
  {
    id: "change_suit",
    label: "Change Selected Cards Suit",
    description: "Change the suit of selected cards",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "suit",
        type: "select",
        label: "New Suit",
        options: [...SUITS, { value: "random", label: "Random Suit" }],
        default: "Hearts",
      },
    ],
    category: "Selected Cards",
  },
  {
    id: "change_rank",
    label: "Change Selected Cards Rank",
    description: "Change the rank of selected cards",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "rank",
        type: "select",
        label: "New Rank",
        options: [
          ...RANKS.map((rank) => ({ value: rank.label, label: rank.label })),
          { value: "random", label: "Random Rank" },
        ],
        default: "Ace",
      },
    ],
    category: "Selected Cards",
  },
  {
    id: "add_seal",
    label: "Add Seal to Selected Cards",
    description: "Apply a seal to the selected cards",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "seal",
        type: "select",
        label: "Seal Type",
        options: [
          ...SEALS.map((seal) => ({ value: seal.value, label: seal.label })),
          { value: "random", label: "Random Seal" },
        ],
        default: "Gold",
      },
    ],
    category: "Selected Cards",
  },
  {
    id: "add_edition",
    label: "Add Edition to Selected Cards",
    description: "Apply an edition to the selected cards",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "edition",
        type: "select",
        label: "Edition Type",
        options: [
          ...EDITIONS.map((edition) => ({
            value: edition.key,
            label: edition.label,
          })),
          { value: "random", label: "Random Edition" },
        ],
        default: "e_foil",
      },
    ],
    category: "Selected Cards",
  },
  {
    id: "destroy_selected_cards",
    label: "Destroy Selected Cards",
    description: "Destroy all currently selected cards",
    applicableTriggers: ["consumable_used"],
    params: [],
    category: "Selected Cards",
  },

  // ===== OTHER EFFECTS =====
  {
    id: "destroy_random_cards",
    label: "Destroy Random Cards",
    description: "Destroy a number of random cards from hand",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "count",
        type: "number",
        label: "Number of Cards",
        default: 1,
        min: 1,
        max: 8,
      },
    ],
    category: "Card Modification",
  },
  {
    id: "level_up_hand",
    label: "Level Up Poker Hand (BUGGY BUT WORKS)",
    description: "Level up a specific poker hand or random hand",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "hand_type",
        type: "select",
        label: "Poker Hand",
        options: [
          ...POKER_HANDS.map((hand) => ({
            value: hand.value,
            label: hand.label,
          })),
          { value: "random", label: "Random Hand" },
        ],
        default: "Pair",
      },
      {
        id: "levels",
        type: "number",
        label: "Number of Levels",
        default: 1,
        min: 1,
        max: 10,
      },
    ],
    category: "Hand Effects",
  },
  {
    id: "add_dollars",
    label: "Add Money",
    description: "Give the player money",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "value",
        type: "number",
        label: "Dollar Amount",
        default: 5,
        min: 0,
      },
    ],
    category: "Economy",
  },
];

export function getConsumableEffectsForTrigger(
  triggerId: string
): EffectTypeDefinition[] {
  return CONSUMABLE_EFFECT_TYPES.filter((effect) =>
    effect.applicableTriggers?.includes(triggerId)
  );
}

export function getConsumableEffectTypeById(
  id: string
): EffectTypeDefinition | undefined {
  return CONSUMABLE_EFFECT_TYPES.find((effect) => effect.id === id);
}

export function getSelectedCardEffects(): EffectTypeDefinition[] {
  return CONSUMABLE_EFFECT_TYPES.filter(
    (effect) => effect.category === "Selected Cards"
  );
}

export function getNonSelectedCardEffects(): EffectTypeDefinition[] {
  return CONSUMABLE_EFFECT_TYPES.filter(
    (effect) => effect.category !== "Selected Cards"
  );
}
