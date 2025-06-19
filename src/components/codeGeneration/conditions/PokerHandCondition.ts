import type { Rule } from "../../ruleBuilder/types";

export const generatePokerHandConditionCode = (
  rules: Rule[]
): string | null => {
  const pokerHandRules =
    rules?.filter((rule) => rule.trigger === "hand_played") || [];
  if (pokerHandRules.length === 0) return null;

  // Structure to track hand type conditions and their card scope
  type HandTypeConditionDef = {
    handType: string;
    scope: string;
    negate: boolean;
  };

  const handConditions: HandTypeConditionDef[] = [];

  // Extract hand types and card scope from conditions
  pokerHandRules.forEach((rule) => {
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
  });

  if (handConditions.length === 0) return null;

  // Generate code for hand conditions
  if (handConditions.length === 1) {
    // Single condition case
    const condition = handConditions[0];

    if (condition.scope === "scoring") {
      // For scoring cards, check the scoring_name
      if (condition.negate) {
        return `context.scoring_name ~= "${condition.handType}"`;
      } else {
        return `context.scoring_name == "${condition.handType}"`;
      }
    } else if (condition.scope === "all_played") {
      // For all played cards, check if the poker hand exists in context.poker_hands
      if (condition.negate) {
        return `not next(context.poker_hands["${condition.handType}"] or {})`;
      } else {
        return `next(context.poker_hands["${condition.handType}"] or {})`;
      }
    }
  } else {
    // Multiple conditions case - using AND logic between them
    const conditionChecks = handConditions.map((condition) => {
      if (condition.scope === "scoring") {
        // For scoring cards, check the scoring_name
        if (condition.negate) {
          return `context.scoring_name ~= "${condition.handType}"`;
        } else {
          return `context.scoring_name == "${condition.handType}"`;
        }
      } else if (condition.scope === "all_played") {
        // For all played cards, check if the poker hand exists in context.poker_hands
        if (condition.negate) {
          return `not next(context.poker_hands["${condition.handType}"] or {})`;
        } else {
          return `next(context.poker_hands["${condition.handType}"] or {})`;
        }
      }
      return "true";
    });

    return conditionChecks.join(" and ");
  }

  return "true";
};
