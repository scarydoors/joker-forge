import type { Rule } from "../../../ruleBuilder/types";

export const generatePlayerMoneyConditionCode = (
  rules: Rule[]
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const operator = (condition.params?.operator as string) || "greater_equals";
  const value = condition.params?.value || 5;

  let comparison = "";
  switch (operator) {
    case "equals":
      comparison = `== to_big(${value})`;
      break;
    case "greater_than":
      comparison = `> to_big(${value})`;
      break;
    case "less_than":
      comparison = `< to_big(${value})`;
      break;
    case "greater_equals":
      comparison = `>= to_big(${value})`;
      break;
    case "less_equals":
      comparison = `<= to_big(${value})`;
      break;
    default:
      comparison = `>= to_big(${value})`;
  }

  return `G.GAME.dollars ${comparison}`;
};
