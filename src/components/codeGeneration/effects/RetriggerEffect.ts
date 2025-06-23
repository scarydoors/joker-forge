import type { EffectReturn } from "./AddChipsEffect";
import type { Effect } from "../../ruleBuilder/types";

export const generateRetriggerReturn = (effect?: Effect): EffectReturn => {
  const customMessage = effect?.customMessage;

  return {
    statement: `repetitions = card.ability.extra.repetitions`,
    message: customMessage ? `"${customMessage}"` : undefined,
    colour: "G.C.ORANGE",
  };
};
