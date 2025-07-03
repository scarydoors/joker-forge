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

export const generateAddDollarsReturn = (
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
    const variableName = getEffectVariableName(effect.id, "dollars");
    valueCode = `card.ability.extra.${variableName}`;
  }

  const customMessage = effect.customMessage;
  const messageCode = customMessage
    ? `"${customMessage}"`
    : `localize{type='variable',key='a_dollars',vars={${valueCode}}}`;

  switch (triggerType) {
    case "card_scored":
    case "card_held_in_hand":
      return {
        statement: `dollars = ${valueCode}`,
        message: messageCode,
        colour: "G.C.MONEY",
      };

    case "round_end":
      return {
        statement: `dollars = ${valueCode}`,
        message: messageCode,
        colour: "G.C.MONEY",
      };

    case "hand_played":
    default:
      return {
        statement: `
                ease_dollars(${valueCode})
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${messageCode}, colour = G.C.MONEY})`,
        colour: "G.C.MONEY",
      };
  }
};
