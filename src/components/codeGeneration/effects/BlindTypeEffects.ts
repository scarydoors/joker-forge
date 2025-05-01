import type { Rule, Condition } from "../../ruleBuilder/types";

export interface BlindTypeCondition {
  functionName: string;
  functionCode: string;
}

/**
 * Creates a function name for blind type conditions
 */
export const getBlindTypeFunctionName = (blindType: string): string => {
  const prefix = "check_blind_type";
  const typeParam = blindType.toLowerCase().replace(/\s+/g, "_");
  return `${prefix}_${typeParam}`;
};

/**
 * Generates a Lua function to check blind types
 */
export const generateBlindTypeCondition = (
  rules: Rule[]
): BlindTypeCondition | null => {
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

  // Generate function name
  const functionName = getBlindTypeFunctionName(blindType);

  // Generate condition code based on blind type
  let conditionCode = "";
  let conditionComment = "";

  switch (blindType) {
    case "small":
      conditionComment = `-- Check if current blind is a Small Blind`;
      conditionCode = `
    return G.GAME.blind:get_type() == 'Small'`;
      break;
    case "big":
      conditionComment = `-- Check if current blind is a Big Blind`;
      conditionCode = `
    return G.GAME.blind:get_type() == 'Big'`;
      break;
    case "boss":
      conditionComment = `-- Check if current blind is a Boss Blind`;
      conditionCode = `
    return G.GAME.blind.boss`;
      break;
    default:
      conditionComment = `-- Check if current blind is a Small Blind (default)`;
      conditionCode = `
    return G.GAME.blind.small`;
  }

  // Generate the function that checks the blind type condition
  const functionCode = `-- Blind type condition check
local function ${functionName}(context)
    ${conditionComment}${conditionCode}
end`;

  return {
    functionName,
    functionCode,
  };
};
