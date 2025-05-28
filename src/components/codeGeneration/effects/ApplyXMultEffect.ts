import type { EffectReturn } from "./AddChipsEffect";
import type { Effect } from "../../ruleBuilder/types";

export const generateApplyXMultReturn = (
  triggerType: string,
  effect?: Effect
): EffectReturn => {
  const valueSource = effect?.params?.value_source || "fixed";
  const variableName = effect?.params?.variable_name || "var1";

  let valueReference = "";
  if (valueSource === "variable") {
    valueReference = `card.ability.extra.${variableName}`;
  } else {
    valueReference = "card.ability.extra.Xmult";
  }

  if (triggerType === "card_scored" || triggerType === "card_discarded") {
    // For card_scored and card_discarded, SMODS adds message automatically
    return {
      statement: `Xmult = ${valueReference}`,
      colour: "G.C.XMULT",
    };
  } else {
    return {
      statement: `Xmult_mod = ${valueReference}`,
      message: `localize{type='variable',key='a_xmult',vars={${valueReference}}}`,
      colour: "G.C.XMULT",
    };
  }
};
