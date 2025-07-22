import type { Effect } from "../../../ruleBuilder/types";
import {
  generateGameVariableCode,
  parseGameVariable,
  parseRangeVariable,
} from "../gameVariableUtils";
import type { EffectReturn, ConfigExtraVariable } from "../effectUtils";

export const generateSetAnteReturn = (
  effect: Effect,
  triggerType: string,
  sameTypeCount: number = 0
): EffectReturn => {
  const operation = (effect.params?.operation as string) || "set";
  const effectValue = effect.params.value;
  const parsed = parseGameVariable(effectValue);
  const rangeParsed = parseRangeVariable(effectValue);

  let valueCode: string;
  const configVariables: ConfigExtraVariable[] = [];

  const variableName =
    sameTypeCount === 0 ? "ante_value" : `ante_value${sameTypeCount + 1}`;

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
  let anteCode = "";
  let messageText = "";

  switch (operation) {
    case "set":
      anteCode = `local mod = ${valueCode} - G.GAME.round_resets.ante
		ease_ante(mod)
		G.E_MANAGER:add_event(Event({
			func = function()
				G.GAME.round_resets.blind_ante = ${valueCode}
				return true
			end,
		}))`;
      messageText = customMessage || `"Ante set to " .. ${valueCode} .. "!"`;
      break;
    case "add":
      anteCode = `local mod = ${valueCode}
		ease_ante(mod)
		G.E_MANAGER:add_event(Event({
			func = function()
				G.GAME.round_resets.blind_ante = G.GAME.round_resets.blind_ante + mod
				return true
			end,
		}))`;
      messageText = customMessage || `"Ante +" .. ${valueCode}`;
      break;
    case "subtract":
      anteCode = `local mod = -${valueCode}
		ease_ante(mod)
		G.E_MANAGER:add_event(Event({
			func = function()
				G.GAME.round_resets.blind_ante = G.GAME.round_resets.blind_ante + mod
				return true
			end,
		}))`;
      messageText = customMessage || `"Ante -" .. ${valueCode}`;
      break;
    default:
      anteCode = `local mod = ${valueCode} - G.GAME.round_resets.ante
		ease_ante(mod)
		G.E_MANAGER:add_event(Event({
			func = function()
				G.GAME.round_resets.blind_ante = ${valueCode}
				return true
			end,
		}))`;
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
