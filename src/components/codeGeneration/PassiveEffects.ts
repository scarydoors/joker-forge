import type { Rule } from "../ruleBuilder/types";
import { generatePassiveHandSize } from "./effects/EditHandSizeEffect";
import { generatePassiveHand } from "./effects/EditHandEffect";
import { generatePassiveDiscard } from "./effects/EditDiscardEffect";
import { generatePassiveCombineRanks } from "./effects/CombineRanksEffect";
import {
  generatePassiveConsideredAs,
  type ConsideredAsResult,
} from "./effects/ConsideredAsEffect";

export interface PassiveEffectResult {
  addToDeck?: string;
  removeFromDeck?: string;
  configVariables?: string[];
  locVars?: string[];
  calculateFunction?: string;
}

export const generatePassiveEffect = (
  rule: Rule
): PassiveEffectResult | null => {
  if (
    rule.trigger !== "passive" ||
    !rule.effects ||
    rule.effects.length !== 1
  ) {
    return null;
  }

  const effect = rule.effects[0];

  switch (effect.type) {
    case "edit_hand_size":
      return generatePassiveHandSize(effect);
    case "edit_hand":
      return generatePassiveHand(effect);
    case "edit_discard":
      return generatePassiveDiscard(effect);
    case "combine_ranks":
      return generatePassiveCombineRanks(effect);
    case "considered_as": {
      const consideredAsResult: ConsideredAsResult =
        generatePassiveConsideredAs(effect);

      const sourceType =
        (effect.params?.source_type as string) || "enhancement";
      const targetType =
        (effect.params?.target_type as string) || "enhancement";

      let sourceValue = "";
      let targetValue = "";

      switch (sourceType) {
        case "rank":
          sourceValue = (effect.params?.source_rank as string) || "A";
          break;
        case "suit":
          sourceValue = (effect.params?.source_suit as string) || "Spades";
          break;
        case "enhancement":
          sourceValue =
            (effect.params?.source_enhancement as string) || "m_gold";
          break;
        case "seal":
          sourceValue = (effect.params?.source_seal as string) || "Gold";
          break;
        case "edition":
          sourceValue = (effect.params?.source_edition as string) || "e_foil";
          break;
      }

      switch (targetType) {
        case "enhancement":
          targetValue =
            (effect.params?.target_enhancement as string) || "m_steel";
          break;
        case "seal":
          targetValue = (effect.params?.target_seal as string) || "Gold";
          break;
        case "edition":
          targetValue = (effect.params?.target_edition as string) || "e_foil";
          break;
      }

      const updatedConfigVariables = [
        `source_type = "${sourceType}"`,
        `source_value = "${sourceValue}"`,
        `target_type = "${targetType}"`,
        `target_value = "${targetValue}"`,
      ];

      return {
        calculateFunction: consideredAsResult.calculateFunction,
        configVariables: updatedConfigVariables,
        locVars: consideredAsResult.locVars,
      };
    }
    default:
      return null;
  }
};
