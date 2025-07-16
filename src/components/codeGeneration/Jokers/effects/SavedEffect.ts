import type { Effect } from "../../../ruleBuilder/types";

export interface EffectReturn {
  statement: string;
  message?: string;
  colour: string;
}

export const generateSavedReturn = (effect: Effect): EffectReturn => {
  const customMessage = effect.customMessage;

  const result: EffectReturn = {
    statement: `saved = true`,
    colour: "G.C.RED",
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  } else {
    result.message = `localize('k_saved_ex')`;
  }

  return result;
};
