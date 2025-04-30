import { JokerData } from "../JokerCard";
import type { Rule, Effect } from "../ruleBuilder/types";

export interface ReturnStatementResult {
  statement: string;
  colour: string;
}

/**
 * Generate a return statement based on effect types and joker properties
 * Chains multiple effects with their own messages using the 'extra' field
 */
export function generateEffectReturnStatement(
  joker: JokerData,
  effectTypes: string[] = []
): ReturnStatementResult {
  // Keep track of active effects for chaining
  const activeEffects: string[] = [];

  // Add joker default effects if they're set
  if (joker.chipAddition > 0 && !effectTypes.includes("add_chips")) {
    activeEffects.push("add_chips");
  }
  if (joker.multAddition > 0 && !effectTypes.includes("add_mult")) {
    activeEffects.push("add_mult");
  }
  if (joker.xMult > 1 && !effectTypes.includes("apply_x_mult")) {
    activeEffects.push("apply_x_mult");
  }

  // Add explicit effect types if not already included
  effectTypes.forEach((type) => {
    if (!activeEffects.includes(type)) {
      activeEffects.push(type);
    }
  });

  // If no effects found, return a simple activation message
  if (activeEffects.length === 0) {
    return {
      statement: '\n                message = "Activated!"',
      colour: "G.C.WHITE",
    };
  }

  // Build the return statement by chaining effects
  let returnStatement = "";
  let colour = "G.C.WHITE";

  // Process the first effect (goes directly in the return table)
  const firstEffect = activeEffects[0];

  if (firstEffect === "add_chips") {
    returnStatement = `
                chip_mod = card.ability.extra.chips,
                message = localize{type='variable',key='a_chips',vars={card.ability.extra.chips}}`;
    colour = "G.C.CHIPS";
  } else if (firstEffect === "add_mult") {
    returnStatement = `
                mult_mod = card.ability.extra.mult,
                message = localize{type='variable',key='a_mult',vars={card.ability.extra.mult}}`;
    colour = "G.C.MULT";
  } else if (firstEffect === "apply_x_mult") {
    returnStatement = `
                Xmult_mod = card.ability.extra.Xmult,
                message = localize{type='variable',key='a_xmult',vars={card.ability.extra.Xmult}}`;
    colour = "G.C.MONEY";
  } else if (firstEffect === "level_up_hand") {
    returnStatement = `
                level_up = card.ability.extra.level_up,
                message = "Level Up!"`;
    colour = "G.C.MULT";
  }

  // If there are more effects, chain them using 'extra'
  if (activeEffects.length > 1) {
    // Start building the extra object for the second effect
    let extraChain = "";

    // Process each additional effect (goes in nested 'extra' fields)
    for (let i = 1; i < activeEffects.length; i++) {
      const effect = activeEffects[i];
      let extraContent = "";
      let effectColour = "G.C.WHITE";

      if (effect === "add_chips") {
        extraContent = `chip_mod = card.ability.extra.chips,
                        message = localize{type='variable',key='a_chips',vars={card.ability.extra.chips}}`;
        effectColour = "G.C.CHIPS";
      } else if (effect === "add_mult") {
        extraContent = `mult_mod = card.ability.extra.mult,
                        message = localize{type='variable',key='a_mult',vars={card.ability.extra.mult}}`;
        effectColour = "G.C.MULT";
      } else if (effect === "apply_x_mult") {
        extraContent = `Xmult_mod = card.ability.extra.Xmult,
                        message = localize{type='variable',key='a_xmult',vars={card.ability.extra.Xmult}}`;
        effectColour = "G.C.MONEY";
      } else if (effect === "level_up_hand") {
        extraContent = `level_up = card.ability.extra.level_up,
                        message = "Level Up!"`;
        effectColour = "G.C.MULT";
      }

      // For the second effect, start the extra chain
      if (i === 1) {
        extraChain = `
                extra = {
                    ${extraContent},
                    colour = ${effectColour}`;
      } else {
        // For third+ effects, nest within the previous extra
        extraChain += `,
                    extra = {
                        ${extraContent},
                        colour = ${effectColour}`;
      }
    }

    // Close all the extra brackets
    for (let i = 1; i < activeEffects.length; i++) {
      extraChain += `
                    }`;
    }

    // Add the complete extra chain to the return statement
    returnStatement += `,${extraChain}`;
  }

  return { statement: returnStatement, colour };
}

/**
 * Generate a fallback calculate function if other methods fail
 */
export function generateFallbackCalculate(joker: JokerData): string {
  // Generate a list of effect types based on joker properties
  const effectTypes: string[] = [];
  if (joker.chipAddition > 0) effectTypes.push("add_chips");
  if (joker.multAddition > 0) effectTypes.push("add_mult");
  if (joker.xMult > 1) effectTypes.push("apply_x_mult");

  // Get the appropriate return statement with all effects
  const { statement, colour } = generateEffectReturnStatement(
    joker,
    effectTypes
  );

  return `calculate = function(self, card, context)
        if context.joker_main then
            return {${statement},
                colour = ${colour}
            }
        end
    end`;
}

/**
 * Check if a joker has an effect of the specified type
 */
export function hasEffectType(joker: JokerData, effectType: string): boolean {
  if (!joker.rules) return false;

  return joker.rules.some((rule) =>
    rule.effects.some((effect) => effect.type === effectType)
  );
}

/**
 * Get the first effect parameter value of a specific type from rules
 */
export function getEffectParamValue(
  joker: JokerData,
  effectType: string,
  paramName: string
): number | null {
  if (!joker.rules) return null;

  for (const rule of joker.rules) {
    for (const effect of rule.effects) {
      if (
        effect.type === effectType &&
        effect.params[paramName] !== undefined
      ) {
        return effect.params[paramName] as number;
      }
    }
  }

  return null;
}
