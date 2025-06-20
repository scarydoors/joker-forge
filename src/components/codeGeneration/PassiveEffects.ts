import type { Rule } from "../ruleBuilder/types";
import { generatePassiveHandSize } from "./effects/EditHandSizeEffect";

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
    default:
      return null;
  }
};
