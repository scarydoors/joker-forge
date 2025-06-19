import type { Rule, Condition } from "../../ruleBuilder/types";

export const generateRemainingDiscardsConditionCode = (
  rules: Rule[]
): string | null => {
  // Filter rules related to remaining discards
  const discardRules = rules?.filter((rule) => {
    return rule.conditionGroups.some((group) =>
      group.conditions.some(
        (condition) => condition.type === "remaining_discards"
      )
    );
  });

  if (!discardRules || discardRules.length === 0) {
    return null;
  }

  // Find the first remaining discards condition in any rule condition group
  let discardCondition: Condition | undefined;

  // Search through all rules and all groups for a remaining discards-related condition
  for (const rule of discardRules) {
    for (const group of rule.conditionGroups) {
      const condition = group.conditions.find(
        (c) => c.type === "remaining_discards"
      );
      if (condition) {
        discardCondition = condition;
        break;
      }
    }
    if (discardCondition) break; // Exit once we find a condition
  }

  // If no suitable condition found, return null
  if (!discardCondition) {
    return null;
  }

  // Extract remaining discards condition parameters
  const params = discardCondition.params;

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
  return `G.GAME.current_round.discards_left ${comparison}`;
};
