import type { Rule, Condition } from "../../ruleBuilder/types";

export interface RemainingHandsCondition {
  functionName: string;
  functionCode: string;
}

// Helper to get a descriptive function name for remaining hands conditions
export const getRemainingHandsFunctionName = (
  operator: string,
  value: number
): string => {
  const prefix = "check_remaining_hands";

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

export const generateRemainingHandsCondition = (
  rules: Rule[]
): RemainingHandsCondition | null => {
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

  // Generate function name
  const functionName = getRemainingHandsFunctionName(operator, value);

  // Generate condition code based on operator
  let conditionCode = "";
  let conditionComment = "";

  // Generate the comparison based on the operator
  let comparison = "";
  switch (operator) {
    case "equals":
      comparison = `== ${value}`;
      conditionComment = `-- Check if remaining hands equals ${value}`;
      break;
    case "not_equals":
      comparison = `~= ${value}`;
      conditionComment = `-- Check if remaining hands does not equal ${value}`;
      break;
    case "greater_than":
      comparison = `> ${value}`;
      conditionComment = `-- Check if remaining hands is greater than ${value}`;
      break;
    case "less_than":
      comparison = `< ${value}`;
      conditionComment = `-- Check if remaining hands is less than ${value}`;
      break;
    case "greater_equals":
      comparison = `>= ${value}`;
      conditionComment = `-- Check if remaining hands is greater than or equal to ${value}`;
      break;
    case "less_equals":
      comparison = `<= ${value}`;
      conditionComment = `-- Check if remaining hands is less than or equal to ${value}`;
      break;
    default:
      comparison = `== ${value}`;
      conditionComment = `-- Check if remaining hands equals ${value}`;
  }

  // Generate the final code
  conditionCode = `
    return G.GAME.round_resets.plays ${comparison}`;

  // Generate the function that checks the remaining hands condition
  const functionCode = `-- Remaining hands condition check
local function ${functionName}(context)
    ${conditionComment}${conditionCode}
end`;

  return {
    functionName,
    functionCode,
  };
};
