import type { Effect } from "../../../ruleBuilder/types";
import {
  generateGameVariableCode,
  parseGameVariable,
  parseRangeVariable,
} from "../gameVariableUtils";
import type { EffectReturn, ConfigExtraVariable } from "../effectUtils";

export const generateSetDollarsReturn = (
  effect: Effect,
  sameTypeCount: number = 0
): EffectReturn => {
  const operation = (effect.params?.operation as string) || "add";
  const effectValue = effect.params.value;
  const parsed = parseGameVariable(effectValue);
  const rangeParsed = parseRangeVariable(effectValue);

  let valueCode: string;
  const configVariables: ConfigExtraVariable[] = [];

  const variableName =
    sameTypeCount === 0 ? "dollars" : `dollars${sameTypeCount + 1}`;

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
      value: Number(effectValue ?? 5),
    });
  }

  const customMessage = effect.customMessage;

  let result: EffectReturn;

  switch (operation) {
    case "add": {
      result = {
        statement: `dollars = ${valueCode}`,
        colour: "G.C.MONEY",
        configVariables:
          configVariables.length > 0 ? configVariables : undefined,
      };

      if (customMessage) {
        result.message = `"${customMessage}"`;
      }
      break;
    }

    case "subtract": {
      result = {
        statement: `dollars = -${valueCode}`,
        colour: "G.C.MONEY",
        configVariables:
          configVariables.length > 0 ? configVariables : undefined,
      };

      if (customMessage) {
        result.message = `"${customMessage}"`;
      }
      break;
    }

    case "set": {
      const setMessage = customMessage
        ? `"${customMessage}"`
        : `"Set to $"..tostring(${valueCode})`;

      result = {
        statement: `func = function()
                    local target_amount = ${valueCode}
                    local current_amount = G.GAME.dollars
                    local difference = target_amount - current_amount
                    ease_dollars(difference)
                    card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.MONEY})
                    return true
                end`,
        colour: "G.C.MONEY",
        configVariables:
          configVariables.length > 0 ? configVariables : undefined,
      };
      break;
    }

    default: {
      result = {
        statement: `dollars = ${valueCode}`,
        colour: "G.C.MONEY",
        configVariables:
          configVariables.length > 0 ? configVariables : undefined,
      };

      if (customMessage) {
        result.message = `"${customMessage}"`;
      }
    }
  }

  return result;
};
