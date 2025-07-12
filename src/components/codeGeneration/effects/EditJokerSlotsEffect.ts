import type { EffectReturn, ConfigExtraVariable } from "../effectUtils";
import type { Effect } from "../../ruleBuilder/types";
import type { PassiveEffectResult } from "../effectUtils";
import {
  generateGameVariableCode,
  parseGameVariable,
  parseRangeVariable,
} from "../gameVariableUtils";

export const generateEditJokerSlotsReturn = (
  effect: Effect,
  variableNameMap?: Map<string, string>
): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const effectValue = effect.params.value || 1;
  const parsed = parseGameVariable(effectValue);
  const rangeParsed = parseRangeVariable(effectValue);

  let valueCode: string;
  const configVariables: ConfigExtraVariable[] = [];

  if (parsed.isGameVariable) {
    valueCode = generateGameVariableCode(effectValue);
  } else if (rangeParsed.isRangeVariable) {
    const variableName = "joker_slots";
    const actualVariableName =
      variableNameMap?.get(variableName) || variableName;
    const seedName = `${actualVariableName}_${effect.id.substring(0, 8)}`;
    valueCode = `pseudorandom('${seedName}', card.ability.extra.${actualVariableName}_min, card.ability.extra.${actualVariableName}_max)`;

    configVariables.push(
      { name: `${actualVariableName}_min`, value: rangeParsed.min || 1 },
      { name: `${actualVariableName}_max`, value: rangeParsed.max || 5 }
    );
  } else if (typeof effectValue === "string") {
    const actualVariableName = variableNameMap?.get(effectValue) || effectValue;
    valueCode = `card.ability.extra.${actualVariableName}`;
  } else {
    const variableName = "joker_slots";
    const actualVariableName =
      variableNameMap?.get(variableName) || variableName;
    valueCode = `card.ability.extra.${actualVariableName}`;

    configVariables.push({
      name: actualVariableName,
      value: Number(effectValue) || 1,
    });
  }

  const customMessage = effect.customMessage;
  let statement = "";

  switch (operation) {
    case "add": {
      const addMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueCode}).." Joker Slot"`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${addMessage}, colour = G.C.DARK_EDITION})
                G.jokers.config.card_limit = G.jokers.config.card_limit + ${valueCode}
                return true
            end`;
      break;
    }
    case "subtract": {
      const subtractMessage = customMessage
        ? `"${customMessage}"`
        : `"-"..tostring(${valueCode}).." Joker Slot"`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${subtractMessage}, colour = G.C.RED})
                G.jokers.config.card_limit = math.max(1, G.jokers.config.card_limit - ${valueCode})
                return true
            end`;
      break;
    }
    case "set": {
      const setMessage = customMessage
        ? `"${customMessage}"`
        : `"Joker Slots set to "..tostring(${valueCode})`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.BLUE})
                G.jokers.config.card_limit = ${valueCode}
                return true
            end`;
      break;
    }
    default: {
      const defaultMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueCode}).." Joker Slot"`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${defaultMessage}, colour = G.C.DARK_EDITION})
                G.jokers.config.card_limit = G.jokers.config.card_limit + ${valueCode}
                return true
            end`;
    }
  }

  return {
    statement,
    colour: "G.C.DARK_EDITION",
    configVariables: configVariables.length > 0 ? configVariables : undefined,
  };
};

export const generatePassiveJokerSlots = (
  effect: Effect
): PassiveEffectResult => {
  const operation = effect.params?.operation || "add";
  const effectValue = effect.params.value;
  const parsed = parseGameVariable(effectValue);
  const rangeParsed = parseRangeVariable(effectValue);

  let valueCode: string;

  if (parsed.isGameVariable) {
    valueCode = generateGameVariableCode(effectValue as string);
  } else if (rangeParsed.isRangeVariable) {
    const seedName = `jokerslots_passive`;
    valueCode = `pseudorandom('${seedName}', ${rangeParsed.min}, ${rangeParsed.max})`;
  } else if (typeof effectValue === "string") {
    valueCode = `card.ability.extra.${effectValue}`;
  } else {
    valueCode = (effectValue as number | boolean).toString();
  }

  let addToDeck = "";
  let removeFromDeck = "";

  switch (operation) {
    case "add":
      addToDeck = `G.jokers.config.card_limit = G.jokers.config.card_limit + ${valueCode}`;
      removeFromDeck = `G.jokers.config.card_limit = G.jokers.config.card_limit - ${valueCode}`;
      break;
    case "subtract":
      addToDeck = `G.jokers.config.card_limit = math.max(1, G.jokers.config.card_limit - ${valueCode})`;
      removeFromDeck = `G.jokers.config.card_limit = G.jokers.config.card_limit + ${valueCode}`;
      break;
    case "set":
      addToDeck = `card.ability.extra.original_joker_slots = G.jokers.config.card_limit
        G.jokers.config.card_limit = ${valueCode}`;
      removeFromDeck = `if card.ability.extra.original_joker_slots then
            G.jokers.config.card_limit = card.ability.extra.original_joker_slots
        end`;
      break;
    default:
      addToDeck = `G.jokers.config.card_limit = G.jokers.config.card_limit + ${valueCode}`;
      removeFromDeck = `G.jokers.config.card_limit = G.jokers.config.card_limit - ${valueCode}`;
  }

  return {
    addToDeck,
    removeFromDeck,
    configVariables: [],
    locVars: [],
  };
};
