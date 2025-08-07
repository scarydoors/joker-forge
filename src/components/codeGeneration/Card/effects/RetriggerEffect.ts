import type { Effect } from "../../../ruleBuilder/types";
import {
  generateGameVariableCode,
  parseGameVariable,
  parseRangeVariable,
} from "../../Jokers/gameVariableUtils";
import type { EffectReturn } from "../effectUtils";

interface ConfigExtraVariable {
  name: string;
  value: number;
}

export const generateRetriggerReturn = (
  effect: Effect,
  sameTypeCount: number = 0
): EffectReturn => {
  const effectValue = effect.params?.times || 1;
  const parsed = parseGameVariable(effectValue);
  const rangeParsed = parseRangeVariable(effectValue);

  let valueCode: string;
  const configVariables: ConfigExtraVariable[] = [];

  const variableName =
    sameTypeCount === 0
      ? "retrigger_times"
      : `retrigger_times${sameTypeCount + 1}`;

  if (parsed.isGameVariable) {
    valueCode = generateGameVariableCode(effectValue);
  } else if (rangeParsed.isRangeVariable) {
    const seedName = `${variableName}_${effect.id.substring(0, 8)}`;
    valueCode = `pseudorandom('${seedName}', card.ability.extra.${variableName}_min, card.ability.extra.${variableName}_max)`;

    configVariables.push(
      { name: `${variableName}_min`, value: rangeParsed.min || 1 },
      { name: `${variableName}_max`, value: rangeParsed.max || 5 }
    );
  } else if (typeof effectValue === "string") {
    if (effectValue.endsWith("_value")) {
      valueCode = effectValue;
    } else {
      valueCode = `card.ability.extra.${effectValue}`;
    }
  } else {
    valueCode = `card.ability.extra.${variableName}`;

    configVariables.push({
      name: variableName,
      value: Number(effectValue) || 1,
    });
  }

  const customMessage = effect.customMessage;

  let statement: string;

  // Only do assignment if valueCode is different from the config variable
  if (valueCode === `card.ability.extra.${variableName}`) {
    // Static value, just set the flag
    statement = `__PRE_RETURN_CODE__card.should_retrigger = true__PRE_RETURN_CODE_END__`;
  } else {
    // Dynamic value, do assignment
    statement = `__PRE_RETURN_CODE__card.should_retrigger = true
            card.ability.extra.${variableName} = ${valueCode}__PRE_RETURN_CODE_END__`;
  }

  const result: EffectReturn = {
    statement: statement,
    colour: "G.C.SECONDARY_SET.Spectral",
    configVariables:
      configVariables.length > 0
        ? configVariables.map((cv) => `${cv.name} = ${cv.value}`)
        : undefined,
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};
