import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../ruleBuilder/types";

export const generateDestroySelfReturn = (effect?: Effect): EffectReturn => {
  const customMessage = effect?.customMessage;

  return {
    statement: `func = function()
                card:start_dissolve()
                return true
            end`,
    message: customMessage ? `"${customMessage}"` : `"Destroyed!"`,
    colour: "G.C.RED",
  };
};
