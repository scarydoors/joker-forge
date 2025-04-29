import { JokerData } from "../../JokerCard";
import { Rule, Condition } from "../../ruleBuilder/types";

export const generateSuitCardCode = (
  joker: JokerData,
  rules: Rule[]
): string => {
  console.log("Generating suit card code"); // Debug

  // Filter rules related to card suits
  const suitRules = rules?.filter((rule) => {
    return rule.conditionGroups.some((group) =>
      group.conditions.some((condition) => condition.type === "card_suit")
    );
  });

  if (suitRules.length === 0) {
    console.warn("No suit rules found");
    return "";
  }

  // Find the first suit condition in any rule condition group
  let suitCondition: Condition | undefined;

  // Search through all rules and all groups for a card_suit condition
  for (const rule of suitRules) {
    for (const group of rule.conditionGroups) {
      const condition = group.conditions.find((c) => c.type === "card_suit");
      if (condition) {
        suitCondition = condition;
        break;
      }
    }
    if (suitCondition) break; // Exit once we find a condition
  }

  if (!suitCondition) {
    console.warn("Could not find card_suit condition");
    return generateFallbackCalculate(joker);
  }

  // Extract effect type and value
  let effectType = "";
  let effectValue: any = null;

  // First check rule effects (they take priority)
  if (suitRules[0].effects.length > 0) {
    const effect = suitRules[0].effects[0];
    effectType = effect.type;
    effectValue = effect.params.value;
  }
  // Then check joker properties as fallback
  else if (joker.chipAddition > 0) {
    effectType = "add_chips";
    effectValue = joker.chipAddition;
  } else if (joker.multAddition > 0) {
    effectType = "add_mult";
    effectValue = joker.multAddition;
  } else if (joker.xMult > 1) {
    effectType = "apply_x_mult";
    effectValue = joker.xMult;
  }

  // Generate return statement based on effect type
  let returnStatement = "";
  let colour = "G.C.WHITE";

  if (effectType === "add_chips" || joker.chipAddition > 0) {
    returnStatement = `
                message = localize{type='variable',key='a_chips',vars={card.ability.extra.chips}},
                chip_mod = card.ability.extra.chips`;
    colour = "G.C.CHIPS";
  } else if (effectType === "add_mult" || joker.multAddition > 0) {
    returnStatement = `
                message = localize{type='variable',key='a_mult',vars={card.ability.extra.mult}},
                mult_mod = card.ability.extra.mult`;
    colour = "G.C.MULT";
  } else if (effectType === "apply_x_mult" || joker.xMult > 1) {
    returnStatement = `
                message = localize{type='variable',key='a_xmult',vars={card.ability.extra.Xmult}},
                Xmult_mod = card.ability.extra.Xmult`;
    colour = "G.C.MONEY";
  } else {
    // Default case
    returnStatement = `
                message = "Activated!"`;
  }

  // Extract suit condition parameters with defaults
  const quantifier =
    (suitCondition.params.quantifier as string) || "at_least_one";
  const count = (suitCondition.params.count as number) || 1;
  const suitType = (suitCondition.params.suit_type as string) || "specific";

  try {
    // Generate condition code based on suit type and quantifier
    let conditionCode = "";

    if (suitType === "specific") {
      const specificSuit =
        (suitCondition.params.specific_suit as string) || "Hearts";
      conditionCode = generateSpecificSuitCondition(
        specificSuit,
        quantifier,
        count
      );
    } else if (suitType === "group") {
      const suitGroup = (suitCondition.params.suit_group as string) || "red";
      conditionCode = generateSuitGroupCondition(suitGroup, quantifier, count);
    } else {
      // Default fallback
      conditionCode = generateSpecificSuitCondition(
        "Hearts",
        "at_least_one",
        1
      );
    }

    // Combine everything into the calculate function
    return `calculate = function(self, card, context)
    -- Main scoring time for jokers
    if context.cardarea == G.jokers and context.joker_main then
${conditionCode}
            return {${returnStatement},
                colour = ${colour}
            }
        end
    end
end`;
  } catch (error) {
    console.error("Error generating suit card code:", error);
    return generateFallbackCalculate(joker);
  }
};

// Fallback calculate function if something goes wrong
const generateFallbackCalculate = (joker: JokerData): string => {
  if (joker.chipAddition > 0) {
    return `calculate = function(self, card, context)
        if context.joker_main then
            return {
                message = localize{type='variable',key='a_chips',vars={card.ability.extra.chips}},
                chip_mod = card.ability.extra.chips,
                colour = G.C.CHIPS
            }
        end
    end`;
  } else if (joker.multAddition > 0) {
    return `calculate = function(self, card, context)
        if context.joker_main then
            return {
                message = localize{type='variable',key='a_mult',vars={card.ability.extra.mult}},
                mult_mod = card.ability.extra.mult,
                colour = G.C.MULT
            }
        end
    end`;
  } else if (joker.xMult > 1) {
    return `calculate = function(self, card, context)
        if context.joker_main then
            return {
                message = localize{type='variable',key='a_xmult',vars={card.ability.extra.Xmult}},
                Xmult_mod = card.ability.extra.Xmult,
                colour = G.C.MONEY
            }
        end
    end`;
  } else {
    return `calculate = function(self, card, context) end`;
  }
};

// Helper function to generate condition code for specific suits
const generateSpecificSuitCondition = (
  suit: string,
  quantifier: string,
  count: number
): string => {
  switch (quantifier) {
    case "at_least_one":
      return `        -- Check if at least one ${suit} card exists
        local suitFound = false
        for i, c in ipairs(context.scoring_hand) do
            if c.suit == "${suit}" then
                suitFound = true
                break
            end
        end
        
        if suitFound then`;

    case "all":
      return `        -- Check if all cards are ${suit}
        local allMatchSuit = true
        for i, c in ipairs(context.scoring_hand) do
            if c.suit ~= "${suit}" then
                allMatchSuit = false
                break
            end
        end
        
        if allMatchSuit and #context.scoring_hand > 0 then`;

    case "exactly":
      return `        -- Count ${suit} cards
        local suitCount = 0
        for i, c in ipairs(context.scoring_hand) do
            if c.suit == "${suit}" then
                suitCount = suitCount + 1
            end
        end
        
        if suitCount == ${count} then`;

    case "at_least":
      return `        -- Count ${suit} cards for at least ${count}
        local suitCount = 0
        for i, c in ipairs(context.scoring_hand) do
            if c.suit == "${suit}" then
                suitCount = suitCount + 1
            end
        end
        
        if suitCount >= ${count} then`;

    case "at_most":
      return `        -- Count ${suit} cards for at most ${count}
        local suitCount = 0
        for i, c in ipairs(context.scoring_hand) do
            if c.suit == "${suit}" then
                suitCount = suitCount + 1
            end
        end
        
        if suitCount <= ${count} and suitCount > 0 then`;

    default:
      return `        -- Default to at least one ${suit} card
        local suitFound = false
        for i, c in ipairs(context.scoring_hand) do
            if c.suit == "${suit}" then
                suitFound = true
                break
            end
        end
        
        if suitFound then`;
  }
};

// Helper function to generate condition code for suit groups
const generateSuitGroupCondition = (
  suitGroup: string,
  quantifier: string,
  count: number
): string => {
  // Define suits in each group
  const redSuits = ["Hearts", "Diamonds"];
  const blackSuits = ["Spades", "Clubs"];

  // Select the appropriate suits based on group
  const suits = suitGroup === "red" ? redSuits : blackSuits;
  const suitsString = suits.map((s) => `c.suit == "${s}"`).join(" or ");
  const groupName = suitGroup === "red" ? "Red" : "Black";

  switch (quantifier) {
    case "at_least_one":
      return `        -- Check if at least one ${groupName} suit card exists
        local suitFound = false
        for i, c in ipairs(context.scoring_hand) do
            if ${suitsString} then
                suitFound = true
                break
            end
        end
        
        if suitFound then`;

    case "all":
      return `        -- Check if all cards are ${groupName} suit
        local allMatchGroup = true
        for i, c in ipairs(context.scoring_hand) do
            if not (${suitsString}) then
                allMatchGroup = false
                break
            end
        end
        
        if allMatchGroup and #context.scoring_hand > 0 then`;

    case "exactly":
      return `        -- Count ${groupName} suit cards
        local groupCount = 0
        for i, c in ipairs(context.scoring_hand) do
            if ${suitsString} then
                groupCount = groupCount + 1
            end
        end
        
        if groupCount == ${count} then`;

    case "at_least":
      return `        -- Count ${groupName} suit cards for at least ${count}
        local groupCount = 0
        for i, c in ipairs(context.scoring_hand) do
            if ${suitsString} then
                groupCount = groupCount + 1
            end
        end
        
        if groupCount >= ${count} then`;

    case "at_most":
      return `        -- Count ${groupName} suit cards for at most ${count}
        local groupCount = 0
        for i, c in ipairs(context.scoring_hand) do
            if ${suitsString} then
                groupCount = groupCount + 1
            end
        end
        
        if groupCount <= ${count} and groupCount > 0 then`;

    default:
      return `        -- Default to at least one ${groupName} suit card
        local suitFound = false
        for i, c in ipairs(context.scoring_hand) do
            if ${suitsString} then
                suitFound = true
                break
            end
        end
        
        if suitFound then`;
  }
};
