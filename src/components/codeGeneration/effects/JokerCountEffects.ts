import type { Rule, Condition } from "../../ruleBuilder/types";

export interface JokerCountCondition {
  functionName: string;
  functionCode: string;
}

// Helper to get a descriptive function name for joker count conditions
export const getJokerCountFunctionName = (
  operator: string,
  value: number
): string => {
  const prefix = "check_joker_count";

  // Determine operator part of name
  let operatorPart = "";
  switch (operator) {
    case "equals":
      operatorPart = "eq";
      break;
    case "not_equals":
      operatorPart = "neq";
      break;
    case "greater_than":
      operatorPart = "gt";
      break;
    case "less_than":
      operatorPart = "lt";
      break;
    case "greater_equals":
      operatorPart = "gte";
      break;
    case "less_equals":
      operatorPart = "lte";
      break;
    default:
      operatorPart = operator;
  }

  // Add value to name
  const valuePart = value.toString();

  return `${prefix}_${operatorPart}_${valuePart}`;
};

export const generateJokerCountCondition = (
  rules: Rule[]
): JokerCountCondition | null => {
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

  // Generate function name
  const functionName = getJokerCountFunctionName(operator, value);

  // Generate condition code based on operator
  let conditionCode = "";
  let conditionComment = "";

  // Generate the comparison based on the operator
  let comparison = "";
  switch (operator) {
    case "equals":
      comparison = `== ${value}`;
      conditionComment = `-- Check if joker count equals ${value}`;
      break;
    case "not_equals":
      comparison = `~= ${value}`;
      conditionComment = `-- Check if joker count does not equal ${value}`;
      break;
    case "greater_than":
      comparison = `> ${value}`;
      conditionComment = `-- Check if joker count is greater than ${value}`;
      break;
    case "less_than":
      comparison = `< ${value}`;
      conditionComment = `-- Check if joker count is less than ${value}`;
      break;
    case "greater_equals":
      comparison = `>= ${value}`;
      conditionComment = `-- Check if joker count is greater than or equal to ${value}`;
      break;
    case "less_equals":
      comparison = `<= ${value}`;
      conditionComment = `-- Check if joker count is less than or equal to ${value}`;
      break;
    default:
      comparison = `== ${value}`;
      conditionComment = `-- Check if joker count equals ${value}`;
  }

  // Generate the final code - using #G.jokers.cards to get the count of jokers
  conditionCode = `
    return #G.jokers.cards ${comparison}`;

  // Generate the function that checks the joker count condition
  const functionCode = `-- Joker count condition check
local function ${functionName}(context)
    ${conditionComment}${conditionCode}
end`;

  return {
    functionName,
    functionCode,
  };
};
