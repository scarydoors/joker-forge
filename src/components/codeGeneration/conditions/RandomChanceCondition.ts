import type { Rule, Condition } from "../../ruleBuilder/types";

export interface RandomChanceCondition {
  functionName: string;
  functionCode: string;
}

// Helper to get a descriptive function name for random chance conditions
export const getRandomChanceFunctionName = (
  numerator: number,
  denominator: number
): string => {
  const prefix = "check_random_chance";
  return `${prefix}_${numerator}_in_${denominator}`;
};

export const generateRandomChanceCondition = (
  rules: Rule[]
): RandomChanceCondition | null => {
  // Filter rules related to random chance
  const chanceRules = rules?.filter((rule) => {
    return rule.conditionGroups.some((group) =>
      group.conditions.some((condition) => condition.type === "random_chance")
    );
  });

  if (!chanceRules || chanceRules.length === 0) {
    return null;
  }

  // Find the first random chance condition in any rule condition group
  let chanceCondition: Condition | undefined;

  for (const rule of chanceRules) {
    for (const group of rule.conditionGroups) {
      const condition = group.conditions.find(
        (c) => c.type === "random_chance"
      );
      if (condition) {
        chanceCondition = condition;
        break;
      }
    }
    if (chanceCondition) break;
  }

  if (!chanceCondition) {
    return null;
  }

  // Extract random chance parameters
  const params = chanceCondition.params;

  // Default values for parameters
  const numerator = (params.numerator as number) || 1;
  const denominator = (params.denominator as number) || 4;

  // Generate function name
  const functionName = getRandomChanceFunctionName(numerator, denominator);

  // Generate condition comment
  const conditionComment = `-- Random chance check: ${numerator} in ${denominator} chance`;

  // Generate the final code using the same pattern as Warlock joker
  const conditionCode = `
    return pseudorandom('random_chance') < G.GAME.probabilities.normal * ${numerator} / ${denominator}`;

  // Generate the function that checks the random chance condition
  const functionCode = `-- Random chance condition check
local function ${functionName}(context)
    ${conditionComment}${conditionCode}
end`;

  return {
    functionName,
    functionCode,
  };
};
