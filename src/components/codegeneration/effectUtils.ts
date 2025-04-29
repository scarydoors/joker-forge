import { JokerData } from "../JokerCard";

export interface ReturnStatementResult {
  statement: string;
  colour: string;
}

/**
 * Generate a return statement based on effect type or joker properties
 */
export function generateEffectReturnStatement(
  effectType: string,
  joker: JokerData
): ReturnStatementResult {
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

  return { statement: returnStatement, colour };
}

/**
 * Generate a fallback calculate function if other methods fail
 */
export function generateFallbackCalculate(joker: JokerData): string {
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
}
