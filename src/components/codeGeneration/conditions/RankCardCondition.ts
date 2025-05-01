import type { Rule, Condition } from "../../ruleBuilder/types";

export interface RankCondition {
  functionName: string;
  functionCode: string;
}

// Helper to get a descriptive function name for rank conditions
export const getRankFunctionName = (
  rankType: string,
  specificRank: string | null,
  rankGroup: string | null,
  quantifier: string,
  count: number,
  scope: string
): string => {
  const prefix = "check_rank";

  // Determine rank part of name
  let rankPart = "";
  if (rankType === "specific" && specificRank) {
    rankPart = specificRank.toLowerCase();
  } else if (rankType === "group" && rankGroup) {
    rankPart = rankGroup + "_ranks";
  } else {
    rankPart = "unknown";
  }

  // Determine quantifier part
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

  // Add scope
  const scopePart = scope === "all_played" ? "played" : "scoring";

  return `${prefix}_${rankPart}_${quantifierPart}_${scopePart}`;
};

export const generateRankCardCondition = (
  rules: Rule[]
): RankCondition | null => {
  // Filter rules related to card ranks
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

  // Find the first rank condition in any rule condition group
  let rankCondition: Condition | undefined;

  // Search through all rules and all groups for a rank-related condition
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
    if (rankCondition) break; // Exit once we find a condition
  }

  // If no suitable condition found, return null
  if (!rankCondition) {
    return null;
  }

  // Extract rank condition parameters
  const params = rankCondition.params;

  // Default values for parameters
  const rankType = (params.rank_type as string) || "specific";
  const specificRank = (params.specific_rank as string) || null;
  const rankGroup = (params.rank_group as string) || null;
  const quantifier = (params.quantifier as string) || "at_least_one";
  const count = (params.count as number) || 1;
  const scope = (params.card_scope as string) || "scoring";

  // Generate function name
  const functionName = getRankFunctionName(
    rankType,
    specificRank,
    rankGroup,
    quantifier,
    count,
    scope
  );

  // Generate condition code based on rank type, quantifier, and scope
  let conditionCode = "";
  let conditionComment = "";

  // Helper function to get the ranks check logic
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
      // For numeric ranks (2-10) or named ranks (J, Q, K, A)
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
      // Multiple specific ranks
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

  // Determine the ranks to check based on type
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

  // Set up the card collection to check based on scope
  const cardsToCheck =
    scope === "scoring" ? "context.scoring_hand" : "context.full_hand";

  // Generate condition code based on quantifier
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

  // Generate the function that checks if the rank condition is met
  const functionCode = `-- Rank condition check
local function ${functionName}(context)
    ${conditionComment}${conditionCode}
end`;

  return {
    functionName,
    functionCode,
  };
};
