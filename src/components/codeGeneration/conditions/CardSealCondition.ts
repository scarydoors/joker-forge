import type { Rule } from "../../ruleBuilder/types";

export const generateCardSealConditionCode = (rules: Rule[]): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const sealType = (condition.params.seal as string) || "any";

  const capitalizedSealType =
    sealType === "any"
      ? "any"
      : sealType.charAt(0).toUpperCase() + sealType.slice(1).toLowerCase();

  return sealType === "any"
    ? `context.other_card.seal ~= nil`
    : `context.other_card.seal == "${capitalizedSealType}"`;
};
