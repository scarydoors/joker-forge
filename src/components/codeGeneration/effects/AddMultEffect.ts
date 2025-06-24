import type { EffectReturn } from "./AddChipsEffect";
import type { Effect } from "../../ruleBuilder/types";
import { getEffectVariableName } from "../JokerBase";

export const generateAddMultReturn = (
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
      statement: `mult_mod = ${valueReference}`,
      message: customMessage
        ? `"${customMessage}"`
        : `localize{type='variable',key='a_mult',vars={${valueReference}}}`,
      colour: "G.C.MULT",
    };
  }
};
