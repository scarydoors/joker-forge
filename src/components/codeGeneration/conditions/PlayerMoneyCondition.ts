import type { Rule, Condition } from "../../ruleBuilder/types";

export interface PlayerMoneyCondition {
  functionName: string;
  functionCode: string;
}

export const getPlayerMoneyFunctionName = (
  operator: string,
  value: number
): string => {
  const prefix = "check_player_money";

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

  const valuePart = value.toString();

  return `${prefix}_${operatorPart}_${valuePart}`;
};

export const generatePlayerMoneyCondition = (
  rules: Rule[]
): PlayerMoneyCondition | null => {
  const moneyRules = rules?.filter((rule) => {
    return rule.conditionGroups.some((group) =>
      group.conditions.some((condition) => condition.type === "player_money")
    );
  });

  if (!moneyRules || moneyRules.length === 0) {
    return null;
  }

  let moneyCondition: Condition | undefined;

  for (const rule of moneyRules) {
    for (const group of rule.conditionGroups) {
      const condition = group.conditions.find((c) => c.type === "player_money");
      if (condition) {
        moneyCondition = condition;
        break;
      }
    }
    if (moneyCondition) break;
  }

  if (!moneyCondition) {
    return null;
  }

  const params = moneyCondition.params;

  const operator = (params.operator as string) || "equals";
  const value = (params.value as number) || 10;

  const functionName = getPlayerMoneyFunctionName(operator, value);

  let conditionCode = "";
  let conditionComment = "";

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

  conditionCode = `
    return G.GAME.dollars ${comparison}`;

  const functionCode = `-- Player money condition check
local function ${functionName}(context)
    ${conditionComment}${conditionCode}
end`;

  return {
    functionName,
    functionCode,
  };
};
