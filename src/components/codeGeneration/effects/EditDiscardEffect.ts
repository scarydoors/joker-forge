import type { EffectReturn } from "./AddChipsEffect";
import type { Effect } from "../../ruleBuilder/types";

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
