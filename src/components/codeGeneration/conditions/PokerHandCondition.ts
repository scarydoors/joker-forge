import type { Rule } from "../../ruleBuilder/types";

export const generatePokerHandConditionCode = (
  rules: Rule[]
): string | null => {
  const rule = rules[0];
  if (rule.trigger !== "hand_played") return null;

  type HandTypeConditionDef = {
    handType: string;
    scope: string;
    operator: string;
    negate: boolean;
  };

  const handConditions: HandTypeConditionDef[] = [];

  rule.conditionGroups.forEach((group) => {
    group.conditions.forEach((condition) => {
      if (condition.type === "hand_type") {
        const operator = condition.params.operator as string;
        if (
          operator === "equals" ||
          operator === "not_equals" ||
          operator === "contains"
        ) {
          handConditions.push({
            handType: condition.params.value as string,
            scope: (condition.params.card_scope as string) || "scoring",
            operator: operator,
            negate: condition.negate,
          });
        }
      }
    });
  });

  if (handConditions.length === 0) return null;

  if (handConditions.length === 1) {
    const condition = handConditions[0];

    // Handle "contains" operator - always uses poker_hands regardless of scope
    if (condition.operator === "contains") {
      if (condition.negate) {
        return `not next(context.poker_hands["${condition.handType}"] or {})`;
      } else {
        return `next(context.poker_hands["${condition.handType}"] or {})`;
      }
    }

    // Handle "equals" and "not_equals" operators
    if (condition.scope === "scoring") {
      if (condition.operator === "not_equals" || condition.negate) {
        return `context.scoring_name ~= "${condition.handType}"`;
      } else {
        return `context.scoring_name == "${condition.handType}"`;
      }
    } else if (condition.scope === "all_played") {
      if (condition.operator === "not_equals" || condition.negate) {
        return `not next(context.poker_hands["${condition.handType}"] or {})`;
      } else {
        return `next(context.poker_hands["${condition.handType}"] or {})`;
      }
    }
  } else {
    // Handle multiple conditions
    const conditionChecks = handConditions.map((condition) => {
      // Handle "contains" operator
      if (condition.operator === "contains") {
        if (condition.negate) {
          return `not next(context.poker_hands["${condition.handType}"] or {})`;
        } else {
          return `next(context.poker_hands["${condition.handType}"] or {})`;
        }
      }

      // Handle "equals" and "not_equals" operators
      if (condition.scope === "scoring") {
        if (condition.operator === "not_equals" || condition.negate) {
          return `context.scoring_name ~= "${condition.handType}"`;
        } else {
          return `context.scoring_name == "${condition.handType}"`;
        }
      } else if (condition.scope === "all_played") {
        if (condition.operator === "not_equals" || condition.negate) {
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
