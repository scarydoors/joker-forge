import type { Rule, Condition } from "../../ruleBuilder/types";

export const generateRemainingHandsConditionCode = (
  rules: Rule[]
): string | null => {
  // Filter rules related to remaining hands
  const handsRules = rules?.filter((rule) => {
    return rule.conditionGroups.some((group) =>
      group.conditions.some((condition) => condition.type === "remaining_hands")
    );
  });

  if (!handsRules || handsRules.length === 0) {
    return null;
  }

  // Find the first remaining hands condition in any rule condition group
  let handsCondition: Condition | undefined;

  // Search through all rules and all groups for a remaining hands-related condition
  for (const rule of handsRules) {
    for (const group of rule.conditionGroups) {
      const condition = group.conditions.find(
        (c) => c.type === "remaining_hands"
      );
      if (condition) {
        handsCondition = condition;
        break;
      }
    }
    if (handsCondition) break; // Exit once we find a condition
  }

  // If no suitable condition found, return null
  if (!handsCondition) {
    return null;
  }

  // Extract remaining hands condition parameters
  const params = handsCondition.params;

  // Default values for parameters
  const operator = (params.operator as string) || "equals";
  const value = (params.value as number) || 1;

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

  // Generate the final code
  return `G.GAME.round_resets.plays ${comparison}`;
};
