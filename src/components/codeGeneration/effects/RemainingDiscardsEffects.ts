import type { Rule, Condition } from "../../ruleBuilder/types";

export interface RemainingDiscardsCondition {
  functionName: string;
  functionCode: string;
}

// Helper to get a descriptive function name for remaining discards conditions
export const getRemainingDiscardsFunctionName = (
  operator: string,
  value: number
): string => {
  const prefix = "check_remaining_discards";

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

export const generateRemainingDiscardsCondition = (
  rules: Rule[]
): RemainingDiscardsCondition | null => {
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

  // Generate function name
  const functionName = getRemainingDiscardsFunctionName(operator, value);

  // Generate condition code based on operator
  let conditionCode = "";
  let conditionComment = "";

  // Generate the comparison based on the operator
  let comparison = "";
  switch (operator) {
    case "equals":
      comparison = `== ${value}`;
      conditionComment = `-- Check if remaining discards equals ${value}`;
      break;
    case "not_equals":
      comparison = `~= ${value}`;
      conditionComment = `-- Check if remaining discards does not equal ${value}`;
      break;
    case "greater_than":
      comparison = `> ${value}`;
      conditionComment = `-- Check if remaining discards is greater than ${value}`;
      break;
    case "less_than":
      comparison = `< ${value}`;
      conditionComment = `-- Check if remaining discards is less than ${value}`;
      break;
    case "greater_equals":
      comparison = `>= ${value}`;
      conditionComment = `-- Check if remaining discards is greater than or equal to ${value}`;
      break;
    case "less_equals":
      comparison = `<= ${value}`;
      conditionComment = `-- Check if remaining discards is less than or equal to ${value}`;
      break;
    default:
      comparison = `== ${value}`;
      conditionComment = `-- Check if remaining discards equals ${value}`;
  }

  // Generate the final code
  conditionCode = `
    return G.GAME.current_round.discards_left ${comparison}`;

  // Generate the function that checks the remaining discards condition
  const functionCode = `-- Remaining discards condition check
local function ${functionName}(context)
    ${conditionComment}${conditionCode}
end`;

  return {
    functionName,
    functionCode,
  };
};
