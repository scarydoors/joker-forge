import type { Rule, Condition } from "../../ruleBuilder/types";

export interface InternalVariableCondition {
  functionName: string;
  functionCode: string;
}

// Helper to get a descriptive function name for internal variable conditions
export const getInternalVariableFunctionName = (
  variableName: string,
  operator: string,
  value: number
): string => {
  const prefix = "check_internal_var";
  const varPart = variableName.toLowerCase().replace(/[^a-z0-9]/g, "_");

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

  const valuePart = value.toString().replace(/[.-]/g, "_");

  return `${prefix}_${varPart}_${operatorPart}_${valuePart}`;
};

export const generateInternalVariableCondition = (
  rules: Rule[]
): InternalVariableCondition | null => {
  // Filter rules related to internal variables
  const variableRules = rules?.filter((rule) => {
    return rule.conditionGroups.some((group) =>
      group.conditions.some(
        (condition) => condition.type === "internal_variable"
      )
    );
  });

  if (!variableRules || variableRules.length === 0) {
    return null;
  }

  // Find the first internal variable condition in any rule condition group
  let variableCondition: Condition | undefined;

  for (const rule of variableRules) {
    for (const group of rule.conditionGroups) {
      const condition = group.conditions.find(
        (c) => c.type === "internal_variable"
      );
      if (condition) {
        variableCondition = condition;
        break;
      }
    }
    if (variableCondition) break;
  }

  if (!variableCondition) {
    return null;
  }

  // Extract variable condition parameters
  const params = variableCondition.params;

  // Default values for parameters
  const variableName = (params.variable_name as string) || "var1";
  const operator = (params.operator as string) || "equals";
  const value = (params.value as number) || 0;

  // Generate function name
  const functionName = getInternalVariableFunctionName(
    variableName,
    operator,
    value
  );

  // Generate condition code based on operator
  let conditionCode = "";
  let conditionComment = "";

  // Generate the comparison based on the operator
  let comparison = "";
  switch (operator) {
    case "equals":
      comparison = `== ${value}`;
      conditionComment = `-- Check if internal variable '${variableName}' equals ${value}`;
      break;
    case "not_equals":
      comparison = `~= ${value}`;
      conditionComment = `-- Check if internal variable '${variableName}' does not equal ${value}`;
      break;
    case "greater_than":
      comparison = `> ${value}`;
      conditionComment = `-- Check if internal variable '${variableName}' is greater than ${value}`;
      break;
    case "less_than":
      comparison = `< ${value}`;
      conditionComment = `-- Check if internal variable '${variableName}' is less than ${value}`;
      break;
    case "greater_equals":
      comparison = `>= ${value}`;
      conditionComment = `-- Check if internal variable '${variableName}' is greater than or equal to ${value}`;
      break;
    case "less_equals":
      comparison = `<= ${value}`;
      conditionComment = `-- Check if internal variable '${variableName}' is less than or equal to ${value}`;
      break;
    default:
      comparison = `== ${value}`;
      conditionComment = `-- Check if internal variable '${variableName}' equals ${value}`;
  }

  // Generate the final code
  conditionCode = `
    return (card.ability.extra.${variableName} or 0) ${comparison}`;

  // Generate the function that checks the internal variable condition
  const functionCode = `-- Internal variable condition check
local function ${functionName}(context)
    ${conditionComment}${conditionCode}
end`;

  return {
    functionName,
    functionCode,
  };
};
