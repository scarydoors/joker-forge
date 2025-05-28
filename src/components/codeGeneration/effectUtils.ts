import type { Effect } from "../ruleBuilder/types";
import {
  generateAddChipsReturn,
  type EffectReturn,
} from "./effects/AddChipsEffect";
import { generateAddMultReturn } from "./effects/AddMultEffect";
import { generateApplyXMultReturn } from "./effects/ApplyXMultEffect";
import { generateAddDollarsReturn } from "./effects/AddDollarsEffect";
import { generateRetriggerReturn } from "./effects/RetriggerEffect";
import { generateDestroySelfReturn } from "./effects/DestroySelfEffect";
import { generateEditHandReturn } from "./effects/EditHandEffect";
import { generateEditDiscardReturn } from "./effects/EditDiscardEffect";
import { generateLevelUpHandReturn } from "./effects/LevelUpHandEffect";
import { generateAddCardToDeckReturn } from "./effects/AddCardToDeckEffect";
import { generateCopyCardToDeckReturn } from "./effects/CopyCardToDeckEffect";
import { generateDeleteCardReturn } from "./effects/DeleteCardEffect";
import { generateEditCardReturn } from "./effects/EditCardEffect";
import { generateModifyInternalVariableReturn } from "./effects/ModifyInternalVariableEffect";

// TODO: this file is a bit of a mess, but it works for now which is what matters haha
export interface ReturnStatementResult {
  statement: string;
  colour: string;
  preReturnCode?: string;
}

/**
 * Extract pre-return code from an effect statement if it exists
 */
function extractPreReturnCode(statement: string): {
  cleanedStatement: string;
  preReturnCode?: string;
} {
  const preReturnStart = "__PRE_RETURN_CODE__";
  const preReturnEnd = "__PRE_RETURN_CODE_END__";

  if (statement.includes(preReturnStart) && statement.includes(preReturnEnd)) {
    const startIndex =
      statement.indexOf(preReturnStart) + preReturnStart.length;
    const endIndex = statement.indexOf(preReturnEnd);

    if (startIndex < endIndex) {
      const preReturnCode = statement.substring(startIndex, endIndex).trim();
      const cleanedStatement = statement
        .replace(
          new RegExp(`${preReturnStart}[\\s\\S]*?${preReturnEnd}`, "g"),
          ""
        )
        .trim();

      return { cleanedStatement, preReturnCode };
    }
  }

  return { cleanedStatement: statement };
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
          return generateAddChipsReturn(triggerType, effect);
        case "add_mult":
          return generateAddMultReturn(triggerType, effect);
        case "apply_x_mult":
          return generateApplyXMultReturn(triggerType, effect);
        case "add_dollars":
          return generateAddDollarsReturn(triggerType);
        case "retrigger_cards":
          return generateRetriggerReturn();
        case "destroy_self":
          return generateDestroySelfReturn();
        case "edit_hand":
          return generateEditHandReturn(effect);
        case "edit_discard":
          return generateEditDiscardReturn(effect);
        case "level_up_hand":
          return generateLevelUpHandReturn();
        case "add_card_to_deck":
          return generateAddCardToDeckReturn(effect, triggerType);
        case "copy_triggered_card":
          return generateCopyCardToDeckReturn(effect, triggerType);
        case "copy_played_card":
          return generateCopyCardToDeckReturn(effect, triggerType);
        case "delete_triggered_card":
          return generateDeleteCardReturn();
        case "edit_triggered_card":
          return generateEditCardReturn(effect, triggerType);
        case "modify_internal_variable":
          return generateModifyInternalVariableReturn(effect, triggerType);
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

  // Check for pre-return code in any of the effects
  let combinedPreReturnCode = "";
  const processedEffects: EffectReturn[] = [];

  effectReturns.forEach((effect) => {
    const { cleanedStatement, preReturnCode } = extractPreReturnCode(
      effect.statement
    );

    if (preReturnCode) {
      combinedPreReturnCode +=
        (combinedPreReturnCode ? "\n\n" : "") + preReturnCode;
    }

    processedEffects.push({
      ...effect,
      statement: cleanedStatement,
    });
  });

  // Build the return statement using processed effects
  let returnStatement = "";
  const firstEffect = processedEffects[0];

  // Check if the first effect has a non-empty statement after pre-return code extraction
  const hasFirstStatement = firstEffect.statement.trim().length > 0;

  // Add the first effect only if it has content
  if (hasFirstStatement) {
    returnStatement = `
                ${firstEffect.statement}`;

    if (firstEffect.message) {
      returnStatement += `,
                message = ${firstEffect.message}`;
    }
  } else {
    // If no statement, start with just the message
    if (firstEffect.message) {
      returnStatement = `
                message = ${firstEffect.message}`;
    } else {
      // If neither statement nor message, provide a fallback
      returnStatement = `
                message = "Activated!"`;
    }
  }

  // Handle multiple effects with 'extra' chaining
  if (processedEffects.length > 1) {
    let extraChain = "";

    for (let i = 1; i < processedEffects.length; i++) {
      const effect = processedEffects[i];

      // Check if this effect has a non-empty statement
      const hasStatement = effect.statement.trim().length > 0;

      let extraContent = "";
      if (hasStatement) {
        extraContent = effect.statement;
        if (effect.message) {
          extraContent += `,
                        message = ${effect.message}`;
        }
      } else {
        // If no statement, just add the message
        if (effect.message) {
          extraContent = `message = ${effect.message}`;
        } else {
          // If neither statement nor message, provide a fallback
          extraContent = `message = "Activated!"`;
        }
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
    for (let i = 1; i < processedEffects.length; i++) {
      extraChain += `
                    }`;
    }

    // Add comma before extra chain only if we have meaningful content in returnStatement
    const hasReturnContent = returnStatement.replace(/\s/g, "").length > 0;
    if (hasReturnContent) {
      returnStatement += `,${extraChain}`;
    } else {
      returnStatement = extraChain.trim();
    }
  }

  return {
    statement: returnStatement,
    colour: firstEffect.colour,
    preReturnCode: combinedPreReturnCode || undefined,
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
    const defaultValues: Record<string, Record<string, unknown>> = {
      add_chips: { value: 10 },
      add_mult: { value: 5 },
      apply_x_mult: { value: 1.5 },
      add_dollars: { value: 5 },
      retrigger_cards: { repetitions: 1 },
      destroy_self: {},
      edit_hand: { operation: "add", value: 1 },
      edit_discard: { operation: "add", value: 1 },
      level_up_hand: { levels: 1 },
    };

    return {
      id: crypto.randomUUID(),
      type,
      params: defaultValues[type] || {},
    };
  });

  return generateEffectReturnStatement(effects, triggerType);
}
