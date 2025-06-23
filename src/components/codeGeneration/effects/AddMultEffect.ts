import type { EffectReturn } from "./AddChipsEffect";
import type { Effect } from "../../ruleBuilder/types";

export const generateAddMultReturn = (
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
    valueReference = "card.ability.extra.mult";
  }

  if (
    triggerType === "card_scored" ||
    triggerType === "card_discarded" ||
    triggerType === "card_held_in_hand"
  ) {
    return {
      statement: `mult = ${valueReference}`,
      message: customMessage ? `"${customMessage}"` : undefined,
      colour: "G.C.MULT",
    };
  } else {
    return {
      statement: `mult_mod = ${valueReference}`,
      message: customMessage
        ? `"${customMessage}"`
        : `localize{type='variable',key='a_mult',vars={${valueReference}}}`,
      colour: "G.C.MULT",
    };
  }
};
