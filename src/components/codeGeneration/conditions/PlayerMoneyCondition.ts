import type { Rule, Condition } from "../../ruleBuilder/types";

export const generatePlayerMoneyConditionCode = (
  rules: Rule[]
): string | null => {
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

  return `G.GAME.dollars ${comparison}`;
};
