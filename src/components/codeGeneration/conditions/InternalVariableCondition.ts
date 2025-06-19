import type { Rule, Condition } from "../../ruleBuilder/types";

export const generateInternalVariableConditionCode = (
  rules: Rule[]
): string | null => {
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

  const params = variableCondition.params;

  const variableName = (params.variable_name as string) || "var1";
  const operator = (params.operator as string) || "equals";
  const value = (params.value as number) || 0;

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

  return `(card.ability.extra.${variableName} or 0) ${comparison}`;
};
