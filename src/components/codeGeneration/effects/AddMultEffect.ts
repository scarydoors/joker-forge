import type { EffectReturn } from "./AddChipsEffect";
import type { Effect } from "../../ruleBuilder/types";
import { getEffectVariableName } from "../index";

export const generateAddMultReturn = (
  triggerType: string,
  effect?: Effect
): EffectReturn => {
  const customMessage = effect?.customMessage;

  const isVariableReference = typeof effect?.params?.value === "string";

  let valueReference = "";
  if (isVariableReference) {
    const variableName = effect?.params?.value as string;
    valueReference = variableName.includes("_value")
      ? variableName
      : `card.ability.extra.${variableName}`;
  } else {
    const configVarName = effect
      ? getEffectVariableName(effect.id, "mult")
      : "mult";
    valueReference = `card.ability.extra.${configVarName}`;
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
      statement: `mult = ${valueReference}`,
      message: customMessage ? `"${customMessage}"` : undefined,
      colour: "G.C.MULT",
    };
  }
};
