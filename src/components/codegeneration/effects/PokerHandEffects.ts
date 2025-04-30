import type { Rule } from "../../ruleBuilder/types";

export interface PokerHandCondition {
  functionName: string;
  functionCode: string;
}

// Return descriptive function name based on condition
export const getPokerHandFunctionName = (
  handType: string,
  scope: string,
  negate: boolean
): string => {
  const prefix = "check_poker_hand";
  const handTypePart = handType.toLowerCase().replace(/\s+/g, "_");
  const scopePart = scope === "all_played" ? "any" : "scoring";
  const negatePart = negate ? "not_" : "";

  return `${prefix}_${negatePart}${handTypePart}_${scopePart}`;
};

export const generatePokerHandCondition = (
  rules: Rule[]
): PokerHandCondition | null => {
  const pokerHandRules =
    rules?.filter((rule) => rule.trigger === "hand_played") || [];
  if (pokerHandRules.length === 0) return null;

  // Structure to track hand type conditions and their card scope
  type HandTypeConditionDef = {
    handType: string;
    scope: string;
    negate: boolean;
  };

  const handConditions: HandTypeConditionDef[] = [];

  // Extract hand types and card scope from conditions
  pokerHandRules.forEach((rule) => {
    rule.conditionGroups.forEach((group) => {
      group.conditions.forEach((condition) => {
        if (condition.type === "hand_type") {
          // Only process hand_type conditions with equals or not_equals operators
          if (
            condition.params.operator === "equals" ||
            condition.params.operator === "not_equals"
          ) {
            handConditions.push({
              handType: condition.params.value as string,
              scope: (condition.params.card_scope as string) || "scoring", // Default to scoring if not specified
              negate:
                condition.params.operator === "not_equals" || condition.negate,
            });
          }
        }
      });
    });
  });

  if (handConditions.length === 0) return null;

  // Generate code for hand conditions
  let conditionChecks = "";
  let conditionComment = "";

  // Create the condition check code and appropriate comment
  if (handConditions.length === 1) {
    // Single condition case
    const condition = handConditions[0];

    // Generate descriptive function name
    const functionName = getPokerHandFunctionName(
      condition.handType,
      condition.scope,
      condition.negate
    );

    if (condition.scope === "scoring") {
      // For scoring cards, check the scoring_name
      if (condition.negate) {
        conditionChecks = `context.scoring_name ~= "${condition.handType}"`;
        conditionComment = `-- Check if scoring hand is NOT a ${condition.handType}`;
      } else {
        conditionChecks = `context.scoring_name == "${condition.handType}"`;
        conditionComment = `-- Check if scoring hand is a ${condition.handType}`;
      }
    } else if (condition.scope === "all_played") {
      // For all played cards, check if the poker hand exists in context.poker_hands
      if (condition.negate) {
        conditionChecks = `not next(context.poker_hands["${condition.handType}"] or {})`;
        conditionComment = `-- Check if NO ${condition.handType} exists in played cards`;
      } else {
        conditionChecks = `next(context.poker_hands["${condition.handType}"] or {})`;
        conditionComment = `-- Check if a ${condition.handType} exists in played cards`;
      }
    }

    // Generate the function that checks if the hand condition is met
    const functionCode = `-- Poker hand condition check
local function ${functionName}(context)
    ${conditionComment}
    return ${conditionChecks}
end`;

    return { functionName, functionCode };
  } else {
    // Multiple conditions case - using AND logic between them
    conditionComment = `-- Check that ALL of the following poker hand conditions are true:`;

    // Generate a compound function name
    const functionName =
      "check_poker_hand_compound_" +
      handConditions
        .map((c) => c.handType.toLowerCase().replace(/\s+/g, "_"))
        .join("_and_");

    handConditions.forEach((condition, index) => {
      if (index > 0) conditionChecks += " and "; // AND logic between conditions

      // Different check based on card scope
      if (condition.scope === "scoring") {
        // For scoring cards, check the scoring_name
        if (condition.negate) {
          conditionChecks += `context.scoring_name ~= "${condition.handType}"`;
        } else {
          conditionChecks += `context.scoring_name == "${condition.handType}"`;
        }

        conditionComment += `\n    -- ${index + 1}. ${
          condition.negate ? "NOT " : ""
        }${condition.handType} (scoring hand)`;
      } else if (condition.scope === "all_played") {
        // For all played cards, check if the poker hand exists in context.poker_hands
        if (condition.negate) {
          conditionChecks += `not next(context.poker_hands["${condition.handType}"] or {})`;
        } else {
          conditionChecks += `next(context.poker_hands["${condition.handType}"] or {})`;
        }

        conditionComment += `\n    -- ${index + 1}. ${
          condition.negate ? "NO " : ""
        }${condition.handType} (any played cards)`;
      }
    });

    // Generate the function that checks if the compound hand condition is met
    const functionCode = `-- Poker hand condition check (compound)
local function ${functionName}(context)
    ${conditionComment}
    return ${conditionChecks}
end`;

    return { functionName, functionCode };
  }
};
