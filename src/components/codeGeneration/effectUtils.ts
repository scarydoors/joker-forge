import type { Effect } from "../ruleBuilder/types";
import {
  generateAddChipsReturn,
  type EffectReturn,
} from "./effects/AddChipsEffect";
import { generateAddMultReturn } from "./effects/AddMultEffect";
import { generateApplyXMultReturn } from "./effects/ApplyXMultEffect";
import { generateAddDollarsReturn } from "./effects/AddDollarsEffect";
import { generateRetriggerReturn } from "./effects/RetriggerEffect";

export interface ReturnStatementResult {
  statement: string;
  colour: string;
}

/**
 * Generate a return statement based on effects and trigger type
 */
export function generateEffectReturnStatement(
  effects: Effect[] = [],
  triggerType: string = "hand_played"
): ReturnStatementResult {
  // If no effects, return a simple activation message
  if (effects.length === 0) {
    return {
      statement: '\n                message = "Activated!"',
      colour: "G.C.WHITE",
    };
  }

  // Get the return data for each effect
  const effectReturns: EffectReturn[] = effects
    .map((effect) => {
      switch (effect.type) {
        case "add_chips":
          return generateAddChipsReturn(triggerType);
        case "add_mult":
          return generateAddMultReturn(triggerType);
        case "apply_x_mult":
          return generateApplyXMultReturn(triggerType);
        case "add_dollars":
          return generateAddDollarsReturn(triggerType);
        case "retrigger_cards":
          return generateRetriggerReturn();
        default:
          // Default for unhandled effects
          return {
            statement: "",
            colour: "G.C.WHITE",
          };
      }
    })
    .filter((ret) => ret.statement); // Filter out empty statements

  if (effectReturns.length === 0) {
    return {
      statement: '\n                message = "Activated!"',
      colour: "G.C.WHITE",
    };
  }

  // Build the return statement
  let returnStatement = "";
  const firstEffect = effectReturns[0];

  // Add the first effect
  returnStatement = `
                ${firstEffect.statement}`;

  if (firstEffect.message) {
    returnStatement += `,
                message = ${firstEffect.message}`;
  }

  // Handle multiple effects with 'extra' chaining
  if (effectReturns.length > 1) {
    let extraChain = "";

    for (let i = 1; i < effectReturns.length; i++) {
      const effect = effectReturns[i];

      let extraContent = effect.statement;
      if (effect.message) {
        extraContent += `,
                        message = ${effect.message}`;
      }

      if (i === 1) {
        extraChain = `
                extra = {
                    ${extraContent},
                    colour = ${effect.colour}`;
      } else {
        extraChain += `,
                    extra = {
                        ${extraContent},
                        colour = ${effect.colour}`;
      }
    }

    // Close all the extra brackets
    for (let i = 1; i < effectReturns.length; i++) {
      extraChain += `
                    }`;
    }

    returnStatement += `,${extraChain}`;
  }

  return {
    statement: returnStatement,
    colour: firstEffect.colour,
  };
}

/**
 * Generate effect return statement from effect types (for backward compatibility)
 */
export function generateEffectReturnStatementFromTypes(
  effectTypes: string[] = [],
  triggerType: string = "hand_played"
): ReturnStatementResult {
  // Convert effect types to Effect objects with default values
  const effects: Effect[] = effectTypes.map((type) => {
    const defaultValues: Record<string, Record<string, number>> = {
      add_chips: { value: 10 },
      add_mult: { value: 5 },
      apply_x_mult: { value: 1.5 },
      add_dollars: { value: 5 },
      retrigger_cards: { repetitions: 1 },
    };

    return {
      id: crypto.randomUUID(),
      type,
      params: defaultValues[type] || {},
    };
  });

  return generateEffectReturnStatement(effects, triggerType);
}
