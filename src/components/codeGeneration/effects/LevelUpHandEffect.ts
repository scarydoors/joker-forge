import type { EffectReturn } from "./AddChipsEffect";

export const generateLevelUpHandReturn = (): EffectReturn => {
  return {
    statement: `level_up = card.ability.extra.levels`,
    message: `localize('k_level_up_ex')`,
    colour: "G.C.RED",
  };
};
