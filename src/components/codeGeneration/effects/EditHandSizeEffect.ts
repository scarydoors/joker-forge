import type { EffectReturn } from "./AddChipsEffect";
import type { Effect } from "../../ruleBuilder/types";
import type { PassiveEffectResult } from "../PassiveEffects";

export const generateEditHandSizeReturn = (effect: Effect): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const customMessage = effect.customMessage;
  let statement = "";

  switch (operation) {
    case "add": {
      const addMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(card.ability.extra.hand_size_change).." Hand Size"`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${addMessage}, colour = G.C.BLUE})
                G.hand:change_size(card.ability.extra.hand_size_change)
                return true
            end`;
      break;
    }
    case "subtract": {
      const subtractMessage = customMessage
        ? `"${customMessage}"`
        : `"-"..tostring(card.ability.extra.hand_size_change).." Hand Size"`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${subtractMessage}, colour = G.C.RED})
                G.hand:change_size(-card.ability.extra.hand_size_change)
                return true
            end`;
      break;
    }
    case "set": {
      const setMessage = customMessage
        ? `"${customMessage}"`
        : `"Hand Size set to "..tostring(target_hand_size)`;
      statement = `func = function()
                local current_hand_size = G.hand.config.card_limit
                local target_hand_size = card.ability.extra.hand_size_change
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
        : `"+"..tostring(card.ability.extra.hand_size_change).." Hand Size"`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${defaultMessage}, colour = G.C.BLUE})
                G.hand:change_size(card.ability.extra.hand_size_change)
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
  const value = effect.params?.value || 1;

  let addToDeck = "";
  let removeFromDeck = "";

  switch (operation) {
    case "add":
      addToDeck = `G.hand:change_size(card.ability.extra.hand_size_change)`;
      removeFromDeck = `G.hand:change_size(-card.ability.extra.hand_size_change)`;
      break;
    case "subtract":
      addToDeck = `G.hand:change_size(-card.ability.extra.hand_size_change)`;
      removeFromDeck = `G.hand:change_size(card.ability.extra.hand_size_change)`;
      break;
    case "set":
      addToDeck = `card.ability.extra.original_hand_size = G.hand.config.card_limit
        local difference = card.ability.extra.hand_size_change - G.hand.config.card_limit
        G.hand:change_size(difference)`;
      removeFromDeck = `if card.ability.extra.original_hand_size then
            local difference = card.ability.extra.original_hand_size - G.hand.config.card_limit
            G.hand:change_size(difference)
        end`;
      break;
    default:
      addToDeck = `G.hand:change_size(card.ability.extra.hand_size_change)`;
      removeFromDeck = `G.hand:change_size(-card.ability.extra.hand_size_change)`;
  }

  return {
    addToDeck,
    removeFromDeck,
    configVariables: [`hand_size_change = ${value}`],
    locVars: [`card.ability.extra.hand_size_change`],
  };
};
