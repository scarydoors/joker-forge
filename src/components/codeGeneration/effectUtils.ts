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
import { generateEditHandSizeReturn } from "./effects/EditHandSizeEffect";
import { generateLevelUpHandReturn } from "./effects/LevelUpHandEffect";
import { generateAddCardToDeckReturn } from "./effects/AddCardToDeckEffect";
import { generateCopyCardToDeckReturn } from "./effects/CopyCardToDeckEffect";
import { generateDeleteCardReturn } from "./effects/DeleteCardEffect";
import { generateEditCardReturn } from "./effects/EditCardEffect";
import { generateModifyInternalVariableReturn } from "./effects/ModifyInternalVariableEffect";
import { generateAddTarotCardReturn } from "./effects/AddTarotCardEffect";
import { generateAddPlanetCardReturn } from "./effects/AddPlanetCardEffect";
import { generateAddSpectralCardReturn } from "./effects/AddSpectralCardEffect";

export interface ReturnStatementResult {
  statement: string;
  colour: string;
  preReturnCode?: string;
}

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

export function generateEffectReturnStatement(
  effects: Effect[] = [],
  triggerType: string = "hand_played"
): ReturnStatementResult {
  if (effects.length === 0) {
    return {
      statement: '\n                message = "Activated!"',
      colour: "G.C.WHITE",
    };
  }

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
        case "edit_hand_size":
          return generateEditHandSizeReturn(effect);
        case "level_up_hand":
          return generateLevelUpHandReturn(triggerType);
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
        case "create_tarot_card":
          return generateAddTarotCardReturn(effect, triggerType);
        case "create_planet_card":
          return generateAddPlanetCardReturn(effect, triggerType);
        case "create_spectral_card":
          return generateAddSpectralCardReturn(effect, triggerType);
        default:
          return {
            statement: "",
            colour: "G.C.WHITE",
          };
      }
    })
    .filter((ret) => ret.statement);

  if (effectReturns.length === 0) {
    return {
      statement: '\n                message = "Activated!"',
      colour: "G.C.WHITE",
    };
  }

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

  let returnStatement = "";
  const firstEffect = processedEffects[0];

  const hasFirstStatement = firstEffect.statement.trim().length > 0;

  if (hasFirstStatement) {
    returnStatement = `
                ${firstEffect.statement}`;

    if (firstEffect.message) {
      returnStatement += `,
                message = ${firstEffect.message}`;
    }
  } else {
    if (firstEffect.message) {
      returnStatement = `
                message = ${firstEffect.message}`;
    } else {
      returnStatement = `
                message = "Activated!"`;
    }
  }

  if (processedEffects.length > 1) {
    let extraChain = "";

    for (let i = 1; i < processedEffects.length; i++) {
      const effect = processedEffects[i];

      const hasStatement = effect.statement.trim().length > 0;

      let extraContent = "";
      if (hasStatement) {
        extraContent = effect.statement;
        if (effect.message) {
          extraContent += `,
                        message = ${effect.message}`;
        }
      } else {
        if (effect.message) {
          extraContent = `message = ${effect.message}`;
        } else {
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

    for (let i = 1; i < processedEffects.length; i++) {
      extraChain += `
                    }`;
    }

    const hasReturnContent = returnStatement.replace(/\s/g, "").length > 0;
    if (hasReturnContent) {
      returnStatement += `,${extraChain}`;
    } else {
      returnStatement = extraChain.trim();
    }
  }

  return {
    statement: returnStatement,
    colour: firstEffect.colour ?? "G.C.WHITE",
    preReturnCode: combinedPreReturnCode || undefined,
  };
}

export function generateEffectReturnStatementFromTypes(
  effectTypes: string[] = [],
  triggerType: string = "hand_played"
): ReturnStatementResult {
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
      edit_hand_size: { operation: "add", value: 1 },
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
