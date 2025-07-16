import type { PassiveEffectResult } from "../effectUtils";

export const generatePassiveSplashEffect = (): PassiveEffectResult => {
  const calculateFunction = `calculate = function(self, card, context)
        if context.modify_scoring_hand and not context.blueprint then
            return {
                add_to_hand = true
            }
        end
    end`;

  return {
    calculateFunction,
    configVariables: [],
    locVars: [],
  };
};
