import type { Effect } from "../../ruleBuilder/types";
import { getEffectVariableName } from "../JokerBase";

export interface EffectReturn {
  statement: string;
  message?: string;
  colour?: string;
}

export const generateAddChipsReturn = (
  triggerType: string,
  effect?: Effect
): EffectReturn => {
  const customMessage = effect?.customMessage;

  // Check if value is a variable reference (string) or a literal value
  const isVariableReference = typeof effect?.params?.value === "string";

  let valueReference = "";
  if (isVariableReference) {
    const variableName = effect?.params?.value as string;
    valueReference = `card.ability.extra.${variableName}`;
  } else {
    const configVarName = effect
      ? getEffectVariableName(effect.id, "chips")
      : "chips";
    valueReference = `card.ability.extra.${configVarName}`;
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
