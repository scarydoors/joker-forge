import { JokerData } from "../../JokerCard";
import type { Rule } from "../../ruleBuilder/types";
import { generateEffectReturnStatement } from "../effectUtils";

export const generatePokerHandCode = (
  joker: JokerData,
  rules: Rule[]
): string => {
  const pokerHandRules =
    rules?.filter((rule) => rule.trigger === "hand_played") || [];
  if (pokerHandRules.length === 0) return "";

  // Collect all effect types from the rules
  const effectTypes: string[] = [];

  // Structure to track hand type conditions and their card scope
  type HandTypeCondition = {
    handType: string;
    scope: string;
    negate: boolean;
  };

  const handConditions: HandTypeCondition[] = [];

  // Extract hand types, card scopes, and effects from rules
  pokerHandRules.forEach((rule) => {
    // Extract hand types and card scope from conditions
    rule.conditionGroups.forEach((group) => {
      group.conditions.forEach((condition) => {
        if (condition.type === "hand_type") {
          // Only process hand_type conditions with equals or not_equals operators
          if (
            condition.params.operator === "equals" ||
            condition.params.operator === "not_equals"
          ) {
            handConditions.push({
              handType: condition.params.value as string,
              scope: (condition.params.card_scope as string) || "scoring", // Default to scoring if not specified
              negate:
                condition.params.operator === "not_equals" || condition.negate,
            });
          }
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

  if (handConditions.length === 0) return "";

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

  // Generate code for hand conditions with AND logic
  let conditionChecks = "";
  let conditionComment = "";

  // Create the condition check code and appropriate comment
  if (handConditions.length === 1) {
    // Single condition case
    const condition = handConditions[0];

    if (condition.scope === "scoring") {
      // For scoring cards, check the scoring_name
      if (condition.negate) {
        conditionChecks = `context.scoring_name ~= "${condition.handType}"`;
        conditionComment = `-- Check if scoring hand is NOT a ${condition.handType}`;
      } else {
        conditionChecks = `context.scoring_name == "${condition.handType}"`;
        conditionComment = `-- Check if scoring hand is a ${condition.handType}`;
      }
    } else if (condition.scope === "all_played") {
      // For all played cards, check if the poker hand exists in context.poker_hands
      if (condition.negate) {
        conditionChecks = `not next(context.poker_hands["${condition.handType}"] or {})`;
        conditionComment = `-- Check if NO ${condition.handType} exists in played cards`;
      } else {
        conditionChecks = `next(context.poker_hands["${condition.handType}"] or {})`;
        conditionComment = `-- Check if a ${condition.handType} exists in played cards`;
      }
    }
  } else {
    // Multiple conditions case - using AND logic between them
    conditionComment = `-- Check that ALL of the following conditions are true:`;

    handConditions.forEach((condition, index) => {
      if (index > 0) conditionChecks += " and "; // Changed from OR to AND

      // Different check based on card scope
      if (condition.scope === "scoring") {
        // For scoring cards, check the scoring_name
        if (condition.negate) {
          conditionChecks += `context.scoring_name ~= "${condition.handType}"`;
        } else {
          conditionChecks += `context.scoring_name == "${condition.handType}"`;
        }

        conditionComment += `\n        -- ${index + 1}. ${
          condition.negate ? "NOT " : ""
        }${condition.handType} (scoring hand)`;
      } else if (condition.scope === "all_played") {
        // For all played cards, check if the poker hand exists in context.poker_hands
        if (condition.negate) {
          conditionChecks += `not next(context.poker_hands["${condition.handType}"] or {})`;
        } else {
          conditionChecks += `next(context.poker_hands["${condition.handType}"] or {})`;
        }

        conditionComment += `\n        -- ${index + 1}. ${
          condition.negate ? "NO " : ""
        }${condition.handType} (any played cards)`;
      }
    });
  }

  // Generate the final calculate function with proper scope handling and correct comments
  const calculateCode = `calculate = function(self, card, context)
    -- Main scoring time for jokers - this is when most jokers apply their effects
    if context.cardarea == G.jokers and context.joker_main then
        ${conditionComment}
        if ${conditionChecks} then
            return {${returnStatement},
                colour = ${colour}
            }
        end
    end
end`;

  return calculateCode;
};
