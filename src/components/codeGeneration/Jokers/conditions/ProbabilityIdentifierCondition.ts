import type { Rule } from "../../../ruleBuilder/types";

export const generateProbabilityIdentifierConditionCode = (rules: Rule[]): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const specific_card = (condition.params.specific_card as string) || "8ball";

  return `context.identifier == "${specific_card}"`;
};
