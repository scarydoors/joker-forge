import type { EffectReturn } from "./AddChipsEffect";

export const generateDeleteCardReturn = (): EffectReturn => {
  return {
    statement: `func = function()
                    -- Destroy the triggered card
                    context.other_card:start_dissolve()
                    return true
                end`,
    message: `"Destroyed!"`,
    colour: "G.C.RED",
  };
};
