import type { Effect } from "../../ruleBuilder/types";

export interface EffectReturn {
  statement: string;
  message?: string;
  colour?: string;
}

export const generateAddChipsReturn = (
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
    valueReference = "card.ability.extra.chips";
  }

  if (triggerType === "card_scored" || triggerType === "card_discarded") {
    return {
      statement: `chips = ${valueReference}`,
      message: customMessage ? `"${customMessage}"` : undefined,
      colour: "G.C.CHIPS",
    };
  } else {
    return {
      statement: `chip_mod = ${valueReference}`,
      message: customMessage
        ? `"${customMessage}"`
        : `localize{type='variable',key='a_chips',vars={${valueReference}}}`,
      colour: "G.C.CHIPS",
    };
  }
};
