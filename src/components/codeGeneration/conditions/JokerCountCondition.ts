import type { Rule, Condition } from "../../ruleBuilder/types";

export const generateJokerCountConditionCode = (
  rules: Rule[]
): string | null => {
  // Filter rules related to joker count
  const jokerRules = rules?.filter((rule) => {
    return rule.conditionGroups.some((group) =>
      group.conditions.some((condition) => condition.type === "joker_count")
    );
  });

  if (!jokerRules || jokerRules.length === 0) {
    return null;
  }

  // Find the first joker count condition in any rule condition group
  let jokerCondition: Condition | undefined;

  // Search through all rules and all groups for a joker count-related condition
  for (const rule of jokerRules) {
    for (const group of rule.conditionGroups) {
      const condition = group.conditions.find((c) => c.type === "joker_count");
      if (condition) {
        jokerCondition = condition;
        break;
      }
    }
    if (jokerCondition) break; // Exit once we find a condition
  }

  // If no suitable condition found, return null
  if (!jokerCondition) {
    return null;
  }

  // Extract joker count condition parameters
  const params = jokerCondition.params;

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

  // Generate the final code - using #G.jokers.cards to get the count of jokers
  return `#G.jokers.cards ${comparison}`;
};
