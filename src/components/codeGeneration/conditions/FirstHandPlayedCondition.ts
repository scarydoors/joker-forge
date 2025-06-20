import type { Rule, Condition } from "../../ruleBuilder/types";

/**
 * Generates inline condition code to check if this is the first played hand of the round
 */
export const generateFirstPlayedHandConditionCode = (
  rules: Rule[]
): string | null => {
  // Filter rules related to first played hand
  const firstHandRules = rules?.filter((rule) => {
    return rule.conditionGroups.some((group) =>
      group.conditions.some(
        (condition) => condition.type === "first_played_hand"
      )
    );
  });

  if (!firstHandRules || firstHandRules.length === 0) {
    return null;
  }

  // Find the first "first played hand" condition
  let firstHandCondition: Condition | undefined;
  for (const rule of firstHandRules) {
    for (const group of rule.conditionGroups) {
      const condition = group.conditions.find(
        (c) => c.type === "first_played_hand"
      );
      if (condition) {
        firstHandCondition = condition;
        break;
      }
    }
    if (firstHandCondition) break;
  }

  if (!firstHandCondition) {
    return null;
  }

  // Generate the condition code to check if this is the first hand played this round
  return `G.GAME.current_round.hands_played == 0`;
};
