import type { Rule } from "../../ruleBuilder/types";

export const generateSuitCardConditionCode = (rules: Rule[]): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const triggerType = rules[0].trigger || "hand_played";

  const suitType = (condition.params.suit_type as string) || "specific";
  const specificSuit = (condition.params.specific_suit as string) || null;
  const suitGroup = (condition.params.suit_group as string) || null;
  const quantifier = (condition.params.quantifier as string) || "at_least_one";
  const count = (condition.params.count as number) || 1;
  const scope = (condition.params.card_scope as string) || "scoring";

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

  if (
    triggerType === "card_discarded" ||
    triggerType === "card_held_in_hand" ||
    (triggerType === "card_scored" && condition.type === "card_suit")
  ) {
    const checkLogic = getSuitsCheckLogic(suits).replace(
      /c:/g,
      "context.other_card:"
    );
    return checkLogic;
  } else {
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
