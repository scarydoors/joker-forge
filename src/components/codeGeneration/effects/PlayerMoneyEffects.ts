// src/components/codegeneration/effects/PlayerMoneyEffects.ts
import type { Rule, Condition } from "../../ruleBuilder/types";

export interface PlayerMoneyCondition {
  functionName: string;
  functionCode: string;
}

// Helper to get a descriptive function name for player money conditions
export const getPlayerMoneyFunctionName = (
  operator: string,
  value: number
): string => {
  const prefix = "check_player_money";

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

export const generatePlayerMoneyCondition = (
  rules: Rule[]
): PlayerMoneyCondition | null => {
  // Filter rules related to player money
  const moneyRules = rules?.filter((rule) => {
    return rule.conditionGroups.some((group) =>
      group.conditions.some((condition) => condition.type === "player_money")
    );
  });

  if (!moneyRules || moneyRules.length === 0) {
    return null;
  }

  // Find the first player money condition in any rule condition group
  let moneyCondition: Condition | undefined;

  // Search through all rules and all groups for a money-related condition
  for (const rule of moneyRules) {
    for (const group of rule.conditionGroups) {
      const condition = group.conditions.find((c) => c.type === "player_money");
      if (condition) {
        moneyCondition = condition;
        break;
      }
    }
    if (moneyCondition) break; // Exit once we find a condition
  }

  // If no suitable condition found, return null
  if (!moneyCondition) {
    return null;
  }

  // Extract money condition parameters
  const params = moneyCondition.params;

  // Default values for parameters
  const operator = (params.operator as string) || "equals";
  const value = (params.value as number) || 10;

  // Generate function name
  const functionName = getPlayerMoneyFunctionName(operator, value);

  // Generate condition code based on operator
  let conditionCode = "";
  let conditionComment = "";

  // Generate the comparison based on the operator
  let comparison = "";
  switch (operator) {
    case "equals":
      comparison = `== ${value}`;
      conditionComment = `-- Check if player money equals ${value}`;
      break;
    case "not_equals":
      comparison = `~= ${value}`;
      conditionComment = `-- Check if player money does not equal ${value}`;
      break;
    case "greater_than":
      comparison = `> ${value}`;
      conditionComment = `-- Check if player money is greater than ${value}`;
      break;
    case "less_than":
      comparison = `< ${value}`;
      conditionComment = `-- Check if player money is less than ${value}`;
      break;
    case "greater_equals":
      comparison = `>= ${value}`;
      conditionComment = `-- Check if player money is greater than or equal to ${value}`;
      break;
    case "less_equals":
      comparison = `<= ${value}`;
      conditionComment = `-- Check if player money is less than or equal to ${value}`;
      break;
    default:
      comparison = `== ${value}`;
      conditionComment = `-- Check if player money equals ${value}`;
  }

  // Generate the final code
  conditionCode = `
    return G.GAME.money ${comparison}`;

  // Generate the function that checks the player money condition
  const functionCode = `-- Player money condition check
local function ${functionName}(context)
    ${conditionComment}${conditionCode}
end`;

  return {
    functionName,
    functionCode,
  };
};
