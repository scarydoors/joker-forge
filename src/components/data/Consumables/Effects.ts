import { EffectTypeDefinition } from "../../ruleBuilder/types";
import {
  PencilSquareIcon,
  BanknotesIcon,
  SparklesIcon,
  CakeIcon,
  UserGroupIcon,
  CursorArrowRaysIcon,
  HandRaisedIcon,
} from "@heroicons/react/24/outline";
import { CategoryDefinition } from "../Jokers/Triggers";
import {
  ENHANCEMENTS,
  SUITS,
  RANKS,
  SEALS,
  EDITIONS,
  POKER_HANDS,
  TAROT_CARDS,
  PLANET_CARDS,
  SPECTRAL_CARDS,
  CUSTOM_CONSUMABLES,
  CONSUMABLE_SETS,
  RARITIES,
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
    label: "Hand Effects",
    icon: HandRaisedIcon,
  },
  {
    label: "Consumables",
    icon: CakeIcon,
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

export const CONSUMABLE_EFFECT_TYPES: EffectTypeDefinition[] = [
  // ===== SELECTED CARDS EFFECTS =====
  {
    id: "edit_cards",
    label: "Edit Selected Cards",
    description:
      "Apply multiple modifications to selected cards (enhancement, seal, edition, suit, rank)",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "enhancement",
        type: "select",
        label: "Enhancement Type",
        options: [
          { value: "none", label: "No Change" },
          ...ENHANCEMENTS,
          { value: "random", label: "Random Enhancement" },
        ],
        default: "none",
      },
      {
        id: "seal",
        type: "select",
        label: "Seal Type",
        options: [
          { value: "none", label: "No Change" },
          ...SEALS.map((seal) => ({ value: seal.value, label: seal.label })),
          { value: "random", label: "Random Seal" },
        ],
        default: "none",
      },
      {
        id: "edition",
        type: "select",
        label: "Edition Type",
        options: [
          { value: "none", label: "No Change" },
          ...EDITIONS.map((edition) => ({
            value: edition.key,
            label: edition.label,
          })),
          { value: "random", label: "Random Edition" },
        ],
        default: "none",
      },
      {
        id: "suit",
        type: "select",
        label: "Suit",
        options: [
          { value: "none", label: "No Change" },
          ...SUITS,
          { value: "random", label: "Random Suit" },
        ],
        default: "none",
      },
      {
        id: "rank",
        type: "select",
        label: "Rank",
        options: [
          { value: "none", label: "No Change" },
          ...RANKS.map((rank) => ({ value: rank.label, label: rank.label })),
          { value: "random", label: "Random Rank" },
        ],
        default: "none",
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
  {
    id: "increment_rank",
    label: "Increment/Decrement Rank",
    description:
      "Increase or decrease the rank of selected cards by a specified amount",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "operation",
        type: "select",
        label: "Operation",
        options: [
          { value: "increment", label: "Increment (+)" },
          { value: "decrement", label: "Decrement (-)" },
        ],
        default: "increment",
      },
      {
        id: "value",
        type: "number",
        label: "Amount",
        default: 1,
        min: 1,
        max: 13,
      },
    ],
    category: "Selected Cards",
  },

  // ===== HAND EFFECTS =====
  {
    id: "edit_hand_size",
    label: "Edit Hand Size",
    description: "Add, subtract, or set the player's hand size",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "operation",
        type: "select",
        label: "Operation",
        options: [
          { value: "add", label: "Add" },
          { value: "subtract", label: "Subtract" },
          { value: "set", label: "Set" },
        ],
        default: "add",
      },
      {
        id: "value",
        type: "number",
        label: "Amount",
        default: 1,
        min: 1,
        max: 50,
      },
    ],
    category: "Hand Effects",
  },
  {
    id: "edit_hands",
    label: "Edit Hands",
    description: "Add, subtract, or set the player's hands for this round",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "operation",
        type: "select",
        label: "Operation",
        options: [
          { value: "add", label: "Add" },
          { value: "subtract", label: "Subtract" },
          { value: "set", label: "Set" },
        ],
        default: "add",
      },
      {
        id: "value",
        type: "number",
        label: "Amount",
        default: 1,
        min: 1,
        max: 50,
      },
    ],
    category: "Hand Effects",
  },
  {
    id: "edit_discards",
    label: "Edit Discards",
    description: "Add, subtract, or set the player's discards for this round",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "operation",
        type: "select",
        label: "Operation",
        options: [
          { value: "add", label: "Add" },
          { value: "subtract", label: "Subtract" },
          { value: "set", label: "Set" },
        ],
        default: "add",
      },
      {
        id: "value",
        type: "number",
        label: "Amount",
        default: 1,
        min: 1,
        max: 50,
      },
    ],
    category: "Hand Effects",
  },

  // ===== OTHER EFFECTS =====
  {
    id: "convert_all_cards_to_suit",
    label: "Convert All Cards to Suit",
    description: "Convert all cards in hand to a specific suit",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "suit",
        type: "select",
        label: "Target Suit",
        options: [...SUITS, { value: "random", label: "Random Suit" }],
        default: "Hearts",
      },
    ],
    category: "Card Modification",
  },
  {
    id: "convert_all_cards_to_rank",
    label: "Convert All Cards to Rank",
    description: "Convert all cards in hand to a specific rank",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "rank",
        type: "select",
        label: "Target Rank",
        options: [
          ...RANKS.map((rank) => ({ value: rank.label, label: rank.label })),
          { value: "random", label: "Random Rank" },
        ],
        default: "Ace",
      },
    ],
    category: "Card Modification",
  },
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
    id: "add_cards_to_hand",
    label: "Add Cards to Hand",
    description: "Create and add new cards to hand with specified properties",
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
      {
        id: "rank",
        type: "select",
        label: "Rank",
        options: [
          { value: "random", label: "Random Rank" },
          { value: "Face Cards", label: "Face Cards" },
          { value: "Numbered Cards", label: "Numbered Cards" },
          ...RANKS.map((rank) => ({ value: rank.label, label: rank.label })),
        ],
        default: "random",
      },
      {
        id: "suit",
        type: "select",
        label: "Suit",
        options: [{ value: "none", label: "Random Suit" }, ...SUITS],
        default: "none",
      },
      {
        id: "enhancement",
        type: "select",
        label: "Enhancement Type",
        options: [
          { value: "none", label: "No Enhancement" },
          ...ENHANCEMENTS,
          { value: "random", label: "Random Enhancement" },
        ],
        default: "none",
      },
      {
        id: "seal",
        type: "select",
        label: "Seal Type",
        options: [
          { value: "none", label: "No Seal" },
          ...SEALS.map((seal) => ({ value: seal.value, label: seal.label })),
          { value: "random", label: "Random Seal" },
        ],
        default: "none",
      },
      {
        id: "edition",
        type: "select",
        label: "Edition Type",
        options: [
          { value: "none", label: "No Edition" },
          ...EDITIONS.map((edition) => ({
            value: edition.key,
            label: edition.label,
          })),
          { value: "random", label: "Random Edition" },
        ],
        default: "none",
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
    id: "edit_dollars",
    label: "Edit Dollars",
    description: "Add, subtract, or set the player's money",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "operation",
        type: "select",
        label: "Operation",
        options: [
          { value: "add", label: "Add" },
          { value: "subtract", label: "Subtract" },
          { value: "set", label: "Set" },
        ],
        default: "add",
      },
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
  {
    id: "double_dollars",
    label: "Double Dollars",
    description: "Double your current money up to a specified limit",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "limit",
        type: "number",
        label: "Maximum Amount to Gain",
        default: 20,
        min: 1,
        max: 999,
      },
    ],
    category: "Economy",
  },
  {
    id: "add_dollars_from_jokers",
    label: "Add Dollars from Joker Sell Value",
    description:
      "Gain money equal to the total sell value of all jokers, up to a limit",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "limit",
        type: "number",
        label: "Maximum Amount to Gain",
        default: 50,
        min: 1,
        max: 999,
      },
    ],
    category: "Economy",
  },
  {
    id: "create_consumable",
    label: "Create Consumable",
    description:
      "Create consumable cards and add them to your consumables area",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "set",
        type: "select",
        label: "Consumable Set",
        options: () => [
          { value: "random", label: "Random Consumable" },
          ...CONSUMABLE_SETS(),
        ],
        default: "random",
      },
      {
        id: "specific_card",
        type: "select",
        label: "Specific Card",
        options: (parentValues: Record<string, unknown>) => {
          const selectedSet = parentValues?.set as string;

          if (!selectedSet || selectedSet === "random") {
            return [{ value: "random", label: "Random from Set" }];
          }

          // Handle vanilla sets
          if (selectedSet === "Tarot") {
            const vanillaCards = TAROT_CARDS.map((card) => ({
              value: card.key,
              label: card.label,
            }));

            const customCards = CUSTOM_CONSUMABLES()
              .filter((consumable) => consumable.set === "Tarot")
              .map((consumable) => ({
                value: consumable.value,
                label: consumable.label,
              }));

            return [
              { value: "random", label: "Random from Set" },
              ...vanillaCards,
              ...customCards,
            ];
          }

          if (selectedSet === "Planet") {
            const vanillaCards = PLANET_CARDS.map((card) => ({
              value: card.key,
              label: card.label,
            }));

            const customCards = CUSTOM_CONSUMABLES()
              .filter((consumable) => consumable.set === "Planet")
              .map((consumable) => ({
                value: consumable.value,
                label: consumable.label,
              }));

            return [
              { value: "random", label: "Random from Set" },
              ...vanillaCards,
              ...customCards,
            ];
          }

          if (selectedSet === "Spectral") {
            const vanillaCards = SPECTRAL_CARDS.map((card) => ({
              value: card.key,
              label: card.label,
            }));

            const customCards = CUSTOM_CONSUMABLES()
              .filter((consumable) => consumable.set === "Spectral")
              .map((consumable) => ({
                value: consumable.value,
                label: consumable.label,
              }));

            return [
              { value: "random", label: "Random from Set" },
              ...vanillaCards,
              ...customCards,
            ];
          }

          // Handle custom sets
          // Remove mod prefix to get the actual set key
          const setKey = selectedSet.includes("_")
            ? selectedSet.split("_").slice(1).join("_")
            : selectedSet;

          const customConsumablesInSet = CUSTOM_CONSUMABLES().filter(
            (consumable) =>
              consumable.set === setKey || consumable.set === selectedSet
          );

          return [
            { value: "random", label: "Random from Set" },
            ...customConsumablesInSet,
          ];
        },

        default: "random",
      },
      {
        id: "count",
        type: "number",
        label: "Number of Cards",
        default: 1,
        min: 1,
        max: 5,
      },
    ],
    category: "Consumables",
  },
  {
    id: "edit_cards_in_hand",
    label: "Edit Cards in Hand",
    description:
      "Apply multiple modifications to random cards in hand (enhancement, seal, edition, suit, rank)",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "amount",
        type: "number",
        label: "Number of Cards",
        default: 1,
        min: 1,
        max: 8,
      },
      {
        id: "enhancement",
        type: "select",
        label: "Enhancement Type",
        options: [
          { value: "none", label: "No Change" },
          ...ENHANCEMENTS,
          { value: "random", label: "Random Enhancement" },
        ],
        default: "none",
      },
      {
        id: "seal",
        type: "select",
        label: "Seal Type",
        options: [
          { value: "none", label: "No Change" },
          ...SEALS.map((seal) => ({ value: seal.value, label: seal.label })),
          { value: "random", label: "Random Seal" },
        ],
        default: "none",
      },
      {
        id: "edition",
        type: "select",
        label: "Edition Type",
        options: [
          { value: "none", label: "No Change" },
          ...EDITIONS.map((edition) => ({
            value: edition.key,
            label: edition.label,
          })),
          { value: "random", label: "Random Edition" },
        ],
        default: "none",
      },
      {
        id: "suit",
        type: "select",
        label: "Suit",
        options: [
          { value: "none", label: "No Change" },
          ...SUITS,
          { value: "random", label: "Random Suit" },
        ],
        default: "none",
      },
      {
        id: "rank",
        type: "select",
        label: "Rank",
        options: [
          { value: "none", label: "No Change" },
          ...RANKS.map((rank) => ({ value: rank.label, label: rank.label })),
          { value: "random", label: "Random Rank" },
        ],
        default: "none",
      },
    ],
    category: "Card Modification",
  },
  {
    id: "create_joker",
    label: "Create Joker",
    description:
      "Create a random or specific joker card. For creating jokers from your own mod, it is j_[modprefix]_[joker_name]. You can find your mod prefix in the mod metadata page.",
    applicableTriggers: ["consumable_used"],
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
          ...EDITIONS.map((edition) => ({
            value: edition.key,
            label: edition.label,
          })),
        ],
        default: "none",
      },
    ],
    category: "Jokers",
  },
  {
    id: "copy_random_joker",
    label: "Copy Random Joker",
    description: "Create copies of random jokers in your joker area",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "amount",
        type: "number",
        label: "Number of Jokers to Copy",
        default: 1,
        min: 1,
        max: 5,
      },
      {
        id: "edition",
        type: "select",
        label: "Edition to Apply",
        options: [
          { value: "none", label: "Keep Original Edition" },
          { value: "remove", label: "Remove Edition" },
          ...EDITIONS.map((edition) => ({
            value: edition.key,
            label: edition.label,
          })),
          { value: "random", label: "Random Edition" },
        ],
        default: "none",
      },
    ],
    category: "Jokers",
  },
  {
    id: "destroy_random_joker",
    label: "Destroy Random Joker",
    description:
      "Destroy random jokers from your joker area (eternal jokers are safe)",
    applicableTriggers: ["consumable_used"],
    params: [
      {
        id: "amount",
        type: "number",
        label: "Number of Jokers to Destroy",
        default: 1,
        min: 1,
        max: 5,
      },
    ],
    category: "Jokers",
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
