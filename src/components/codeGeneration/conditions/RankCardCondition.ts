import type { Rule, Condition } from "../../ruleBuilder/types";

export interface RankCondition {
  functionName: string;
  functionCode: string;
}

export const getRankFunctionName = (
  rankType: string,
  specificRank: string | null,
  rankGroup: string | null,
  quantifier: string,
  count: number,
  scope: string
): string => {
  const prefix = "check_rank";

  let rankPart = "";
  if (rankType === "specific" && specificRank) {
    rankPart = specificRank.toLowerCase();
  } else if (rankType === "group" && rankGroup) {
    rankPart = rankGroup + "_ranks";
  } else {
    rankPart = "unknown";
  }

  let quantifierPart = "";
  switch (quantifier) {
    case "at_least_one":
      quantifierPart = "has";
      break;
    case "all":
      quantifierPart = "all";
      break;
    case "exactly":
      quantifierPart = `exactly_${count}`;
      break;
    case "at_least":
      quantifierPart = `at_least_${count}`;
      break;
    case "at_most":
      quantifierPart = `at_most_${count}`;
      break;
    default:
      quantifierPart = quantifier;
  }

  const scopePart = scope === "all_played" ? "played" : "scoring";

  return `${prefix}_${rankPart}_${quantifierPart}_${scopePart}`;
};

export const generateRankCardCondition = (
  rules: Rule[]
): RankCondition | null => {
  const rankRules = rules?.filter((rule) => {
    return rule.conditionGroups.some((group) =>
      group.conditions.some(
        (condition) =>
          condition.type === "rank_count" || condition.type === "card_rank"
      )
    );
  });

  if (!rankRules || rankRules.length === 0) {
    return null;
  }

  let rankCondition: Condition | undefined;

  for (const rule of rankRules) {
    for (const group of rule.conditionGroups) {
      const condition = group.conditions.find(
        (c) => c.type === "rank_count" || c.type === "card_rank"
      );
      if (condition) {
        rankCondition = condition;
        break;
      }
    }
    if (rankCondition) break;
  }

  if (!rankCondition) {
    return null;
  }

  const params = rankCondition.params;
  const triggerType = rankRules[0]?.trigger || "hand_played";

  const rankType = (params.rank_type as string) || "specific";
  const specificRank = (params.specific_rank as string) || null;
  const rankGroup = (params.rank_group as string) || null;
  const quantifier = (params.quantifier as string) || "at_least_one";
  const count = (params.count as number) || 1;
  const scope = (params.card_scope as string) || "scoring";

  const functionName = getRankFunctionName(
    rankType,
    specificRank,
    rankGroup,
    quantifier,
    count,
    scope
  );

  let conditionCode = "";
  let conditionComment = "";

  const getRanksCheckLogic = (
    ranks: string[],
    rankGroupType: string | null
  ): string => {
    if (rankGroupType === "face") {
      return "c:is_face()";
    } else if (rankGroupType === "even") {
      return "(c:get_id() % 2 == 0)";
    } else if (rankGroupType === "odd") {
      return "(c:get_id() % 2 == 1)";
    } else if (ranks.length === 1) {
      if (ranks[0] === "J") {
        return "c:get_id() == 11";
      } else if (ranks[0] === "Q") {
        return "c:get_id() == 12";
      } else if (ranks[0] === "K") {
        return "c:get_id() == 13";
      } else if (ranks[0] === "A") {
        return "c:get_id() == 14";
      } else {
        return `c:get_id() == ${ranks[0]}`;
      }
    } else {
      return ranks
        .map((rank) => {
          if (rank === "J") {
            return "c:get_id() == 11";
          } else if (rank === "Q") {
            return "c:get_id() == 12";
          } else if (rank === "K") {
            return "c:get_id() == 13";
          } else if (rank === "A") {
            return "c:get_id() == 14";
          } else {
            return `c:get_id() == ${rank}`;
          }
        })
        .join(" or ");
    }
  };

  let ranks: string[] = [];
  let rankGroupType: string | null = null;

  if (rankType === "specific" && specificRank) {
    ranks = [specificRank];
    conditionComment = `-- Check for ${quantifier} ${specificRank} cards in ${scope} cards`;
  } else if (rankType === "group" && rankGroup) {
    rankGroupType = rankGroup;
    if (rankGroup === "face") {
      conditionComment = `-- Check for ${quantifier} face cards in ${scope} cards`;
    } else if (rankGroup === "even") {
      conditionComment = `-- Check for ${quantifier} even cards in ${scope} cards`;
    } else if (rankGroup === "odd") {
      conditionComment = `-- Check for ${quantifier} odd cards in ${scope} cards`;
    }
  }

  const cardsToCheck =
    scope === "scoring" ? "context.scoring_hand" : "context.full_hand";

  // Special handling for card_scored trigger type
  if (triggerType === "card_scored") {
    // For individual card scoring, we check the other_card directly
    const checkLogic = getRanksCheckLogic(ranks, rankGroupType).replace(
      /c:/g,
      "context.other_card:"
    );

    conditionCode = `
    return ${checkLogic}`;

    conditionComment = `-- Check if scored card matches ${
      rankType === "specific" ? specificRank : rankGroup
    } rank`;
  } else {
    // For hand_played trigger, use the original logic with loops
    switch (quantifier) {
      case "at_least_one":
        conditionCode = `
    local rankFound = false
    for i, c in ipairs(${cardsToCheck}) do
        if ${getRanksCheckLogic(ranks, rankGroupType)} then
            rankFound = true
            break
        end
    end
    
    return rankFound`;
        break;

      case "all":
        conditionCode = `
    local allMatchRank = true
    for i, c in ipairs(${cardsToCheck}) do
        if not (${getRanksCheckLogic(ranks, rankGroupType)}) then
            allMatchRank = false
            break
        end
    end
    
    return allMatchRank and #${cardsToCheck} > 0`;
        break;

      case "exactly":
        conditionCode = `
    local rankCount = 0
    for i, c in ipairs(${cardsToCheck}) do
        if ${getRanksCheckLogic(ranks, rankGroupType)} then
            rankCount = rankCount + 1
        end
    end
    
    return rankCount == ${count}`;
        break;

      case "at_least":
        conditionCode = `
    local rankCount = 0
    for i, c in ipairs(${cardsToCheck}) do
        if ${getRanksCheckLogic(ranks, rankGroupType)} then
            rankCount = rankCount + 1
        end
    end
    
    return rankCount >= ${count}`;
        break;

      case "at_most":
        conditionCode = `
    local rankCount = 0
    for i, c in ipairs(${cardsToCheck}) do
        if ${getRanksCheckLogic(ranks, rankGroupType)} then
            rankCount = rankCount + 1
        end
    end
    
    return rankCount <= ${count} and rankCount > 0`;
        break;

      default:
        conditionCode = `
    local rankFound = false
    for i, c in ipairs(${cardsToCheck}) do
        if ${getRanksCheckLogic(ranks, rankGroupType)} then
            rankFound = true
            break
        end
    end
    
    return rankFound`;
    }
  }

  const functionCode = `-- Rank condition check
local function ${functionName}(context)
    ${conditionComment}${conditionCode}
end`;

  return {
    functionName,
    functionCode,
  };
};
