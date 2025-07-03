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

export const generateApplyXChipsReturn = (
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
    const variableName = getEffectVariableName(effect.id, "xchips");
    valueCode = `card.ability.extra.${variableName}`;
  }

  const customMessage = effect.customMessage;
  const messageCode = customMessage
    ? `"${customMessage}"`
    : `localize{type='variable',key='a_xchips',vars={${valueCode}}}`;

  switch (triggerType) {
    case "card_scored":
    case "card_held_in_hand":
      return {
        statement: `x_chips = ${valueCode}`,
        message: messageCode,
        colour: "G.C.CHIPS",
      };

    case "hand_played":
    default:
      return {
        statement: `Xchips_mod = ${valueCode}`,
        message: messageCode,
        colour: "G.C.CHIPS",
      };
  }
};
