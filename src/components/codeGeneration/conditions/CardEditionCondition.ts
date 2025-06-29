import type { Rule } from "../../ruleBuilder/types";

export const generateCardEditionConditionCode = (
  rules: Rule[]
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const editionType = (condition.params.edition as string) || "any";

  if (editionType === "any") {
    return `context.other_card.edition ~= nil`;
  } else if (editionType === "none") {
    return `context.other_card.edition == nil`;
  } else {
    return `context.other_card.edition and context.other_card.edition.key == "${editionType}"`;
  }
};
