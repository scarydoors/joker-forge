import type { EffectReturn } from "./AddChipsEffect";
import type { Effect } from "../../ruleBuilder/types";

export const generateApplyXMultReturn = (
  triggerType: string,
  effect?: Effect
): EffectReturn => {
  const valueSource = effect?.params?.value_source || "fixed";
  const variableName = effect?.params?.variable_name || "var1";
  const customMessage = effect?.customMessage;

  let valueReference = "";
  if (valueSource === "variable") {
    valueReference = `card.ability.extra.${variableName}`;
  } else {
    valueReference = "card.ability.extra.Xmult";
  }

  if (triggerType === "card_scored" || triggerType === "card_discarded") {
    return {
      statement: `Xmult = ${valueReference}`,
      message: customMessage ? `"${customMessage}"` : undefined,
      colour: "G.C.XMULT",
    };
  } else {
    return {
      statement: `Xmult_mod = ${valueReference}`,
      message: customMessage
        ? `"${customMessage}"`
        : `localize{type='variable',key='a_xmult',vars={${valueReference}}}`,
      colour: "G.C.XMULT",
    };
  }
};
