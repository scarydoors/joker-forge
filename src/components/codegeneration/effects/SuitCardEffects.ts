import type { Rule, Condition } from "../../ruleBuilder/types";

export interface SuitCondition {
  functionName: string;
  functionCode: string;
}

// Helper to get a descriptive function name for suit conditions
export const getSuitFunctionName = (
  suitType: string,
  specificSuit: string | null,
  suitGroup: string | null,
  quantifier: string,
  count: number,
  scope: string
): string => {
  const prefix = "check_suit";

  // Determine suit part of name
  let suitPart = "";
  if (suitType === "specific" && specificSuit) {
    suitPart = specificSuit.toLowerCase();
  } else if (suitType === "group" && suitGroup) {
    suitPart = suitGroup + "_suits";
  } else {
    suitPart = "unknown";
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

  return `${prefix}_${suitPart}_${quantifierPart}_${scopePart}`;
};

export const generateSuitCardCondition = (
  rules: Rule[]
): SuitCondition | null => {
  // Filter rules related to card suits
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

  // Find the first suit condition in any rule condition group
  let suitCondition: Condition | undefined;

  // Search through all rules and all groups for a suit-related condition
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
    if (suitCondition) break; // Exit once we find a condition
  }

  // If no suitable condition found, return null
  if (!suitCondition) {
    return null;
  }

  // Extract suit condition parameters
  const params = suitCondition.params;

  // Default values for parameters
  const suitType = (params.suit_type as string) || "specific";
  const specificSuit = (params.specific_suit as string) || null;
  const suitGroup = (params.suit_group as string) || null;
  const quantifier = (params.quantifier as string) || "at_least_one";
  const count = (params.count as number) || 1;
  const scope = (params.card_scope as string) || "scoring";

  // Generate function name
  const functionName = getSuitFunctionName(
    suitType,
    specificSuit,
    suitGroup,
    quantifier,
    count,
    scope
  );

  // Generate condition code based on suit type, quantifier, and scope
  let conditionCode = "";
  let conditionComment = "";

  // Helper function to get the suits check logic
  const getSuitsCheckLogic = (suits: string[]): string => {
    if (suits.length === 1) {
      return `c.suit == "${suits[0]}"`;
    } else {
      return suits.map((suit) => `c.suit == "${suit}"`).join(" or ");
    }
  };

  // Determine the suits to check based on type
  let suits: string[] = [];
  if (suitType === "specific" && specificSuit) {
    suits = [specificSuit];
    conditionComment = `-- Check for ${quantifier} ${specificSuit} cards in ${scope} cards`;
  } else if (suitType === "group" && suitGroup) {
    if (suitGroup === "red") {
      suits = ["Hearts", "Diamonds"];
      conditionComment = `-- Check for ${quantifier} Red suit cards in ${scope} cards`;
    } else if (suitGroup === "black") {
      suits = ["Spades", "Clubs"];
      conditionComment = `-- Check for ${quantifier} Black suit cards in ${scope} cards`;
    }
  }

  // Set up the card collection to check based on scope
  const cardsToCheck =
    scope === "scoring" ? "context.scoring_hand" : "context.full_hand";

  // Generate condition code based on quantifier
  switch (quantifier) {
    case "at_least_one":
      conditionCode = `
    local suitFound = false
    for i, c in ipairs(${cardsToCheck}) do
        if ${getSuitsCheckLogic(suits)} then
            suitFound = true
            break
        end
    end
    
    return suitFound`;
      break;

    case "all":
      conditionCode = `
    local allMatchSuit = true
    for i, c in ipairs(${cardsToCheck}) do
        if not (${getSuitsCheckLogic(suits)}) then
            allMatchSuit = false
            break
        end
    end
    
    return allMatchSuit and #${cardsToCheck} > 0`;
      break;

    case "exactly":
      conditionCode = `
    local suitCount = 0
    for i, c in ipairs(${cardsToCheck}) do
        if ${getSuitsCheckLogic(suits)} then
            suitCount = suitCount + 1
        end
    end
    
    return suitCount == ${count}`;
      break;

    case "at_least":
      conditionCode = `
    local suitCount = 0
    for i, c in ipairs(${cardsToCheck}) do
        if ${getSuitsCheckLogic(suits)} then
            suitCount = suitCount + 1
        end
    end
    
    return suitCount >= ${count}`;
      break;

    case "at_most":
      conditionCode = `
    local suitCount = 0
    for i, c in ipairs(${cardsToCheck}) do
        if ${getSuitsCheckLogic(suits)} then
            suitCount = suitCount + 1
        end
    end
    
    return suitCount <= ${count} and suitCount > 0`;
      break;

    default:
      // Default to at least one
      conditionCode = `
    local suitFound = false
    for i, c in ipairs(${cardsToCheck}) do
        if ${getSuitsCheckLogic(suits)} then
            suitFound = true
            break
        end
    end
    
    return suitFound`;
  }

  // Generate the function that checks if the suit condition is met
  const functionCode = `-- Suit condition check
local function ${functionName}(context)
    ${conditionComment}${conditionCode}
end`;

  return {
    functionName,
    functionCode,
  };
};
