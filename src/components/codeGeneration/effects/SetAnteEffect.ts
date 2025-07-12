import type { Effect } from "../../ruleBuilder/types";
import {
  generateGameVariableCode,
  parseGameVariable,
  parseRangeVariable,
} from "../gameVariableUtils";
import type { EffectReturn, ConfigExtraVariable } from "../effectUtils";

export const generateSetAnteReturn = (
  effect: Effect,
  triggerType: string,
  variableNameMap?: Map<string, string>
): EffectReturn => {
  const operation = (effect.params?.operation as string) || "set";
  const effectValue = effect.params.value;
  const parsed = parseGameVariable(effectValue);
  const rangeParsed = parseRangeVariable(effectValue);

  let valueCode: string;
  const configVariables: ConfigExtraVariable[] = [];

  if (parsed.isGameVariable) {
    valueCode = generateGameVariableCode(effectValue);
  } else if (rangeParsed.isRangeVariable) {
    const variableName = "ante_value";
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
    const variableName = "ante_value";
    const actualVariableName =
      variableNameMap?.get(variableName) || variableName;
    valueCode = `card.ability.extra.${actualVariableName}`;

    configVariables.push({
      name: actualVariableName,
      value: Number(effectValue) || 1,
    });
  }

  const customMessage = effect.customMessage;

  let anteCode = "";
  let messageText = "";

  switch (operation) {
    case "set":
      anteCode = `G.GAME.round_resets.ante = ${valueCode}`;
      messageText = customMessage || `"Ante set to " .. ${valueCode} .. "!"`;
      break;
    case "add":
      anteCode = `G.GAME.round_resets.ante = G.GAME.round_resets.ante + ${valueCode}`;
      messageText = customMessage || `"Ante +" .. ${valueCode}`;
      break;
    case "subtract":
      anteCode = `G.GAME.round_resets.ante = G.GAME.round_resets.ante - ${valueCode}`;
      messageText = customMessage || `"Ante -" .. ${valueCode}`;
      break;
    default:
      anteCode = `G.GAME.round_resets.ante = ${valueCode}`;
      messageText = customMessage || `"Ante set to " .. ${valueCode} .. "!"`;
  }

  const scoringTriggers = ["hand_played", "card_scored"];
  const isScoring = scoringTriggers.includes(triggerType);

  const result: EffectReturn = {
    statement: isScoring
      ? `__PRE_RETURN_CODE__${anteCode}
                __PRE_RETURN_CODE_END__`
      : `func = function()
                    ${anteCode}
                    return true
                end`,
    message: customMessage ? `"${customMessage}"` : messageText,
    colour: "G.C.FILTER",
    configVariables: configVariables.length > 0 ? configVariables : undefined,
  };

  return result;
};
