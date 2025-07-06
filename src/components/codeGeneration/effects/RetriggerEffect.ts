import type { Effect } from "../../ruleBuilder/types";
import { getEffectVariableName } from "../index";
import {
  generateGameVariableCode,
  parseGameVariable,
  parseRangeVariable,
} from "../gameVariableUtils";

export interface EffectReturn {
  statement: string;
  message?: string;
  colour: string;
}

export const generateRetriggerReturn = (effect: Effect): EffectReturn => {
  const repetitionsValue = effect.params.repetitions;
  const parsed = parseGameVariable(repetitionsValue);
  const rangeParsed = parseRangeVariable(repetitionsValue);

  let valueCode: string;

  if (parsed.isGameVariable) {
    valueCode = generateGameVariableCode(repetitionsValue);
  } else if (rangeParsed.isRangeVariable) {
    const variableName = getEffectVariableName(effect.id, "repetitions");
    const seedName = `${variableName}_${effect.id.substring(0, 8)}`;
    valueCode = `pseudorandom('${seedName}', card.ability.extra.${variableName}_min, card.ability.extra.${variableName}_max)`;
  } else if (typeof repetitionsValue === "string") {
    if (repetitionsValue.endsWith("_value")) {
      valueCode = repetitionsValue;
    } else {
      valueCode = `card.ability.extra.${repetitionsValue}`;
    }
  } else {
    const variableName = getEffectVariableName(effect.id, "repetitions");
    valueCode = `card.ability.extra.${variableName}`;
  }

  const customMessage = effect.customMessage;
  const messageCode = customMessage
    ? `"${customMessage}"`
    : "localize('k_again_ex')";

  return {
    statement: `repetitions = ${valueCode}`,
    message: messageCode,
    colour: "G.C.RED",
  };
};
