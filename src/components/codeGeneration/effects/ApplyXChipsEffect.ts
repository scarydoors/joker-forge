import type { Effect } from "../../ruleBuilder/types";
import {
  generateGameVariableCode,
  parseGameVariable,
} from "../gameVariableUtils";
import type { EffectReturn, ConfigExtraVariable } from "../effectUtils";

export const generateApplyXChipsReturn = (
  effect: Effect,
  variableNameMap?: Map<string, string>
): EffectReturn => {
  const effectValue = effect.params.value;
  const parsed = parseGameVariable(effectValue);

  let valueCode: string;
  const configVariables: ConfigExtraVariable[] = [];

  if (parsed.isGameVariable) {
    valueCode = generateGameVariableCode(effectValue);
  } else if (typeof effectValue === "string") {
    if (effectValue.endsWith("_value")) {
      valueCode = effectValue;
    } else {
      const actualVariableName =
        variableNameMap?.get(effectValue) || effectValue;
      valueCode = `card.ability.extra.${actualVariableName}`;
    }
  } else {
    const variableName = "xchips";
    const actualVariableName =
      variableNameMap?.get(variableName) || variableName;
    valueCode = `card.ability.extra.${actualVariableName}`;

    configVariables.push({
      name: actualVariableName,
      value: Number(effectValue) || 1.5,
    });
  }

  const customMessage = effect.customMessage;

  const result: EffectReturn = {
    statement: `xchips = ${valueCode}`,
    colour: "",
    configVariables: configVariables.length > 0 ? configVariables : undefined,
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};
