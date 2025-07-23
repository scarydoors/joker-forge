import type { Rule } from "../../../ruleBuilder/types";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateCardIndexConditionCode = (
  rules: Rule[]
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const indexType = (condition.params.index_type as string) || "number";
  const indexNumber =
    generateGameVariableCode(condition.params.index_number) || "1";

  if (indexType === "first") {
    return `context.other_card == context.scoring_hand[1]`;
  } else if (indexType === "last") {
    return `context.other_card == context.scoring_hand[#context.scoring_hand]`;
  } else {
    return `context.other_card == context.scoring_hand[${indexNumber}]`;
  }
};
