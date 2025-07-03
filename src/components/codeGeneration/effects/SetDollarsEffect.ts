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

export const generateSetDollarsReturn = (effect: Effect): EffectReturn => {
  const effectValue = effect.params.value;
  const parsed = parseGameVariable(effectValue);

  let valueCode: string;

  if (parsed.isGameVariable) {
    valueCode = generateGameVariableCode(effectValue);
  } else if (typeof effectValue === "string") {
    if (effectValue.endsWith("_value")) {
      valueCode = effectValue;
    } else {
      valueCode = `card.ability.extra.${effectValue}`;
    }
  } else {
    const variableName = getEffectVariableName(effect.id, "set_dollars");
    valueCode = `card.ability.extra.${variableName}`;
  }

  const customMessage = effect.customMessage;
  const setMessage = customMessage
    ? `"${customMessage}"`
    : `"Set to $"..tostring(${valueCode})`;

  const result: EffectReturn = {
    statement: `func = function()
                local target_amount = ${valueCode}
                local current_amount = G.GAME.dollars
                local difference = target_amount - current_amount
                ease_dollars(difference)
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.MONEY})
                return true
            end`,
    colour: "G.C.MONEY",
  };

  return result;
};
