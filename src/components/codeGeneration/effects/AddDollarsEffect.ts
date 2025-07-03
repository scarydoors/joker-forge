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

export const generateAddDollarsReturn = (effect: Effect): EffectReturn => {
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
    const variableName = getEffectVariableName(effect.id, "dollars");
    valueCode = `card.ability.extra.${variableName}`;
  }

  const customMessage = effect.customMessage;

  const result: EffectReturn = {
    statement: `dollars = ${valueCode}`,
    colour: "",
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};
