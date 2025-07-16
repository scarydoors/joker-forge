import type { Rule } from "../../../ruleBuilder/types";
import type { JokerData } from "../../../JokerCard";
import { parsePokerHandVariable } from "../variableUtils";

export const generatePokerHandConditionCode = (
  rules: Rule[],
  joker?: JokerData
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

    const pokerHandVarInfo = parsePokerHandVariable(condition.handType, joker);

    if (condition.operator === "contains") {
      if (pokerHandVarInfo.isPokerHandVariable) {
        const handReference = `G.GAME.current_round.${pokerHandVarInfo.variableName}_hand`;
        if (condition.negate) {
          return `not next(context.poker_hands[${handReference}])`;
        } else {
          return `next(context.poker_hands[${handReference}])`;
        }
      } else {
        if (condition.negate) {
          return `not next(context.poker_hands["${condition.handType}"])`;
        } else {
          return `next(context.poker_hands["${condition.handType}"])`;
        }
      }
    }

    if (condition.scope === "scoring") {
      if (pokerHandVarInfo.isPokerHandVariable) {
        const handReference = `G.GAME.current_round.${pokerHandVarInfo.variableName}_hand`;
        if (condition.operator === "not_equals" || condition.negate) {
          return `context.scoring_name ~= ${handReference}`;
        } else {
          return `context.scoring_name == ${handReference}`;
        }
      } else {
        if (condition.operator === "not_equals" || condition.negate) {
          return `context.scoring_name ~= "${condition.handType}"`;
        } else {
          return `context.scoring_name == "${condition.handType}"`;
        }
      }
    } else if (condition.scope === "all_played") {
      if (pokerHandVarInfo.isPokerHandVariable) {
        const handReference = `G.GAME.current_round.${pokerHandVarInfo.variableName}_hand`;
        if (condition.operator === "not_equals" || condition.negate) {
          return `not next(context.poker_hands[${handReference}])`;
        } else {
          return `next(context.poker_hands[${handReference}])`;
        }
      } else {
        if (condition.operator === "not_equals" || condition.negate) {
          return `not next(context.poker_hands["${condition.handType}"])`;
        } else {
          return `next(context.poker_hands["${condition.handType}"])`;
        }
      }
    }
  } else {
    const conditionChecks = handConditions.map((condition) => {
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

      const pokerHandVarInfo = parsePokerHandVariable(
        condition.handType,
        joker
      );

      if (condition.operator === "contains") {
        if (pokerHandVarInfo.isPokerHandVariable) {
          const handReference = `G.GAME.current_round.${pokerHandVarInfo.variableName}_hand`;
          if (condition.negate) {
            return `not next(context.poker_hands[${handReference}])`;
          } else {
            return `next(context.poker_hands[${handReference}])`;
          }
        } else {
          if (condition.negate) {
            return `not next(context.poker_hands["${condition.handType}"])`;
          } else {
            return `next(context.poker_hands["${condition.handType}"])`;
          }
        }
      }

      if (condition.scope === "scoring") {
        if (pokerHandVarInfo.isPokerHandVariable) {
          const handReference = `G.GAME.current_round.${pokerHandVarInfo.variableName}_hand`;
          if (condition.operator === "not_equals" || condition.negate) {
            return `context.scoring_name ~= ${handReference}`;
          } else {
            return `context.scoring_name == ${handReference}`;
          }
        } else {
          if (condition.operator === "not_equals" || condition.negate) {
            return `context.scoring_name ~= "${condition.handType}"`;
          } else {
            return `context.scoring_name == "${condition.handType}"`;
          }
        }
      } else if (condition.scope === "all_played") {
        if (pokerHandVarInfo.isPokerHandVariable) {
          const handReference = `G.GAME.current_round.${pokerHandVarInfo.variableName}_hand`;
          if (condition.operator === "not_equals" || condition.negate) {
            return `not next(context.poker_hands[${handReference}])`;
          } else {
            return `next(context.poker_hands[${handReference}])`;
          }
        } else {
          if (condition.operator === "not_equals" || condition.negate) {
            return `not next(context.poker_hands["${condition.handType}"])`;
          } else {
            return `next(context.poker_hands["${condition.handType}"])`;
          }
        }
      }
      return "true";
    });

    return conditionChecks.join(" and ");
  }

  return "true";
};
