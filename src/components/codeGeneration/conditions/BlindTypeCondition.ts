import type { Rule, Condition } from "../../ruleBuilder/types";

/**
 * Generates inline condition code to check blind types
 */
export const generateBlindTypeConditionCode = (
  rules: Rule[]
): string | null => {
  // Filter rules related to blind type
  const blindRules = rules?.filter((rule) => {
    return rule.conditionGroups.some((group) =>
      group.conditions.some((condition) => condition.type === "blind_type")
    );
  });

  if (!blindRules || blindRules.length === 0) {
    return null;
  }

  // Find the first blind type condition
  let blindCondition: Condition | undefined;
  for (const rule of blindRules) {
    for (const group of rule.conditionGroups) {
      const condition = group.conditions.find((c) => c.type === "blind_type");
      if (condition) {
        blindCondition = condition;
        break;
      }
    }
    if (blindCondition) break;
  }

  if (!blindCondition) {
    return null;
  }

  // Extract blind type
  const params = blindCondition.params;
  const blindType = (params.blind_type as string) || "small";

  // Generate condition code based on blind type
  switch (blindType) {
    case "small":
      return `G.GAME.blind:get_type() == 'Small'`;
    case "big":
      return `G.GAME.blind:get_type() == 'Big'`;
    case "boss":
      return `G.GAME.blind.boss`;
    default:
      return `G.GAME.blind.small`;
  }
};
