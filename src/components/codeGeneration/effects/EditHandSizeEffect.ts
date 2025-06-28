import type { EffectReturn } from "./AddChipsEffect";
import type { Effect } from "../../ruleBuilder/types";
import type { PassiveEffectResult } from "../effectUtils";

export const generateEditHandSizeReturn = (effect: Effect): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const value = effect.params?.value;
  const customMessage = effect.customMessage;

  const isVariableReference = typeof value === "string";
  const valueReference = isVariableReference
    ? `card.ability.extra.${value}`
    : value;

  let statement = "";

  switch (operation) {
    case "add": {
      const addMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueReference}).." Hand Size"`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${addMessage}, colour = G.C.BLUE})
                G.hand:change_size(${valueReference})
                return true
            end`;
      break;
    }
    case "subtract": {
      const subtractMessage = customMessage
        ? `"${customMessage}"`
        : `"-"..tostring(${valueReference}).." Hand Size"`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${subtractMessage}, colour = G.C.RED})
                G.hand:change_size(-${valueReference})
                return true
            end`;
      break;
    }
    case "set": {
      const setMessage = customMessage
        ? `"${customMessage}"`
        : `"Hand Size set to "..tostring(${valueReference})`;
      statement = `func = function()
                local current_hand_size = G.hand.config.card_limit
                local target_hand_size = ${valueReference}
                local difference = target_hand_size - current_hand_size
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.BLUE})
                G.hand:change_size(difference)
                return true
            end`;
      break;
    }
    default: {
      const defaultMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueReference}).." Hand Size"`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${defaultMessage}, colour = G.C.BLUE})
                G.hand:change_size(${valueReference})
                return true
            end`;
    }
  }

  return {
    statement,
    colour: "G.C.BLUE",
  };
};

export const generatePassiveHandSize = (
  effect: Effect
): PassiveEffectResult => {
  const operation = effect.params?.operation || "add";
  const value = effect.params?.value;

  const isVariableReference = typeof value === "string";
  const valueReference = isVariableReference
    ? `card.ability.extra.${value}`
    : value;

  let addToDeck = "";
  let removeFromDeck = "";

  switch (operation) {
    case "add":
      addToDeck = `G.hand:change_size(${valueReference})`;
      removeFromDeck = `G.hand:change_size(-${valueReference})`;
      break;
    case "subtract":
      addToDeck = `G.hand:change_size(-${valueReference})`;
      removeFromDeck = `G.hand:change_size(${valueReference})`;
      break;
    case "set":
      addToDeck = `card.ability.extra.original_hand_size = G.hand.config.card_limit
        local difference = ${valueReference} - G.hand.config.card_limit
        G.hand:change_size(difference)`;
      removeFromDeck = `if card.ability.extra.original_hand_size then
            local difference = card.ability.extra.original_hand_size - G.hand.config.card_limit
            G.hand:change_size(difference)
        end`;
      break;
    default:
      addToDeck = `G.hand:change_size(${valueReference})`;
      removeFromDeck = `G.hand:change_size(-${valueReference})`;
  }

  return {
    addToDeck,
    removeFromDeck,
    configVariables: [],
    locVars: [],
  };
};
