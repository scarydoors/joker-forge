import type { Rule } from "../../ruleBuilder/types";

export const generatePokerHandConditionCode = (
  rules: Rule[]
): string | null => {
  const rule = rules[0];

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

    if (condition.operator === "contains") {
      if (condition.negate) {
        return `not next(context.poker_hands["${condition.handType}"])`;
      } else {
        return `next(context.poker_hands["${condition.handType}"])`;
      }
    }

    if (condition.scope === "scoring") {
      if (condition.operator === "not_equals" || condition.negate) {
        return `context.scoring_name ~= "${condition.handType}"`;
      } else {
        return `context.scoring_name == "${condition.handType}"`;
      }
    } else if (condition.scope === "all_played") {
      if (condition.operator === "not_equals" || condition.negate) {
        return `not next(context.poker_hands["${condition.handType}"])`;
      } else {
        return `next(context.poker_hands["${condition.handType}"])`;
      }
    }
  } else {
    const conditionChecks = handConditions.map((condition) => {
      if (condition.operator === "contains") {
        if (condition.negate) {
          return `not next(context.poker_hands["${condition.handType}"])`;
        } else {
          return `next(context.poker_hands["${condition.handType}"])`;
        }
      }

      if (condition.scope === "scoring") {
        if (condition.operator === "not_equals" || condition.negate) {
          return `context.scoring_name ~= "${condition.handType}"`;
        } else {
          return `context.scoring_name == "${condition.handType}"`;
        }
      } else if (condition.scope === "all_played") {
        if (condition.operator === "not_equals" || condition.negate) {
          return `not next(context.poker_hands["${condition.handType}"])`;
        } else {
          return `next(context.poker_hands["${condition.handType}"])`;
        }
      }
      return "true";
    });

    return conditionChecks.join(" and ");
  }

  return "true";
};
