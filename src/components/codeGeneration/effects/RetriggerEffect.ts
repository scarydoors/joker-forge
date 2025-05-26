import type { EffectReturn } from "./AddChipsEffect";

export const generateRetriggerReturn = (): EffectReturn => {
  return {
    statement: `repetitions = card.ability.extra.repetitions`,
    colour: "G.C.ORANGE",
  };
};
