import type { EffectReturn } from "./AddChipsEffect";
import type { Effect } from "../../ruleBuilder/types";
import { getEffectVariableName } from "../index";

export const generateApplyXMultReturn = (
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
      ? getEffectVariableName(effect.id, "Xmult")
      : "Xmult";
    valueReference = `card.ability.extra.${configVarName}`;
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
