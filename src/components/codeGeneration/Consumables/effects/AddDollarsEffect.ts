import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";

export const generateAddDollarsReturn = (effect: Effect): EffectReturn => {
  const amount = effect.params?.value || 5;
  const customMessage = effect.customMessage;

  const result: EffectReturn = {
    statement: `ease_dollars(${amount})`,
    colour: "G.C.MONEY",
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};
