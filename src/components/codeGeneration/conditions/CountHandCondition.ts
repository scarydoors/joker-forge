import type { Rule, Condition } from "../../ruleBuilder/types";

export const generateCountCardConditionCode = (
  rules: Rule[]
): string | null => {
  // Filter rules related to card counts
  const countRules = rules?.filter((rule) => {
    return rule.conditionGroups.some((group) =>
      group.conditions.some((condition) => condition.type === "card_count")
    );
  });

  if (!countRules || countRules.length === 0) {
    return null;
  }

  // Find the first card count condition in any rule condition group
  let countCondition: Condition | undefined;

  // Search through all rules and all groups for a count-related condition
  for (const rule of countRules) {
    for (const group of rule.conditionGroups) {
      const condition = group.conditions.find((c) => c.type === "card_count");
      if (condition) {
        countCondition = condition;
        break;
      }
    }
    if (countCondition) break; // Exit once we find a condition
  }

  // If no suitable condition found, return null
  if (!countCondition) {
    return null;
  }

  // Extract count condition parameters
  const params = countCondition.params;

  // Default values for parameters
  const operator = (params.operator as string) || "equals";
  const value = (params.value as number) || 5;
  const scope = (params.card_scope as string) || "scoring";

  // Set up the card collection to check based on scope
  const cardsToCheck =
    scope === "scoring" ? "context.scoring_hand" : "context.full_hand";

  // Generate the comparison based on the operator
  let comparison = "";
  switch (operator) {
    case "equals":
      comparison = `== ${value}`;
      break;
    case "not_equals":
      comparison = `~= ${value}`;
      break;
    case "greater_than":
      comparison = `> ${value}`;
      break;
    case "less_than":
      comparison = `< ${value}`;
      break;
    case "greater_equals":
      comparison = `>= ${value}`;
      break;
    case "less_equals":
      comparison = `<= ${value}`;
      break;
    default:
      comparison = `== ${value}`;
  }

  // Generate the final condition code
  return `#${cardsToCheck} ${comparison}`;
};
