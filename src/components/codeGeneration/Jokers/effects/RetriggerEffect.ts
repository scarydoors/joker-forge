import type { Effect } from "../../../ruleBuilder/types";
import {
  generateGameVariableCode,
  parseGameVariable,
  parseRangeVariable,
} from "../gameVariableUtils";
import type { EffectReturn, ConfigExtraVariable } from "../effectUtils";

export const generateRetriggerReturn = (
  effect: Effect,
  sameTypeCount: number = 0
): EffectReturn => {
  const repetitionsValue = effect.params.repetitions;
  const parsed = parseGameVariable(repetitionsValue);
  const rangeParsed = parseRangeVariable(repetitionsValue);

  let valueCode: string;
  const configVariables: ConfigExtraVariable[] = [];

  const variableName =
    sameTypeCount === 0 ? "repetitions" : `repetitions${sameTypeCount + 1}`;

  if (parsed.isGameVariable) {
    valueCode = generateGameVariableCode(repetitionsValue);
  } else if (rangeParsed.isRangeVariable) {
    const seedName = `${variableName}_${effect.id.substring(0, 8)}`;
    valueCode = `pseudorandom('${seedName}', card.ability.extra.${variableName}_min, card.ability.extra.${variableName}_max)`;

    configVariables.push(
      { name: `${variableName}_min`, value: rangeParsed.min || 1 },
      { name: `${variableName}_max`, value: rangeParsed.max || 5 }
    );
  } else if (typeof repetitionsValue === "string") {
    if (repetitionsValue.endsWith("_value")) {
      valueCode = repetitionsValue;
    } else {
      valueCode = `card.ability.extra.${repetitionsValue}`;
    }
  } else {
    valueCode = `card.ability.extra.${variableName}`;

    configVariables.push({
      name: variableName,
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
