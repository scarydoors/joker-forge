import type { Rule, Condition } from "../../ruleBuilder/types";

export interface CardSealCondition {
  functionName: string;
  functionCode: string;
}

// Helper to get a descriptive function name for seal conditions
export const getSealFunctionName = (sealType: string): string => {
  const prefix = "check_seal";
  const sealPart = sealType.toLowerCase().replace(/\s+/g, "_");

  return `${prefix}_${sealPart}`;
};

export const generateCardSealCondition = (
  rules: Rule[]
): CardSealCondition | null => {
  // Filter rules related to card seals
  const sealRules = rules?.filter((rule) => {
    return rule.conditionGroups.some((group) =>
      group.conditions.some((condition) => condition.type === "card_seal")
    );
  });

  if (!sealRules || sealRules.length === 0) {
    return null;
  }

  // Find the first seal condition in any rule condition group
  let sealCondition: Condition | undefined;

  for (const rule of sealRules) {
    for (const group of rule.conditionGroups) {
      const condition = group.conditions.find((c) => c.type === "card_seal");
      if (condition) {
        sealCondition = condition;
        break;
      }
    }
    if (sealCondition) break;
  }

  if (!sealCondition) {
    return null;
  }

  // Extract seal params
  const params = sealCondition.params;
  const sealType = (params.seal as string) || "any";

  // For the seal type, capitalize first letter only
  const capitalizedSealType =
    sealType === "any"
      ? "any"
      : sealType.charAt(0).toUpperCase() + sealType.slice(1).toLowerCase();

  // Generate function name
  const functionName = getSealFunctionName(sealType);

  // Generate the seal condition function with minimal comments
  const functionCode =
    sealType === "any"
      ? `-- Card seal condition check
local function ${functionName}(context)
    return context.other_card.seal ~= nil
end`
      : `-- Card seal condition check
local function ${functionName}(context)
    return context.other_card.seal == "${capitalizedSealType}"
end`;

  return {
    functionName,
    functionCode,
  };
};
