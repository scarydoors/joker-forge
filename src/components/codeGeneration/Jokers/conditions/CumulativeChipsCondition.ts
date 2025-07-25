import type { Rule } from "../../../ruleBuilder/types";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateCumulativeChipsConditionCode = (
  rules: Rule[]
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const operator = (condition.params.operator as string) || "equals";
  const hand = (condition.params.hand as string) || "played";
  const check = (condition.params.check as string) || "base";
  const value = generateGameVariableCode(condition.params.value);

  let comparison = "";
  switch (operator) {
    case "equals":
      comparison = `== ${value}`;
      break;
    case "not_equals":
      comparison = `~= ${value}`;
      break;
    case "greater_than":
      comparison = `> ${value}`;
      break;
    case "less_than":
      comparison = `< ${value}`;
      break;
    case "greater_equals":
      comparison = `>= ${value}`;
      break;
    case "less_equals":
      comparison = `<= ${value}`;
      break;
    default:
      comparison = `== ${value}`;
  }

  const cardsToCheck = hand === "played" ? "context.scoring_hand" : "G.hand.cards"
  const propertyCheck = check === "base" ? 'playing_card.base.nominal' : "playing_card:get_chip_bonus()"

  return `(function()
    local chips_sum = 0
    for _, playing_card in pairs(${cardsToCheck} or {}) do
        chips_sum = chips_sum + ${propertyCheck}
    end
    return chips_sum ${comparison}
end)()`;
};
