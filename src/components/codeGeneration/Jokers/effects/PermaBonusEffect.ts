import type { Effect } from "../../../ruleBuilder/types";
import {
  generateGameVariableCode,
  parseGameVariable,
  parseRangeVariable,
} from "../gameVariableUtils";
import type { EffectReturn, ConfigExtraVariable } from "../effectUtils";

export const generatePermaBonusReturn = (
  effect: Effect,
  sameTypeCount: number = 0
): EffectReturn => {
  const effectValue = effect.params.value;
  const bonusType = effect.params.bonus_type as string;
  const parsed = parseGameVariable(effectValue);
  const rangeParsed = parseRangeVariable(effectValue);

  let valueCode: string;
  const configVariables: ConfigExtraVariable[] = [];

  const uniqueId = effect.id.substring(0, 8);
  const variableName = `pb_${bonusType.replace("perma_", "")}_${uniqueId}`;

  if (parsed.isGameVariable) {
    valueCode = generateGameVariableCode(effectValue);
  } else if (rangeParsed.isRangeVariable) {
    const seedName = `${variableName}_seed`;
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

  const preReturnCode = `context.other_card.ability.${bonusType} = context.other_card.ability.${bonusType} or 0
                context.other_card.ability.${bonusType} = context.other_card.ability.${bonusType} + ${valueCode}`;

  let color = "G.C.CHIPS";
  if (bonusType.includes("mult")) {
    color = "G.C.MULT";
  } else if (bonusType.includes("dollars")) {
    color = "G.C.MONEY";
  }

  let statement = "";

  if (sameTypeCount === 0) {
    const messageText = customMessage
      ? `"${customMessage}"`
      : "localize('k_upgrade_ex')";
    statement = `__PRE_RETURN_CODE__${preReturnCode}__PRE_RETURN_CODE_END__extra = { message = ${messageText}, colour = ${color} }, card = card`;
  } else {
    statement = `__PRE_RETURN_CODE__${preReturnCode}__PRE_RETURN_CODE_END__`;
  }

  const result: EffectReturn = {
    statement,
    colour: color,
    configVariables: configVariables.length > 0 ? configVariables : undefined,
  };

  return result;
};
