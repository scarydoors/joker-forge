import type { EffectReturn } from "./AddChipsEffect";
import type { Effect } from "../../ruleBuilder/types";

export const generateAddMultReturn = (
  triggerType: string,
  effect?: Effect
): EffectReturn => {
  const valueSource = effect?.params?.value_source || "fixed";
  const variableName = effect?.params?.variable_name || "var1";

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
    // For card_scored, SMODS adds message automatically
    return {
      statement: `mult = ${valueReference}`,
      colour: "G.C.MULT",
    };
  } else {
    return {
      statement: `mult_mod = ${valueReference}`,
      message: `localize{type='variable',key='a_mult',vars={${valueReference}}}`,
      colour: "G.C.MULT",
    };
  }
};
