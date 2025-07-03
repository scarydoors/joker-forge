import type { EffectReturn } from "./AddChipsEffect";
import type { Effect } from "../../ruleBuilder/types";
import type { PassiveEffectResult } from "../effectUtils";
import { getEffectVariableName } from "../index";
import {
  generateGameVariableCode,
  parseGameVariable,
} from "../gameVariableUtils";

export const generateEditDiscardReturn = (effect: Effect): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const effectValue = effect.params.value;
  const parsed = parseGameVariable(effectValue);

  let valueCode: string;

  if (parsed.isGameVariable) {
    valueCode = generateGameVariableCode(effectValue);
  } else if (typeof effectValue === "string") {
    valueCode = `card.ability.extra.${effectValue}`;
  } else {
    const variableName = getEffectVariableName(effect.id, "discards");
    valueCode = `card.ability.extra.${variableName}`;
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
  };
};

export const generatePassiveDiscard = (effect: Effect): PassiveEffectResult => {
  const operation = effect.params?.operation || "add";
  const effectValue = effect.params.value;
  const parsed = parseGameVariable(effectValue);

  let valueCode: string;
  let configVariables: string[] = [];

  if (parsed.isGameVariable) {
    valueCode = generateGameVariableCode(effectValue);
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
    locVars: parsed.isGameVariable ? [] : [valueCode],
  };
};
