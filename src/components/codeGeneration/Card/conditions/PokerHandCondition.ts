import type { Rule } from "../../../ruleBuilder/types";

export const generatePokerHandConditionCode = (rules: Rule[]): string => {
  if (rules.length === 0) return "";

  const rule = rules[0];
  const condition = rule.conditionGroups?.[0]?.conditions?.[0];
  if (!condition || condition.type !== "poker_hand") return "";

  const handType = (condition.params?.value as string) || "High Card";
  const operator = (condition.params?.operator as string) || "equals";

  if (handType === "most_played_hand") {
    const isMostPlayedCode = `(function()
    local current_played = G.GAME.hands[context.scoring_name].played or 0
    for handname, values in pairs(G.GAME.hands) do
        if handname ~= context.scoring_name and values.played > current_played and values.visible then
            return false
        end
    end
    return true
end)()`;

    if (operator === "not_equals") {
      return `not (${isMostPlayedCode})`;
    } else {
      return isMostPlayedCode;
    }
  }

  if (handType === "least_played_hand") {
    const isLeastPlayedCode = `(function()
    local current_played = G.GAME.hands[context.scoring_name].played or 0
    for handname, values in pairs(G.GAME.hands) do
        if handname ~= context.scoring_name and values.played < current_played and values.visible then
            return false
        end
    end
    return true
end)()`;

    if (operator === "not_equals") {
      return `not (${isLeastPlayedCode})`;
    } else {
      return isLeastPlayedCode;
    }
  }

  if (operator === "not_equals") {
    return `context.scoring_name ~= "${handType}"`;
  } else {
    return `context.scoring_name == "${handType}"`;
  }
};
