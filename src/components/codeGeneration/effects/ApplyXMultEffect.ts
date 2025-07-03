import type { Effect } from "../../ruleBuilder/types";
import { getEffectVariableName } from "../index";
import {
  generateGameVariableCode,
  parseGameVariable,
} from "../gameVariableUtils";

export interface EffectReturn {
  statement: string;
  message?: string;
  colour: string;
}

export const generateApplyXMultReturn = (
  triggerType: string,
  effect: Effect
): EffectReturn => {
  const effectValue = effect.params.value;
  const parsed = parseGameVariable(effectValue);

  let valueCode: string;

  if (parsed.isGameVariable) {
    valueCode = generateGameVariableCode(effectValue);
  } else if (typeof effectValue === "string") {
    valueCode = `card.ability.extra.${effectValue}`;
  } else {
    const variableName = getEffectVariableName(effect.id, "Xmult");
    valueCode = `card.ability.extra.${variableName}`;
  }

  const customMessage = effect.customMessage;
  const messageCode = customMessage
    ? `"${customMessage}"`
    : `localize{type='variable',key='a_xmult',vars={${valueCode}}}`;

  switch (triggerType) {
    case "card_scored":
    case "card_held_in_hand":
      return {
        statement: `x_mult = ${valueCode}`,
        message: messageCode,
        colour: "G.C.RED",
      };

    case "hand_played":
    default:
      return {
        statement: `Xmult_mod = ${valueCode}`,
        message: messageCode,
        colour: "G.C.RED",
      };
  }
};
