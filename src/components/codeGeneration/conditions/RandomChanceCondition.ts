import type { Rule, Condition } from "../../ruleBuilder/types";

export const generateRandomChanceConditionCode = (
  rules: Rule[]
): string | null => {
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

  // Generate the final code using the same pattern as Warlock joker
  return `pseudorandom('random_chance') < G.GAME.probabilities.normal * ${numerator} / ${denominator}`;
};
