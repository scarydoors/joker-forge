import type { EffectReturn } from "./AddChipsEffect";
import type { Effect } from "../../ruleBuilder/types";

export const generateDestroyJokerReturn = (
  effect: Effect,
  triggerType: string
): EffectReturn => {
  const selectionMethod =
    (effect.params?.selection_method as string) || "random";
  const jokerKey = (effect.params?.joker_key as string) || "";
  const position = (effect.params?.position as string) || "first";
  const specificIndex = effect.params?.specific_index as number;
  const customMessage = effect.customMessage;

  const scoringTriggers = ["hand_played", "card_scored"];
  const isScoring = scoringTriggers.includes(triggerType);

  let jokerSelectionCode = "";
  let destroyCode = "";

  // Generate joker selection logic
  if (selectionMethod === "specific" && jokerKey) {
    jokerSelectionCode = `
                local target_joker = nil
                for i, joker in ipairs(G.jokers.cards) do
                    if joker.config.center.key == "${jokerKey}" and not joker.ability.eternal and not joker.getting_sliced then
                        target_joker = joker
                        break
                    end
                end`;
  } else if (selectionMethod === "position") {
    if (position === "first") {
      jokerSelectionCode = `
                local target_joker = nil
                for i, joker in ipairs(G.jokers.cards) do
                    if not joker.ability.eternal and not joker.getting_sliced then
                        target_joker = joker
                        break
                    end
                end`;
    } else if (position === "last") {
      jokerSelectionCode = `
                local target_joker = nil
                for i = #G.jokers.cards, 1, -1 do
                    local joker = G.jokers.cards[i]
                    if not joker.ability.eternal and not joker.getting_sliced then
                        target_joker = joker
                        break
                    end
                end`;
    } else if (position === "left") {
      jokerSelectionCode = `
                local my_pos = nil
                for i = 1, #G.jokers.cards do
                    if G.jokers.cards[i] == card then
                        my_pos = i
                        break
                    end
                end
                local target_joker = nil
                if my_pos and my_pos > 1 then
                    local joker = G.jokers.cards[my_pos - 1]
                    if not joker.ability.eternal and not joker.getting_sliced then
                        target_joker = joker
                    end
                end`;
    } else if (position === "right") {
      jokerSelectionCode = `
                local my_pos = nil
                for i = 1, #G.jokers.cards do
                    if G.jokers.cards[i] == card then
                        my_pos = i
                        break
                    end
                end
                local target_joker = nil
                if my_pos and my_pos < #G.jokers.cards then
                    local joker = G.jokers.cards[my_pos + 1]
                    if not joker.ability.eternal and not joker.getting_sliced then
                        target_joker = joker
                    end
                end`;
    } else if (position === "specific") {
      jokerSelectionCode = `
                local target_joker = nil
                if G.jokers.cards[${specificIndex}] then
                    local joker = G.jokers.cards[${specificIndex}]
                    if not joker.ability.eternal and not joker.getting_sliced then
                        target_joker = joker
                    end
                end`;
    }
  } else {
    jokerSelectionCode = `
                local destructable_jokers = {}
                for i, joker in ipairs(G.jokers.cards) do
                    if not joker.ability.eternal and not joker.getting_sliced then
                        table.insert(destructable_jokers, joker)
                    end
                end
                local target_joker = #destructable_jokers > 0 and pseudorandom_element(destructable_jokers, pseudoseed('destroy_joker')) or nil`;
  }

  destroyCode = `${jokerSelectionCode}
                
                if target_joker then
                    target_joker.getting_sliced = true
                    G.E_MANAGER:add_event(Event({
                        func = function()
                            target_joker:start_dissolve({G.C.RED}, nil, 1.6)
                            return true
                        end
                    }))
                    card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${
                      customMessage ? `"${customMessage}"` : `"Destroyed!"`
                    }, colour = G.C.RED})
                end`;

  if (isScoring) {
    return {
      statement: `__PRE_RETURN_CODE__${destroyCode}
                __PRE_RETURN_CODE_END__`,
      colour: "G.C.RED",
    };
  } else {
    return {
      statement: `func = function()${destroyCode}
                    return true
                end`,
      colour: "G.C.RED",
    };
  }
};
