import type { Rule, Condition } from "../../ruleBuilder/types";

export interface CountCondition {
  functionName: string;
  functionCode: string;
}

// Helper to get a descriptive function name for card count conditions
export const getCountFunctionName = (
  operator: string,
  value: number,
  scope: string
): string => {
  const prefix = "check_count";

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

  // Add scope and value to name
  const scopePart = scope === "all_played" ? "played" : "scoring";
  const valuePart = value.toString();

  return `${prefix}_${operatorPart}_${valuePart}_${scopePart}`;
};

export const generateCountCardCondition = (
  rules: Rule[]
): CountCondition | null => {
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

  // Generate function name
  const functionName = getCountFunctionName(operator, value, scope);

  // Generate condition code based on operator and scope
  let conditionCode = "";
  let conditionComment = "";

  // Set up the card collection to check based on scope
  const cardsToCheck =
    scope === "scoring" ? "context.scoring_hand" : "context.full_hand";

  // Generate the comparison based on the operator
  let comparison = "";
  switch (operator) {
    case "equals":
      comparison = `== ${value}`;
      conditionComment = `-- Check if ${scope} hand has exactly ${value} cards`;
      break;
    case "not_equals":
      comparison = `~= ${value}`;
      conditionComment = `-- Check if ${scope} hand does not have ${value} cards`;
      break;
    case "greater_than":
      comparison = `> ${value}`;
      conditionComment = `-- Check if ${scope} hand has more than ${value} cards`;
      break;
    case "less_than":
      comparison = `< ${value}`;
      conditionComment = `-- Check if ${scope} hand has less than ${value} cards`;
      break;
    case "greater_equals":
      comparison = `>= ${value}`;
      conditionComment = `-- Check if ${scope} hand has ${value} or more cards`;
      break;
    case "less_equals":
      comparison = `<= ${value}`;
      conditionComment = `-- Check if ${scope} hand has ${value} or fewer cards`;
      break;
    default:
      comparison = `== ${value}`;
      conditionComment = `-- Check if ${scope} hand has ${value} cards`;
  }

  // Generate the final code
  conditionCode = `
    return #${cardsToCheck} ${comparison}`;

  // Generate the function that checks the card count condition
  const functionCode = `-- Card count condition check
local function ${functionName}(context)
    ${conditionComment}${conditionCode}
end`;

  return {
    functionName,
    functionCode,
  };
};
