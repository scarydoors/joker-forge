import type { Rule } from "../../ruleBuilder/types";

export const generateRankCardConditionCode = (rules: Rule[]): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const triggerType = rules[0].trigger || "hand_played";

  const rankType = (condition.params.rank_type as string) || "specific";
  const specificRank = (condition.params.specific_rank as string) || null;
  const rankGroup = (condition.params.rank_group as string) || null;
  const quantifier = (condition.params.quantifier as string) || "at_least_one";
  const count = condition.params.count as number;
  const scope = (condition.params.card_scope as string) || "scoring";

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
  } else if (rankType === "group" && rankGroup) {
    rankGroupType = rankGroup;
  }

  const cardsToCheck =
    scope === "scoring" ? "context.scoring_hand" : "context.full_hand";

  if (
    triggerType === "card_scored" ||
    triggerType === "card_discarded" ||
    triggerType === "card_held_in_hand"
  ) {
    const checkLogic = getRanksCheckLogic(ranks, rankGroupType).replace(
      /c:/g,
      "context.other_card:"
    );
    return checkLogic;
  } else {
    switch (quantifier) {
      case "at_least_one":
        return `(function()
    local rankFound = false
    for i, c in ipairs(${cardsToCheck}) do
        if ${getRanksCheckLogic(ranks, rankGroupType)} then
            rankFound = true
            break
        end
    end
    
    return rankFound
end)()`;

      case "all":
        return `(function()
    local allMatchRank = true
    for i, c in ipairs(${cardsToCheck}) do
        if not (${getRanksCheckLogic(ranks, rankGroupType)}) then
            allMatchRank = false
            break
        end
    end
    
    return allMatchRank and #${cardsToCheck} > 0
end)()`;

      case "exactly":
        return `(function()
    local rankCount = 0
    for i, c in ipairs(${cardsToCheck}) do
        if ${getRanksCheckLogic(ranks, rankGroupType)} then
            rankCount = rankCount + 1
        end
    end
    
    return rankCount == ${count}
end)()`;

      case "at_least":
        return `(function()
    local rankCount = 0
    for i, c in ipairs(${cardsToCheck}) do
        if ${getRanksCheckLogic(ranks, rankGroupType)} then
            rankCount = rankCount + 1
        end
    end
    
    return rankCount >= ${count}
end)()`;

      case "at_most":
        return `(function()
    local rankCount = 0
    for i, c in ipairs(${cardsToCheck}) do
        if ${getRanksCheckLogic(ranks, rankGroupType)} then
            rankCount = rankCount + 1
        end
    end
    
    return rankCount <= ${count} and rankCount > 0
end)()`;

      default:
        return `(function()
    local rankFound = false
    for i, c in ipairs(${cardsToCheck}) do
        if ${getRanksCheckLogic(ranks, rankGroupType)} then
            rankFound = true
            break
        end
    end
    
    return rankFound
end)()`;
    }
  }
};
