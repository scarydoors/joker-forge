import type { Rule } from "../../ruleBuilder/types";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateCheckBlindRequirementsConditionCode = (
  rules: Rule[]
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const operator = (condition.params.operator as string) || "greater_equals";
  const percentageValue =
    generateGameVariableCode(condition.params.percentage) || 25;

  const decimal = Number(percentageValue) / 100;

  let comparison = "";
  switch (operator) {
    case "equals":
      comparison = `== ${decimal}`;
      break;
    case "not_equals":
      comparison = `~= ${decimal}`;
      break;
    case "greater_than":
      comparison = `> ${decimal}`;
      break;
    case "less_than":
      comparison = `< ${decimal}`;
      break;
    case "greater_equals":
      comparison = `>= ${decimal}`;
      break;
    case "less_equals":
      comparison = `<= ${decimal}`;
      break;
    default:
      comparison = `>= ${decimal}`;
  }

  return `G.GAME.chips / G.GAME.blind.chips ${comparison}`;
};
