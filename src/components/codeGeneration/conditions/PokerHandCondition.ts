import type { Rule } from "../../ruleBuilder/types";

export const generatePokerHandConditionCode = (
  rules: Rule[]
): string | null => {
  const rule = rules[0];
  if (rule.trigger !== "hand_played") return null;

  type HandTypeConditionDef = {
    handType: string;
    scope: string;
    negate: boolean;
  };

  const handConditions: HandTypeConditionDef[] = [];

  rule.conditionGroups.forEach((group) => {
    group.conditions.forEach((condition) => {
      if (condition.type === "hand_type") {
        if (
          condition.params.operator === "equals" ||
          condition.params.operator === "not_equals"
        ) {
          handConditions.push({
            handType: condition.params.value as string,
            scope: (condition.params.card_scope as string) || "scoring",
            negate:
              condition.params.operator === "not_equals" || condition.negate,
          });
        }
      }
    });
  });

  if (handConditions.length === 0) return null;

  if (handConditions.length === 1) {
    const condition = handConditions[0];

    if (condition.scope === "scoring") {
      if (condition.negate) {
        return `context.scoring_name ~= "${condition.handType}"`;
      } else {
        return `context.scoring_name == "${condition.handType}"`;
      }
    } else if (condition.scope === "all_played") {
      if (condition.negate) {
        return `not next(context.poker_hands["${condition.handType}"] or {})`;
      } else {
        return `next(context.poker_hands["${condition.handType}"] or {})`;
      }
    }
  } else {
    const conditionChecks = handConditions.map((condition) => {
      if (condition.scope === "scoring") {
        if (condition.negate) {
          return `context.scoring_name ~= "${condition.handType}"`;
        } else {
          return `context.scoring_name == "${condition.handType}"`;
        }
      } else if (condition.scope === "all_played") {
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
