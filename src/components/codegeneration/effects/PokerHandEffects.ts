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
  let effectType: string = "";
  let effectValue: string | number | null = null;

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

    // Extract effect type and value
    if (rule.effects.length > 0) {
      const effect = rule.effects[0]; // Use the first effect
      effectType = effect.type;
      effectValue = effect.params.value as string | number | null;
    }
  });

  if (handTypes.length === 0) return "";

  // If no explicit effect in rules, use joker properties
  if (!effectType) {
    if (joker.chipAddition > 0) {
      effectType = "add_chips";
    } else if (joker.multAddition > 0) {
      effectType = "add_mult";
    } else if (joker.xMult > 1) {
      effectType = "apply_x_mult";
    }
  }

  // Get return statement based on effect type
  const { statement: returnStatement, colour } = generateEffectReturnStatement(
    effectType,
    joker
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
