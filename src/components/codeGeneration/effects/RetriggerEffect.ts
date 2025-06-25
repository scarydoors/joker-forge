import type { EffectReturn } from "./AddChipsEffect";
import type { Effect } from "../../ruleBuilder/types";

export const generateRetriggerReturn = (effect?: Effect): EffectReturn => {
  const customMessage = effect?.customMessage;
  const configVarName = effect;

  return {
    statement: `repetitions = card.ability.extra.${configVarName}`,
    message: customMessage ? `"${customMessage}"` : undefined,
    colour: "G.C.ORANGE",
  };
};
