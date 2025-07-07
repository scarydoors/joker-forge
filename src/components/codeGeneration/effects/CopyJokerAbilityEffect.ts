import type { Effect } from "../../ruleBuilder/types";
import type { PassiveEffectResult } from "../effectUtils";

export const generatePassiveCopyJokerAbility = (
  effect: Effect
): PassiveEffectResult => {
  const selectionMethod =
    (effect.params?.selection_method as string) || "right";
  const specificIndex = (effect.params?.specific_index as number) || 1;

  let targetJokerLogic = "";

  switch (selectionMethod) {
    case "right":
      targetJokerLogic = `local my_pos = nil
        for i = 1, #G.jokers.cards do
            if G.jokers.cards[i] == card then
                my_pos = i
                break
            end
        end
        target_joker = (my_pos and my_pos < #G.jokers.cards) and G.jokers.cards[my_pos + 1] or nil`;
      break;

    case "left":
      targetJokerLogic = `local my_pos = nil
        for i = 1, #G.jokers.cards do
            if G.jokers.cards[i] == card then
                my_pos = i
                break
            end
        end
        target_joker = (my_pos and my_pos > 1) and G.jokers.cards[my_pos - 1] or nil`;
      break;

    case "specific":
      targetJokerLogic = `target_joker = G.jokers.cards[${specificIndex}]
        if target_joker == card then
            target_joker = nil
        end`;
      break;
  }

  const calculateFunction = `calculate = function(self, card, context)
        local target_joker = nil
        
        ${targetJokerLogic}
        
        return SMODS.blueprint_effect(card, target_joker, context)
    end`;

  return {
    calculateFunction,
    configVariables: [],
    locVars: [],
  };
};
