import type { Rule } from "../../ruleBuilder/types";

export const generatePokerHandConditionCode = (
  rules: Rule[]
): string | null => {
  const rule = rules[0];

  type HandTypeConditionDef = {
    handType: string;
    scope: string;
    operator: string;
    negate: boolean;
  };

  const handConditions: HandTypeConditionDef[] = [];

  rule.conditionGroups.forEach((group) => {
    group.conditions.forEach((condition) => {
      if (condition.type === "hand_type") {
        const operator = condition.params.operator as string;
        if (
          operator === "equals" ||
          operator === "not_equals" ||
          operator === "contains"
        ) {
          handConditions.push({
            handType: condition.params.value as string,
            scope: (condition.params.card_scope as string) || "scoring",
            operator: operator,
            negate: condition.negate,
          });
        }
      }
    });
  });

  if (handConditions.length === 0) return null;

  if (handConditions.length === 1) {
    const condition = handConditions[0];

    // Handle special cases for most/least played hands
    if (condition.handType === "most_played_hand") {
      // Check if current hand is the most played (no other hand has been played more)
      const isMostPlayedCode = `(function()
    local current_played = G.GAME.hands[context.scoring_name].played or 0
    for handname, values in pairs(G.GAME.hands) do
        if handname ~= context.scoring_name and values.played > current_played and values.visible then
            return false
        end
    end
    return true
end)()`;

      if (condition.operator === "not_equals" || condition.negate) {
        return `not (${isMostPlayedCode})`;
      } else {
        return isMostPlayedCode;
      }
    }

    if (condition.handType === "least_played_hand") {
      // Check if current hand is the least played (no other hand has been played fewer times)
      const isLeastPlayedCode = `(function()
    local current_played = G.GAME.hands[context.scoring_name].played or 0
    for handname, values in pairs(G.GAME.hands) do
        if handname ~= context.scoring_name and values.played < current_played and values.visible then
            return false
        end
    end
    return true
end)()`;

      if (condition.operator === "not_equals" || condition.negate) {
        return `not (${isLeastPlayedCode})`;
      } else {
        return isLeastPlayedCode;
      }
    }

    // Handle regular hand types
    if (condition.operator === "contains") {
      if (condition.negate) {
        return `not next(context.poker_hands["${condition.handType}"])`;
      } else {
        return `next(context.poker_hands["${condition.handType}"])`;
      }
    }

    if (condition.scope === "scoring") {
      if (condition.operator === "not_equals" || condition.negate) {
        return `context.scoring_name ~= "${condition.handType}"`;
      } else {
        return `context.scoring_name == "${condition.handType}"`;
      }
    } else if (condition.scope === "all_played") {
      if (condition.operator === "not_equals" || condition.negate) {
        return `not next(context.poker_hands["${condition.handType}"])`;
      } else {
        return `next(context.poker_hands["${condition.handType}"])`;
      }
    }
  } else {
    const conditionChecks = handConditions.map((condition) => {
      // Handle special cases in multiple conditions
      if (condition.handType === "most_played_hand") {
        const isMostPlayedCode = `(function()
    local current_played = G.GAME.hands[context.scoring_name].played or 0
    for handname, values in pairs(G.GAME.hands) do
        if handname ~= context.scoring_name and values.played > current_played and values.visible then
            return false
        end
    end
    return true
end)()`;

        if (condition.operator === "not_equals" || condition.negate) {
          return `not (${isMostPlayedCode})`;
        } else {
          return isMostPlayedCode;
        }
      }

      if (condition.handType === "least_played_hand") {
        const isLeastPlayedCode = `(function()
    local current_played = G.GAME.hands[context.scoring_name].played or 0
    for handname, values in pairs(G.GAME.hands) do
        if handname ~= context.scoring_name and values.played < current_played and values.visible then
            return false
        end
    end
    return true
end)()`;

        if (condition.operator === "not_equals" || condition.negate) {
          return `not (${isLeastPlayedCode})`;
        } else {
          return isLeastPlayedCode;
        }
      }

      // Handle regular hand types
      if (condition.operator === "contains") {
        if (condition.negate) {
          return `not next(context.poker_hands["${condition.handType}"])`;
        } else {
          return `next(context.poker_hands["${condition.handType}"])`;
        }
      }

      if (condition.scope === "scoring") {
        if (condition.operator === "not_equals" || condition.negate) {
          return `context.scoring_name ~= "${condition.handType}"`;
        } else {
          return `context.scoring_name == "${condition.handType}"`;
        }
      } else if (condition.scope === "all_played") {
        if (condition.operator === "not_equals" || condition.negate) {
          return `not next(context.poker_hands["${condition.handType}"])`;
        } else {
          return `next(context.poker_hands["${condition.handType}"])`;
        }
      }
      return "true";
    });

    return conditionChecks.join(" and ");
  }

  return "true";
};
