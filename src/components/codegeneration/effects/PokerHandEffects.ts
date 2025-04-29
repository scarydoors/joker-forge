import { JokerData } from "../../JokerCard";
import { Rule } from "../../RuleBuilder/types";

// Generate poker hand-specific code for a joker
export const generatePokerHandCode = (
  joker: JokerData,
  rules: Rule[]
): string => {
  // Filter for poker hand rules
  const pokerHandRules =
    rules?.filter((rule) => rule.trigger === "poker_hand_played") || [];
  if (pokerHandRules.length === 0) return "";

  // Map hand types to their effects
  const handTypeEffects: Record<
    string,
    { chips?: number; mult?: number; xmult?: number }
  > = {};

  // Process rules to extract hand types and effects
  pokerHandRules.forEach((rule) => {
    rule.conditionGroups.forEach((group) => {
      group.conditions.forEach((condition) => {
        if (
          condition.type === "hand_type" &&
          condition.params.operator === "equals"
        ) {
          const handType = condition.params.value as string;

          // Extract effects for this hand type
          rule.effects.forEach((effect) => {
            if (!handTypeEffects[handType]) handTypeEffects[handType] = {};

            if (effect.type === "add_chips") {
              handTypeEffects[handType].chips = joker.chipAddition;
            } else if (effect.type === "add_mult") {
              handTypeEffects[handType].mult = joker.multAddition;
            } else if (effect.type === "apply_x_mult") {
              handTypeEffects[handType].xmult = joker.xMult;
            }
          });
        }
      });
    });
  });

  const handTypes = Object.keys(handTypeEffects);
  if (handTypes.length === 0) return "";

  // Build the calculate function
  let calculateCode = `calculate = function(self, card, context)
        -- Main scoring time for jokers - this is when most jokers apply their effects
        if context.cardarea == G.jokers and context.joker_main then`;

  if (handTypes.length === 1) {
    // Single hand type case (cleaner code)
    const handType = handTypes[0];
    const effects = handTypeEffects[handType];

    calculateCode += `
            -- Check if the current hand is a ${handType}
            if context.scoring_name == "${handType}" then
                return {`;

    if (effects.chips) {
      calculateCode += `
                    message = localize{type='variable',key='a_chips',vars={card.ability.extra.chips}},
                    chip_mod = card.ability.extra.chips,`;
    }

    if (effects.mult) {
      calculateCode += `
                    ${
                      !effects.chips
                        ? "message = localize{type='variable',key='a_mult',vars={card.ability.extra.mult}},"
                        : ""
                    }
                    mult_mod = card.ability.extra.mult,`;
    }

    if (effects.xmult) {
      calculateCode += `
                    ${
                      !effects.chips && !effects.mult
                        ? "message = localize{type='variable',key='a_xmult',vars={card.ability.extra.Xmult}},"
                        : ""
                    }
                    Xmult_mod = card.ability.extra.Xmult,`;
    }

    calculateCode += `
                    colour = G.C.CHIPS
                }
            end`;
  } else {
    // Multiple hand types case
    calculateCode += `
            -- Check for different poker hands
            local scoring_hand = context.scoring_name
            
            if `;

    // Build conditions for all hand types
    handTypes.forEach((handType, index) => {
      if (index > 0) calculateCode += ` or `;
      calculateCode += `scoring_hand == "${handType}"`;
    });

    calculateCode += ` then
                -- Determine effects based on which hand was played
                local chip_mod = 0
                local mult_mod = 0
                local xmult_mod = 1
                
                if `;

    // Handle each hand type separately
    handTypes.forEach((handType, index) => {
      if (index > 0) calculateCode += ` elseif `;
      calculateCode += `scoring_hand == "${handType}" then`;

      const effects = handTypeEffects[handType];
      if (effects.chips)
        calculateCode += `
                    chip_mod = card.ability.extra.chips`;
      if (effects.mult)
        calculateCode += `
                    mult_mod = card.ability.extra.mult`;
      if (effects.xmult)
        calculateCode += `
                    xmult_mod = card.ability.extra.Xmult`;
    });

    calculateCode += `
                end
                
                return {
                    message = localize{type='variable',key='a_chips',vars={chip_mod}},
                    chip_mod = chip_mod,
                    mult_mod = mult_mod,
                    Xmult_mod = xmult_mod,
                    colour = G.C.CHIPS
                }
            end`;
  }

  calculateCode += `
        end
    end`;

  return calculateCode;
};

// Generate a poker hand-specific description
export const generatePokerHandDescription = (
  joker: JokerData,
  rules: Rule[]
): string[] => {
  const pokerHandRules =
    rules?.filter((rule) => rule.trigger === "poker_hand_played") || [];
  if (pokerHandRules.length === 0) return [];

  // Find the first hand type condition
  let handType = "";
  outer: for (const rule of pokerHandRules) {
    for (const group of rule.conditionGroups) {
      for (const condition of group.conditions) {
        if (
          condition.type === "hand_type" &&
          condition.params.operator === "equals"
        ) {
          handType = condition.params.value as string;
          break outer;
        }
      }
    }
  }

  if (!handType) return [];

  // Build description based on effects
  const lines = [];

  if (joker.chipAddition > 0) {
    lines.push(`{C:chips}+${joker.chipAddition} Chips{} when`);
    lines.push(`a {C:attention}${handType}{} is played`);
  } else if (joker.multAddition > 0) {
    lines.push(`{C:mult}+${joker.multAddition} Mult{} when`);
    lines.push(`a {C:attention}${handType}{} is played`);
  } else if (joker.xMult > 1) {
    lines.push(`{X:mult,C:white}X${joker.xMult}{} when`);
    lines.push(`a {C:attention}${handType}{} is played`);
  }

  return lines;
};
