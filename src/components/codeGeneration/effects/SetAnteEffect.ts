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

export const generateSetAnteReturn = (
  effect: Effect,
  triggerType: string
): EffectReturn => {
  const operation = (effect.params?.operation as string) || "set";
  const effectValue = effect.params.value;
  const parsed = parseGameVariable(effectValue);
  const rangeParsed = parseRangeVariable(effectValue);

  let valueCode: string;

  if (parsed.isGameVariable) {
    valueCode = generateGameVariableCode(effectValue);
  } else if (rangeParsed.isRangeVariable) {
    const variableName = getEffectVariableName(effect.id, "ante_value");
    const seedName = `${variableName}_${effect.id.substring(0, 8)}`;
    valueCode = `pseudorandom('${seedName}', card.ability.extra.${variableName}_min, card.ability.extra.${variableName}_max)`;
  } else if (typeof effectValue === "string") {
    if (effectValue.endsWith("_value")) {
      valueCode = effectValue;
    } else {
      valueCode = `card.ability.extra.${effectValue}`;
    }
  } else {
    const variableName = getEffectVariableName(effect.id, "ante_value");
    valueCode = `card.ability.extra.${variableName}`;
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

  if (isScoring) {
    return {
      statement: `__PRE_RETURN_CODE__${anteCode}
                __PRE_RETURN_CODE_END__`,
      message: customMessage ? `"${customMessage}"` : messageText,
      colour: "G.C.FILTER",
    };
  } else {
    return {
      statement: `func = function()
                    ${anteCode}
                    return true
                end`,
      message: customMessage ? `"${customMessage}"` : messageText,
      colour: "G.C.FILTER",
    };
  }
};
