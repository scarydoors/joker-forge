import type { Effect } from "../../ruleBuilder/types";
import {
  generateGameVariableCode,
  parseGameVariable,
  parseRangeVariable,
} from "../gameVariableUtils";
import type { EffectReturn, ConfigExtraVariable } from "../effectUtils";

export const generateApplyXMultReturn = (
  effect: Effect,
  variableNameMap?: Map<string, string>
): EffectReturn => {
  const effectValue = effect.params.value;
  const parsed = parseGameVariable(effectValue);
  const rangeParsed = parseRangeVariable(effectValue);

  let valueCode: string;
  const configVariables: ConfigExtraVariable[] = [];

  if (parsed.isGameVariable) {
    valueCode = generateGameVariableCode(effectValue);
  } else if (rangeParsed.isRangeVariable) {
    const variableName = "Xmult";
    const actualVariableName =
      variableNameMap?.get(variableName) || variableName;
    const seedName = `${actualVariableName}_${effect.id.substring(0, 8)}`;
    valueCode = `pseudorandom('${seedName}', card.ability.extra.${actualVariableName}_min, card.ability.extra.${actualVariableName}_max)`;

    configVariables.push(
      { name: `${actualVariableName}_min`, value: rangeParsed.min || 1 },
      { name: `${actualVariableName}_max`, value: rangeParsed.max || 5 }
    );
  } else if (typeof effectValue === "string") {
    if (effectValue.endsWith("_value")) {
      valueCode = effectValue;
    } else {
      const actualVariableName =
        variableNameMap?.get(effectValue) || effectValue;
      valueCode = `card.ability.extra.${actualVariableName}`;
    }
  } else {
    const variableName = "Xmult";
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
    statement: `Xmult = ${valueCode}`,
    colour: "",
    configVariables: configVariables.length > 0 ? configVariables : undefined,
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};
