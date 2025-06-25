import type { EffectReturn } from "./AddChipsEffect";
import type { Effect } from "../../ruleBuilder/types";
import { getEffectVariableName } from "../index";

export const generateRetriggerReturn = (effect?: Effect): EffectReturn => {
  const customMessage = effect?.customMessage;
  const configVarName = effect
    ? getEffectVariableName(effect.id, "repetitions")
    : "repetitions";

  return {
    statement: `repetitions = card.ability.extra.${configVarName}`,
    message: customMessage ? `"${customMessage}"` : `localize('k_again_ex')`,
    colour: "G.C.ORANGE",
  };
};
