import type { Rule } from "../ruleBuilder/types";
import { generatePassiveHandSize } from "./effects/EditHandSizeEffect";
import { generatePassiveHand } from "./effects/EditHandEffect";
import { generatePassiveDiscard } from "./effects/EditDiscardEffect";
import { generatePassiveCombineRanks } from "./effects/CombineRanksEffect";

export interface PassiveEffectResult {
  addToDeck?: string;
  removeFromDeck?: string;
  configVariables?: string[];
  locVars?: string[];
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
    default:
      return null;
  }
};
