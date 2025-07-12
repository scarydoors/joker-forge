import type { EffectReturn, ConfigExtraVariable } from "../effectUtils";
import type { Effect } from "../../ruleBuilder/types";
import type { PassiveEffectResult } from "../effectUtils";
import {
  generateGameVariableCode,
  parseGameVariable,
  parseRangeVariable,
} from "../gameVariableUtils";

export const generateEditDiscardReturn = (
  effect: Effect,
  variableNameMap?: Map<string, string>
): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const effectValue = effect.params.value;
  const parsed = parseGameVariable(effectValue);
  const rangeParsed = parseRangeVariable(effectValue);

  let valueCode: string;
  const configVariables: ConfigExtraVariable[] = [];

  if (parsed.isGameVariable) {
    valueCode = generateGameVariableCode(effectValue);
  } else if (rangeParsed.isRangeVariable) {
    const variableName = "discards";
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
    const variableName = "discards";
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
        : `"+"..tostring(${valueCode}).." Discard"`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${addMessage}, colour = G.C.ORANGE})
                G.GAME.current_round.discards_left = G.GAME.current_round.discards_left + ${valueCode}
                return true
            end`;
      break;
    }
    case "subtract": {
      const subtractMessage = customMessage
        ? `"${customMessage}"`
        : `"-"..tostring(${valueCode}).." Discard"`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${subtractMessage}, colour = G.C.RED})
                G.GAME.current_round.discards_left = math.max(0, G.GAME.current_round.discards_left - ${valueCode})
                return true
            end`;
      break;
    }
    case "set": {
      const setMessage = customMessage
        ? `"${customMessage}"`
        : `"Set to "..tostring(${valueCode}).." Discards"`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.BLUE})
                G.GAME.current_round.discards_left = ${valueCode}
                return true
            end`;
      break;
    }
    default: {
      const defaultMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueCode}).." Discard"`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${defaultMessage}, colour = G.C.ORANGE})
                G.GAME.current_round.discards_left = G.GAME.current_round.discards_left + ${valueCode}
                return true
            end`;
    }
  }

  return {
    statement,
    colour: "G.C.ORANGE",
    configVariables: configVariables.length > 0 ? configVariables : undefined,
  };
};

export const generatePassiveDiscard = (effect: Effect): PassiveEffectResult => {
  const operation = effect.params?.operation || "add";
  const effectValue = effect.params.value;
  const parsed = parseGameVariable(effectValue);
  const rangeParsed = parseRangeVariable(effectValue);

  let valueCode: string;
  let configVariables: string[] = [];

  if (parsed.isGameVariable) {
    valueCode = generateGameVariableCode(effectValue);
  } else if (rangeParsed.isRangeVariable) {
    const variableName = "discard_change";
    valueCode = `pseudorandom('discard_change', card.ability.extra.${variableName}_min, card.ability.extra.${variableName}_max)`;
    configVariables = [
      `${variableName}_min = ${rangeParsed.min}`,
      `${variableName}_max = ${rangeParsed.max}`,
    ];
  } else if (typeof effectValue === "string") {
    valueCode = `card.ability.extra.${effectValue}`;
  } else {
    const variableName = "discard_change";
    valueCode = `card.ability.extra.${variableName}`;
    configVariables = [`${variableName} = ${effectValue}`];
  }

  let addToDeck = "";
  let removeFromDeck = "";

  switch (operation) {
    case "add":
      addToDeck = `G.GAME.round_resets.discards = G.GAME.round_resets.discards + ${valueCode}`;
      removeFromDeck = `G.GAME.round_resets.discards = G.GAME.round_resets.discards - ${valueCode}`;
      break;
    case "subtract":
      addToDeck = `G.GAME.round_resets.discards = math.max(0, G.GAME.round_resets.discards - ${valueCode})`;
      removeFromDeck = `G.GAME.round_resets.discards = G.GAME.round_resets.discards + ${valueCode}`;
      break;
    case "set":
      addToDeck = `card.ability.extra.original_discards = G.GAME.round_resets.discards
        G.GAME.round_resets.discards = ${valueCode}`;
      removeFromDeck = `if card.ability.extra.original_discards then
            G.GAME.round_resets.discards = card.ability.extra.original_discards
        end`;
      break;
    default:
      addToDeck = `G.GAME.round_resets.discards = G.GAME.round_resets.discards + ${valueCode}`;
      removeFromDeck = `G.GAME.round_resets.discards = G.GAME.round_resets.discards - ${valueCode}`;
  }

  return {
    addToDeck,
    removeFromDeck,
    configVariables,
    locVars:
      parsed.isGameVariable || rangeParsed.isRangeVariable ? [] : [valueCode],
  };
};
