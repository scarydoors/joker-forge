import type { Effect } from "../../ruleBuilder/types";
import {
  generateGameVariableCode,
  parseGameVariable,
  parseRangeVariable,
} from "../gameVariableUtils";
import type { EffectReturn, ConfigExtraVariable } from "../effectUtils";

export const generateSetDollarsReturn = (
  effect: Effect,
  variableNameMap?: Map<string, string>,
  sameTypeCount: number = 0
): EffectReturn => {
  const effectValue = effect.params.value;
  const parsed = parseGameVariable(effectValue);
  const rangeParsed = parseRangeVariable(effectValue);

  let valueCode: string;
  const configVariables: ConfigExtraVariable[] = [];

  // Determine variable name based on how many effects of the same type came before this one
  const variableName =
    sameTypeCount === 0 ? "set_dollars" : `set_dollars${sameTypeCount + 1}`;
  const actualVariableName = variableNameMap?.get(variableName) || variableName;

  if (parsed.isGameVariable) {
    valueCode = generateGameVariableCode(effectValue);
  } else if (rangeParsed.isRangeVariable) {
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
      const mappedVarName = variableNameMap?.get(effectValue) || effectValue;
      valueCode = `card.ability.extra.${mappedVarName}`;
    }
  } else {
    valueCode = `card.ability.extra.${actualVariableName}`;

    configVariables.push({
      name: actualVariableName,
      value: Number(effectValue) || 10,
    });
  }

  const customMessage = effect.customMessage;
  const setMessage = customMessage
    ? `"${customMessage}"`
    : `"Set to $"..tostring(${valueCode})`;

  const result: EffectReturn = {
    statement: `func = function()
                local target_amount = ${valueCode}
                local current_amount = G.GAME.dollars
                local difference = target_amount - current_amount
                ease_dollars(difference)
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.MONEY})
                return true
            end`,
    colour: "G.C.MONEY",
    configVariables: configVariables.length > 0 ? configVariables : undefined,
  };

  return result;
};
