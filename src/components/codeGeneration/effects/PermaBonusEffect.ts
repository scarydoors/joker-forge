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

export const generatePermaBonusReturn = (effect: Effect): EffectReturn => {
  const effectValue = effect.params.value;
  const bonusType = effect.params.bonus_type as string;
  const parsed = parseGameVariable(effectValue);
  const rangeParsed = parseRangeVariable(effectValue);

  let valueCode: string;

  if (parsed.isGameVariable) {
    valueCode = generateGameVariableCode(effectValue);
  } else if (rangeParsed.isRangeVariable) {
    const variableName = getEffectVariableName(effect.id, "perma_bonus");
    const seedName = `${variableName}_${effect.id.substring(0, 8)}`;
    valueCode = `pseudorandom('${seedName}', card.ability.extra.${variableName}_min, card.ability.extra.${variableName}_max)`;
  } else if (typeof effectValue === "string") {
    if (effectValue.endsWith("_value")) {
      valueCode = effectValue;
    } else {
      valueCode = `card.ability.extra.${effectValue}`;
    }
  } else {
    valueCode = (effectValue as number | string).toString();
  }

  const customMessage = effect.customMessage;

  const preReturnCode = `context.other_card.ability.${bonusType} = context.other_card.ability.${bonusType} or 0
                context.other_card.ability.${bonusType} = context.other_card.ability.${bonusType} + ${valueCode}`;

  const result: EffectReturn = {
    statement: `__PRE_RETURN_CODE__${preReturnCode}__PRE_RETURN_CODE_END__extra = { message = localize('k_upgrade_ex'), colour = G.C.CHIPS }, card = card`,
    colour: "G.C.CHIPS",
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};
