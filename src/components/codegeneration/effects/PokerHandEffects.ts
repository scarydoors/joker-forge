import { JokerData } from "../../JokerCard";
import type { Rule } from "../../ruleBuilder/types";
import { generateEffectReturnStatement } from "../effectUtils";

export const generatePokerHandCode = (
  joker: JokerData,
  rules: Rule[]
): string => {
  const pokerHandRules =
    rules?.filter((rule) => rule.trigger === "poker_hand_played") || [];
  if (pokerHandRules.length === 0) return "";

  const handTypes: string[] = [];
  // Collect all effect types from the rules
  const effectTypes: string[] = [];

  // Extract hand types and effects from rules
  pokerHandRules.forEach((rule) => {
    // Extract hand types from conditions
    rule.conditionGroups.forEach((group) => {
      group.conditions.forEach((condition) => {
        if (
          condition.type === "hand_type" &&
          condition.params.operator === "equals"
        ) {
          handTypes.push(condition.params.value as string);
        }
      });
    });

    // Extract all effect types
    rule.effects.forEach((effect) => {
      if (!effectTypes.includes(effect.type)) {
        effectTypes.push(effect.type);
      }
    });
  });

  if (handTypes.length === 0) return "";

  // If no effects found in rules, add defaults based on joker properties
  if (effectTypes.length === 0) {
    if (joker.chipAddition > 0) effectTypes.push("add_chips");
    if (joker.multAddition > 0) effectTypes.push("add_mult");
    if (joker.xMult > 1) effectTypes.push("apply_x_mult");
  }

  // Get return statement based on all effect types
  const { statement: returnStatement, colour } = generateEffectReturnStatement(
    joker,
    effectTypes
  );

  // Single hand type
  if (handTypes.length === 1) {
    const handType = handTypes[0];

    return `calculate = function(self, card, context)
        -- Main scoring time for jokers - this is when most jokers apply their effects
        if context.cardarea == G.jokers and context.joker_main then
            -- Check if the current hand is a ${handType}
            if context.scoring_name == "${handType}" then
                return {${returnStatement},
                    colour = ${colour}
                }
            end
        end
    end`;
  }
  // Multiple hand types
  else {
    let calculateCode = `calculate = function(self, card, context)
        -- Main scoring time for jokers - this is when most jokers apply their effects
        if context.cardarea == G.jokers and context.joker_main then
            local handType = context.scoring_name
            
            if `;

    handTypes.forEach((handType, index) => {
      if (index > 0) calculateCode += ` or `;
      calculateCode += `handType == "${handType}"`;
    });

    calculateCode += ` then
                return {${returnStatement},
                    colour = ${colour}
                }
            end
        end
    end`;

    return calculateCode;
  }
};
