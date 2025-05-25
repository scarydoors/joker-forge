export interface ReturnStatementResult {
  statement: string;
  colour: string;
}

// List of triggers that use card_eval_status_text for money effects
const EVAL_STATUS_TEXT_TRIGGERS = [
  "blind_selected",
  "blind_skipped",
  "boss_defeated",
  "booster_opened",
  "booster_skipped",
  "consumable_used",
  "hand_drawn",
  "first_hand_drawn",
  "shop_entered",
  "shop_exited",
];

/**
 * Generate a return statement based on effect types and joker properties
 * Chains multiple effects with their own messages using the 'extra' field
 */
export function generateEffectReturnStatement(
  effectTypes: string[] = [],
  triggerType: string = "hand_played"
): ReturnStatementResult {
  // Keep track of active effects for chaining
  const activeEffects: string[] = [];

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

  // Check if this trigger uses eval_status_text for effects
  const usesEvalStatusText = EVAL_STATUS_TEXT_TRIGGERS.includes(triggerType);

  // Process the first effect (goes directly in the return table)
  const firstEffect = activeEffects[0];
  if (firstEffect === "add_chips") {
    if (triggerType === "card_scored") {
      // For card_scored, don't include message as SMODS adds it automatically
      returnStatement = `
                chips = card.ability.extra.chips`;
    } else {
      returnStatement = `
                chip_mod = card.ability.extra.chips,
                message = localize{type='variable',key='a_chips',vars={card.ability.extra.chips}}`;
    }
    colour = "G.C.CHIPS";
  } else if (firstEffect === "add_mult") {
    if (triggerType === "card_scored") {
      // For card_scored, don't include message as SMODS adds it automatically
      returnStatement = `
                mult = card.ability.extra.mult`;
    } else {
      returnStatement = `
                mult_mod = card.ability.extra.mult,
                message = localize{type='variable',key='a_mult',vars={card.ability.extra.mult}}`;
    }
    colour = "G.C.MULT";
  } else if (firstEffect === "apply_x_mult") {
    if (triggerType === "card_scored") {
      // For card_scored, don't include message as SMODS adds it automatically
      returnStatement = `
                Xmult = card.ability.extra.Xmult`;
    } else {
      returnStatement = `
                Xmult_mod = card.ability.extra.Xmult,
                message = localize{type='variable',key='a_xmult',vars={card.ability.extra.Xmult}}`;
    }
    colour = "G.C.XMULT";
  } else if (firstEffect === "add_dollars") {
    // For specific triggers, use card_eval_status_text pattern
    if (usesEvalStatusText) {
      returnStatement = `
                func = function()
                    card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = "$"..tostring(card.ability.extra.dollars), colour = G.C.MONEY})
                    ease_dollars(card.ability.extra.dollars)
                    return true
                end`;
    } else {
      returnStatement = `
                dollars = card.ability.extra.dollars,
                message = localize{type='variable',key='a_dollars',vars={card.ability.extra.dollars}}`;
    }
    colour = "G.C.MONEY";
  } else if (firstEffect === "retrigger_cards") {
    // Retrigger effect - just repetitions like in the examples
    returnStatement = `
                repetitions = card.ability.extra.repetitions`;
    colour = "G.C.ORANGE";
  }

  // If there are more effects, chain them using 'extra'
  if (activeEffects.length > 1) {
    // For triggers that use eval_status_text, we need to handle multiple effects differently
    if (usesEvalStatusText) {
      // Build a single function that handles all effects
      let functionContent = `
                func = function()`;

      for (let i = 0; i < activeEffects.length; i++) {
        const effect = activeEffects[i];

        if (effect === "add_dollars") {
          functionContent += `
                    card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = "$"..tostring(card.ability.extra.dollars), colour = G.C.MONEY})
                    ease_dollars(card.ability.extra.dollars)`;
        }
        // Add other effect types as needed
      }

      functionContent += `
                    return true
                end`;

      returnStatement = functionContent;
    } else {
      // Original chaining logic for other triggers
      let extraChain = "";

      // Process each additional effect (goes in nested 'extra' fields)
      for (let i = 1; i < activeEffects.length; i++) {
        const effect = activeEffects[i];
        let extraContent = "";
        let effectColour = "G.C.WHITE";

        if (effect === "add_chips") {
          if (triggerType === "card_scored") {
            extraContent = `chips = card.ability.extra.chips`;
          } else {
            extraContent = `chip_mod = card.ability.extra.chips,
                        message = localize{type='variable',key='a_chips',vars={card.ability.extra.chips}}`;
          }
          effectColour = "G.C.CHIPS";
        } else if (effect === "add_mult") {
          if (triggerType === "card_scored") {
            extraContent = `mult = card.ability.extra.mult`;
          } else {
            extraContent = `mult_mod = card.ability.extra.mult,
                        message = localize{type='variable',key='a_mult',vars={card.ability.extra.mult}}`;
          }
          effectColour = "G.C.MULT";
        } else if (effect === "apply_x_mult") {
          if (triggerType === "card_scored") {
            extraContent = `Xmult = card.ability.extra.Xmult`;
          } else {
            extraContent = `Xmult_mod = card.ability.extra.Xmult,
                        message = localize{type='variable',key='a_xmult',vars={card.ability.extra.Xmult}}`;
          }
          effectColour = "G.C.XMULT";
        } else if (effect === "add_dollars") {
          extraContent = `dollars = card.ability.extra.dollars,
                        message = localize{type='variable',key='a_dollars',vars={card.ability.extra.dollars}}`;
          effectColour = "G.C.MONEY";
        } else if (effect === "retrigger_cards") {
          extraContent = `repetitions = card.ability.extra.repetitions`;
          effectColour = "G.C.ORANGE";
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
  }

  return { statement: returnStatement, colour };
}
