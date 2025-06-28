import type { EffectReturn } from "./AddChipsEffect";
import type { Effect } from "../../ruleBuilder/types";
import type { PassiveEffectResult } from "../effectUtils";
import { getEffectVariableName } from "../index";

export const generateEditHandReturn = (effect: Effect): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const customMessage = effect.customMessage;
  const configVarName = getEffectVariableName(effect.id, "hands");
  let statement = "";

  switch (operation) {
    case "add": {
      const addMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(card.ability.extra.${configVarName}).." Hand"`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${addMessage}, colour = G.C.GREEN})
                G.GAME.current_round.hands_left = G.GAME.current_round.hands_left + card.ability.extra.${configVarName}
                return true
            end`;
      break;
    }
    case "subtract": {
      const subtractMessage = customMessage
        ? `"${customMessage}"`
        : `"-"..tostring(card.ability.extra.${configVarName}).." Hand"`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${subtractMessage}, colour = G.C.RED})
                G.GAME.current_round.hands_left = math.max(0, G.GAME.current_round.hands_left - card.ability.extra.${configVarName})
                return true
            end`;
      break;
    }
    case "set": {
      const setMessage = customMessage
        ? `"${customMessage}"`
        : `"Set to "..tostring(card.ability.extra.${configVarName}).." Hands"`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.BLUE})
                G.GAME.current_round.hands_left = card.ability.extra.${configVarName}
                return true
            end`;
      break;
    }
    default: {
      const defaultMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(card.ability.extra.${configVarName}).." Hand"`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${defaultMessage}, colour = G.C.GREEN})
                G.GAME.current_round.hands_left = G.GAME.current_round.hands_left + card.ability.extra.${configVarName}
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
  const value = effect.params?.value;

  let addToDeck = "";
  let removeFromDeck = "";

  switch (operation) {
    case "add":
      addToDeck = `G.GAME.round_resets.hands = G.GAME.round_resets.hands + card.ability.extra.hand_change`;
      removeFromDeck = `G.GAME.round_resets.hands = G.GAME.round_resets.hands - card.ability.extra.hand_change`;
      break;
    case "subtract":
      addToDeck = `G.GAME.round_resets.hands = math.max(1, G.GAME.round_resets.hands - card.ability.extra.hand_change)`;
      removeFromDeck = `G.GAME.round_resets.hands = G.GAME.round_resets.hands + card.ability.extra.hand_change`;
      break;
    case "set":
      addToDeck = `card.ability.extra.original_hands = G.GAME.round_resets.hands
        G.GAME.round_resets.hands = card.ability.extra.hand_change`;
      removeFromDeck = `if card.ability.extra.original_hands then
            G.GAME.round_resets.hands = card.ability.extra.original_hands
        end`;
      break;
    default:
      addToDeck = `G.GAME.round_resets.hands = G.GAME.round_resets.hands + card.ability.extra.hand_change`;
      removeFromDeck = `G.GAME.round_resets.hands = G.GAME.round_resets.hands - card.ability.extra.hand_change`;
  }

  return {
    addToDeck,
    removeFromDeck,
    configVariables: [`hand_change = ${value}`],
    locVars: [`card.ability.extra.hand_change`],
  };
};
