import type { EffectReturn } from "./AddChipsEffect";
import type { Effect } from "../../ruleBuilder/types";

export const generateDeleteCardReturn = (effect?: Effect): EffectReturn => {
  const customMessage = effect?.customMessage;

  return {
    statement: `func = function()
                    context.other_card:start_dissolve()
                    return true
                end`,
    message: customMessage ? `"${customMessage}"` : `"Destroyed!"`,
    colour: "G.C.RED",
  };
};
