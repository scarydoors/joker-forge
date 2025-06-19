import type { Rule, Condition } from "../../ruleBuilder/types";

export const generateSuitCardConditionCode = (rules: Rule[]): string | null => {
  const suitRules = rules?.filter((rule) => {
    return rule.conditionGroups.some((group) =>
      group.conditions.some(
        (condition) =>
          condition.type === "suit_count" || condition.type === "card_suit"
      )
    );
  });

  if (!suitRules || suitRules.length === 0) {
    return null;
  }

  let suitCondition: Condition | undefined;

  for (const rule of suitRules) {
    for (const group of rule.conditionGroups) {
      const condition = group.conditions.find(
        (c) => c.type === "suit_count" || c.type === "card_suit"
      );
      if (condition) {
        suitCondition = condition;
        break;
      }
    }
    if (suitCondition) break;
  }

  if (!suitCondition) {
    return null;
  }

  const params = suitCondition.params;
  const triggerType = suitRules[0]?.trigger || "hand_played";

  const suitType = (params.suit_type as string) || "specific";
  const specificSuit = (params.specific_suit as string) || null;
  const suitGroup = (params.suit_group as string) || null;
  const quantifier = (params.quantifier as string) || "at_least_one";
  const count = (params.count as number) || 1;
  const scope = (params.card_scope as string) || "scoring";

  const getSuitsCheckLogic = (suits: string[]): string => {
    if (suits.length === 1) {
      return `c:is_suit("${suits[0]}")`;
    } else {
      return suits.map((suit) => `c:is_suit("${suit}")`).join(" or ");
    }
  };

  let suits: string[] = [];
  if (suitType === "specific" && specificSuit) {
    suits = [specificSuit];
  } else if (suitType === "group" && suitGroup) {
    if (suitGroup === "red") {
      suits = ["Hearts", "Diamonds"];
    } else if (suitGroup === "black") {
      suits = ["Spades", "Clubs"];
    }
  }

  const cardsToCheck =
    scope === "scoring" ? "context.scoring_hand" : "context.full_hand";

  // Special handling for card_scored trigger type
  if (triggerType === "card_scored" || triggerType === "card_discarded") {
    // For individual card scoring, we check the other_card directly
    const checkLogic = getSuitsCheckLogic(suits).replace(
      /c:/g,
      "context.other_card:"
    );

    return checkLogic;
  } else {
    // For hand_played trigger, use the original logic with loops
    switch (quantifier) {
      case "at_least_one":
        return `(function()
    local suitFound = false
    for i, c in ipairs(${cardsToCheck}) do
        if ${getSuitsCheckLogic(suits)} then
            suitFound = true
            break
        end
    end
    
    return suitFound
end)()`;

      case "all":
        return `(function()
    local allMatchSuit = true
    for i, c in ipairs(${cardsToCheck}) do
        if not (${getSuitsCheckLogic(suits)}) then
            allMatchSuit = false
            break
        end
    end
    
    return allMatchSuit and #${cardsToCheck} > 0
end)()`;

      case "exactly":
        return `(function()
    local suitCount = 0
    for i, c in ipairs(${cardsToCheck}) do
        if ${getSuitsCheckLogic(suits)} then
            suitCount = suitCount + 1
        end
    end
    
    return suitCount == ${count}
end)()`;

      case "at_least":
        return `(function()
    local suitCount = 0
    for i, c in ipairs(${cardsToCheck}) do
        if ${getSuitsCheckLogic(suits)} then
            suitCount = suitCount + 1
        end
    end
    
    return suitCount >= ${count}
end)()`;

      case "at_most":
        return `(function()
    local suitCount = 0
    for i, c in ipairs(${cardsToCheck}) do
        if ${getSuitsCheckLogic(suits)} then
            suitCount = suitCount + 1
        end
    end
    
    return suitCount <= ${count} and suitCount > 0
end)()`;

      default:
        return `(function()
    local suitFound = false
    for i, c in ipairs(${cardsToCheck}) do
        if ${getSuitsCheckLogic(suits)} then
            suitFound = true
            break
        end
    end
    
    return suitFound
end)()`;
    }
  }
};
