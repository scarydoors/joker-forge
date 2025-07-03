import type { EffectReturn } from "./AddChipsEffect";
import type { Effect } from "../../ruleBuilder/types";
import type { PassiveEffectResult } from "../effectUtils";
import { getEffectVariableName } from "../index";
import {
  generateGameVariableCode,
  parseGameVariable,
} from "../gameVariableUtils";

export const generateEditHandReturn = (effect: Effect): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const effectValue = effect.params.value;
  const parsed = parseGameVariable(effectValue);

  let valueCode: string;

  if (parsed.isGameVariable) {
    valueCode = generateGameVariableCode(effectValue);
  } else if (typeof effectValue === "string") {
    valueCode = `card.ability.extra.${effectValue}`;
  } else {
    const variableName = getEffectVariableName(effect.id, "hands");
    valueCode = `card.ability.extra.${variableName}`;
  }

  const customMessage = effect.customMessage;
  let statement = "";

  switch (operation) {
    case "add": {
      const addMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueCode}).." Hand"`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${addMessage}, colour = G.C.GREEN})
                G.GAME.current_round.hands_left = G.GAME.current_round.hands_left + ${valueCode}
                return true
            end`;
      break;
    }
    case "subtract": {
      const subtractMessage = customMessage
        ? `"${customMessage}"`
        : `"-"..tostring(${valueCode}).." Hand"`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${subtractMessage}, colour = G.C.RED})
                G.GAME.current_round.hands_left = math.max(0, G.GAME.current_round.hands_left - ${valueCode})
                return true
            end`;
      break;
    }
    case "set": {
      const setMessage = customMessage
        ? `"${customMessage}"`
        : `"Set to "..tostring(${valueCode}).." Hands"`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.BLUE})
                G.GAME.current_round.hands_left = ${valueCode}
                return true
            end`;
      break;
    }
    default: {
      const defaultMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueCode}).." Hand"`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${defaultMessage}, colour = G.C.GREEN})
                G.GAME.current_round.hands_left = G.GAME.current_round.hands_left + ${valueCode}
                return true
            end`;
    }
  }

  return {
    statement,
    colour: "G.C.GREEN",
  };
};

export const generatePassiveHand = (effect: Effect): PassiveEffectResult => {
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
    const variableName = "hand_change";
    valueCode = `card.ability.extra.${variableName}`;
    configVariables = [`${variableName} = ${effectValue}`];
  }

  let addToDeck = "";
  let removeFromDeck = "";

  switch (operation) {
    case "add":
      addToDeck = `G.GAME.round_resets.hands = G.GAME.round_resets.hands + ${valueCode}`;
      removeFromDeck = `G.GAME.round_resets.hands = G.GAME.round_resets.hands - ${valueCode}`;
      break;
    case "subtract":
      addToDeck = `G.GAME.round_resets.hands = math.max(1, G.GAME.round_resets.hands - ${valueCode})`;
      removeFromDeck = `G.GAME.round_resets.hands = G.GAME.round_resets.hands + ${valueCode}`;
      break;
    case "set":
      addToDeck = `card.ability.extra.original_hands = G.GAME.round_resets.hands
        G.GAME.round_resets.hands = ${valueCode}`;
      removeFromDeck = `if card.ability.extra.original_hands then
            G.GAME.round_resets.hands = card.ability.extra.original_hands
        end`;
      break;
    default:
      addToDeck = `G.GAME.round_resets.hands = G.GAME.round_resets.hands + ${valueCode}`;
      removeFromDeck = `G.GAME.round_resets.hands = G.GAME.round_resets.hands - ${valueCode}`;
  }

  return {
    addToDeck,
    removeFromDeck,
    configVariables,
    locVars: parsed.isGameVariable ? [] : [valueCode],
  };
};
