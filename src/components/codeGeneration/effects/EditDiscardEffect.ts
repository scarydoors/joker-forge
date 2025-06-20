import type { EffectReturn } from "./AddChipsEffect";
import type { Effect } from "../../ruleBuilder/types";
import type { PassiveEffectResult } from "../PassiveEffects";

export const generateEditDiscardReturn = (effect: Effect): EffectReturn => {
  const operation = effect.params?.operation || "add";
  let statement = "";

  switch (operation) {
    case "add":
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = "+"..tostring(card.ability.extra.discards).." Discard", colour = G.C.ORANGE})
                G.GAME.current_round.discards_left = G.GAME.current_round.discards_left + card.ability.extra.discards
                return true
            end`;
      break;
    case "subtract":
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = "-"..tostring(card.ability.extra.discards).." Discard", colour = G.C.RED})
                G.GAME.current_round.discards_left = math.max(0, G.GAME.current_round.discards_left - card.ability.extra.discards)
                return true
            end`;
      break;
    case "set":
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = "Set to "..tostring(card.ability.extra.discards).." Discards", colour = G.C.BLUE})
                G.GAME.current_round.discards_left = card.ability.extra.discards
                return true
            end`;
      break;
    default:
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = "+"..tostring(card.ability.extra.discards).." Discard", colour = G.C.ORANGE})
                G.GAME.current_round.discards_left = G.GAME.current_round.discards_left + card.ability.extra.discards
                return true
            end`;
  }

  return {
    statement,
    colour: "G.C.ORANGE",
  };
};

export const generatePassiveDiscard = (effect: Effect): PassiveEffectResult => {
  const operation = effect.params?.operation || "add";
  const value = effect.params?.value || 1;

  let addToDeck = "";
  let removeFromDeck = "";

  switch (operation) {
    case "add":
      addToDeck = `G.GAME.round_resets.discards = G.GAME.round_resets.discards + card.ability.extra.discard_change`;
      removeFromDeck = `G.GAME.round_resets.discards = G.GAME.round_resets.discards - card.ability.extra.discard_change`;
      break;
    case "subtract":
      addToDeck = `G.GAME.round_resets.discards = math.max(0, G.GAME.round_resets.discards - card.ability.extra.discard_change)`;
      removeFromDeck = `G.GAME.round_resets.discards = G.GAME.round_resets.discards + card.ability.extra.discard_change`;
      break;
    case "set":
      addToDeck = `card.ability.extra.original_discards = G.GAME.round_resets.discards
        G.GAME.round_resets.discards = card.ability.extra.discard_change`;
      removeFromDeck = `if card.ability.extra.original_discards then
            G.GAME.round_resets.discards = card.ability.extra.original_discards
        end`;
      break;
    default:
      addToDeck = `G.GAME.round_resets.discards = G.GAME.round_resets.discards + card.ability.extra.discard_change`;
      removeFromDeck = `G.GAME.round_resets.discards = G.GAME.round_resets.discards - card.ability.extra.discard_change`;
  }

  return {
    addToDeck,
    removeFromDeck,
    configVariables: [`discard_change = ${value}`],
    locVars: [`card.ability.extra.discard_change`],
  };
};
