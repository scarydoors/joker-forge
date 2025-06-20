import type { EffectReturn } from "./AddChipsEffect";
import type { Effect } from "../../ruleBuilder/types";

export const generateEditHandSizeReturn = (effect: Effect): EffectReturn => {
  const operation = effect.params?.operation || "add";
  let statement = "";

  switch (operation) {
    case "add":
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = "+"..tostring(card.ability.extra.hand_size_change).." Hand Size", colour = G.C.BLUE})
                G.hand:change_size(card.ability.extra.hand_size_change)
                return true
            end`;
      break;
    case "subtract":
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = "-"..tostring(card.ability.extra.hand_size_change).." Hand Size", colour = G.C.RED})
                G.hand:change_size(-card.ability.extra.hand_size_change)
                return true
            end`;
      break;
    case "set":
      statement = `func = function()
                local current_hand_size = G.hand.config.card_limit
                local target_hand_size = card.ability.extra.hand_size_change
                local difference = target_hand_size - current_hand_size
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = "Hand Size set to "..tostring(target_hand_size), colour = G.C.BLUE})
                G.hand:change_size(difference)
                return true
            end`;
      break;
    default:
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = "+"..tostring(card.ability.extra.hand_size_change).." Hand Size", colour = G.C.BLUE})
                G.hand:change_size(card.ability.extra.hand_size_change)
                return true
            end`;
  }

  return {
    statement,
    colour: "G.C.BLUE",
  };
};
