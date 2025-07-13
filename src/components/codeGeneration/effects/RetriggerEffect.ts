import type { Effect } from "../../ruleBuilder/types";
import {
  generateGameVariableCode,
  parseGameVariable,
  parseRangeVariable,
} from "../gameVariableUtils";
import type { EffectReturn, ConfigExtraVariable } from "../effectUtils";

export const generateRetriggerReturn = (
  effect: Effect,
  variableNameMap?: Map<string, string>,
  sameTypeCount: number = 0
): EffectReturn => {
  const repetitionsValue = effect.params.repetitions;
  const parsed = parseGameVariable(repetitionsValue);
  const rangeParsed = parseRangeVariable(repetitionsValue);

  let valueCode: string;
  const configVariables: ConfigExtraVariable[] = [];

  // Determine variable name based on how many effects of the same type came before this one
  const variableName =
    sameTypeCount === 0 ? "repetitions" : `repetitions${sameTypeCount + 1}`;
  const actualVariableName = variableNameMap?.get(variableName) || variableName;

  if (parsed.isGameVariable) {
    valueCode = generateGameVariableCode(repetitionsValue);
  } else if (rangeParsed.isRangeVariable) {
    const seedName = `${actualVariableName}_${effect.id.substring(0, 8)}`;
    valueCode = `pseudorandom('${seedName}', card.ability.extra.${actualVariableName}_min, card.ability.extra.${actualVariableName}_max)`;

    configVariables.push(
      { name: `${actualVariableName}_min`, value: rangeParsed.min || 1 },
      { name: `${actualVariableName}_max`, value: rangeParsed.max || 5 }
    );
  } else if (typeof repetitionsValue === "string") {
    if (repetitionsValue.endsWith("_value")) {
      valueCode = repetitionsValue;
    } else {
      const mappedVarName =
        variableNameMap?.get(repetitionsValue) || repetitionsValue;
      valueCode = `card.ability.extra.${mappedVarName}`;
    }
  } else {
    valueCode = `card.ability.extra.${actualVariableName}`;

    configVariables.push({
      name: actualVariableName,
      value: Number(repetitionsValue) || 1,
    });
  }

  const customMessage = effect.customMessage;
  const messageCode = customMessage
    ? `"${customMessage}"`
    : "localize('k_again_ex')";

  return {
    statement: `repetitions = ${valueCode}`,
    message: messageCode,
    colour: "G.C.RED",
    configVariables: configVariables.length > 0 ? configVariables : undefined,
  };
};
