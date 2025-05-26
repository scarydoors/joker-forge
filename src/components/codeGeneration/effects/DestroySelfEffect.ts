import type { EffectReturn } from "./AddChipsEffect";

export const generateDestroySelfReturn = (): EffectReturn => {
  return {
    statement: `func = function()
                card:start_dissolve()
                return true
            end`,
    message: `"Destroyed!"`,
    colour: "G.C.RED",
  };
};
