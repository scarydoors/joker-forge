import type { Rule } from "../../ruleBuilder/types";

export const generateCountCardConditionCode = (
  rules: Rule[]
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const operator = (condition.params.operator as string) || "equals";
  const value = (condition.params.value as number) || 5;
  const scope = (condition.params.card_scope as string) || "scoring";

  const cardsToCheck =
    scope === "scoring" ? "context.scoring_hand" : "context.full_hand";

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

  return `#${cardsToCheck} ${comparison}`;
};
