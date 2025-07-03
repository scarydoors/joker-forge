import type { EffectReturn } from "./AddChipsEffect";
import type { Effect } from "../../ruleBuilder/types";
import { getEffectVariableName } from "../index";
import {
  generateGameVariableCode,
  parseGameVariable,
} from "../gameVariableUtils";

export const generateApplyExpMultReturn = (effect: Effect): EffectReturn => {
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
    const variableName = getEffectVariableName(effect.id, "emult");
    valueCode = `card.ability.extra.${variableName}`;
  }

  const customMessage = effect.customMessage;

  const result: EffectReturn = {
    statement: `e_mult = ${valueCode}`,
    colour: "G.C.DARK_EDITION",
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};
