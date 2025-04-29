import { JokerData } from "../../JokerCard";
import { Rule } from "../../ruleBuilder/types";

export const generatePokerHandCode = (
  joker: JokerData,
  rules: Rule[]
): string => {
  const pokerHandRules =
    rules?.filter((rule) => rule.trigger === "poker_hand_played") || [];
  if (pokerHandRules.length === 0) return "";

  const handTypes: string[] = [];
  pokerHandRules.forEach((rule) => {
    rule.conditionGroups.forEach((group) => {
      group.conditions.forEach((condition) => {
        if (
          condition.type === "hand_type" &&
          condition.params.operator === "equals"
        ) {
          handTypes.push(condition.params.value as string);
        }
      });
    });
  });

  if (handTypes.length === 0) return "";

  if (handTypes.length === 1) {
    const handType = handTypes[0];
    let calculateCode = `calculate = function(self, card, context)
        if context.cardarea == G.jokers and context.joker_main then
            if context.scoring_name == "${handType}" then
                return {`;

    if (joker.chipAddition > 0) {
      calculateCode += `
                    message = localize{type='variable',key='a_chips',vars={card.ability.extra.chips}},
                    chip_mod = card.ability.extra.chips,`;
    }

    if (joker.multAddition > 0) {
      calculateCode += `
                    ${
                      !joker.chipAddition
                        ? "message = localize{type='variable',key='a_mult',vars={card.ability.extra.mult}},"
                        : ""
                    }
                    mult_mod = card.ability.extra.mult,`;
    }

    if (joker.xMult > 1) {
      calculateCode += `
                    ${
                      !joker.chipAddition && !joker.multAddition
                        ? "message = localize{type='variable',key='a_xmult',vars={card.ability.extra.Xmult}},"
                        : ""
                    }
                    Xmult_mod = card.ability.extra.Xmult,`;
    }

    calculateCode += `
                    colour = G.C.CHIPS
                }
            end
        end
    end`;

    return calculateCode;
  } else {
    let calculateCode = `calculate = function(self, card, context)
        if context.cardarea == G.jokers and context.joker_main then
            local handType = context.scoring_name
            
            if `;

    handTypes.forEach((handType, index) => {
      if (index > 0) calculateCode += ` or `;
      calculateCode += `handType == "${handType}"`;
    });

    calculateCode += ` then
                if `;

    handTypes.forEach((handType, index) => {
      if (index > 0) calculateCode += ` elseif `;
      calculateCode += `handType == "${handType}" then`;

      if (joker.chipAddition > 0) {
        calculateCode += `
                    return {
                        message = localize{type='variable',key='a_chips',vars={card.ability.extra.chips}},
                        chip_mod = card.ability.extra.chips,
                        colour = G.C.CHIPS
                    }`;
      } else if (joker.multAddition > 0) {
        calculateCode += `
                    return {
                        message = localize{type='variable',key='a_mult',vars={card.ability.extra.mult}},
                        mult_mod = card.ability.extra.mult,
                        colour = G.C.MULT
                    }`;
      } else if (joker.xMult > 1) {
        calculateCode += `
                    return {
                        message = localize{type='variable',key='a_xmult',vars={card.ability.extra.Xmult}},
                        Xmult_mod = card.ability.extra.Xmult,
                        colour = G.C.MONEY
                    }`;
      }
    });

    calculateCode += `
                end
            end
        end
    end`;

    return calculateCode;
  }
};

// Don't generate descriptions - keep what user entered
export const generatePokerHandDescription = (): string[] => {
  return [];
};
