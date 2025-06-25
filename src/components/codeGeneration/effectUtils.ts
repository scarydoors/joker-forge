import type { Effect } from "../ruleBuilder/types";
import type { JokerData } from "../JokerCard";
import { coordinateVariableConflicts } from "./variableUtils";
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
import { generateDestroyConsumableReturn } from "./effects/DestroyConsumableEffect";
import { generateCopyConsumableReturn } from "./effects/CopyConsumableEffect";
import { generateCreateJokerReturn } from "./effects/CreateJokerEffect";
import { generateCopyJokerReturn } from "./effects/CopyJokerEffect";
import { generateDestroyJokerReturn } from "./effects/DestroyJokerEffect";
import { generatePassiveHandSize } from "./effects/EditHandSizeEffect";
import { generatePassiveHand } from "./effects/EditHandEffect";
import { generatePassiveDiscard } from "./effects/EditDiscardEffect";
import { generatePassiveCombineRanks } from "./effects/CombineRanksEffect";
import {
  generatePassiveConsideredAs,
  type ConsideredAsResult,
} from "./effects/ConsideredAsEffect";

export interface ReturnStatementResult {
  statement: string;
  colour: string;
  preReturnCode?: string;
  isRandomChance?: boolean;
}

export interface PassiveEffectResult {
  addToDeck?: string;
  removeFromDeck?: string;
  configVariables?: string[];
  locVars?: string[];
  calculateFunction?: string;
}

export function generateEffectReturnStatement(
  effects: Effect[] = [],
  triggerType: string = "hand_played",
  ruleId?: string
): ReturnStatementResult {
  if (effects.length === 0) {
    return {
      statement: "",
      colour: "G.C.WHITE",
    };
  }

  const { preReturnCode: variablePreCode, modifiedEffects } =
    coordinateVariableConflicts(effects);

  const hasRandomChance = effects.some(
    (effect) => effect.params.has_random_chance === "true"
  );

  const effectReturns: EffectReturn[] = modifiedEffects
    .map((effect, index) => {
      const effectWithContext = {
        ...effect,
        _ruleContext: ruleId,
        _effectIndex: index,
      };

      return generateSingleEffect(effectWithContext, triggerType);
    })
    .filter((ret) => ret.statement || ret.message);

  if (effectReturns.length === 0) {
    return {
      statement: "",
      colour: "G.C.WHITE",
    };
  }

  if (hasRandomChance) {
    const processedEffects: EffectReturn[] = [];
    let randomChancePreReturnCode = variablePreCode || "";

    effectReturns.forEach((effect) => {
      const { cleanedStatement, preReturnCode } = extractPreReturnCode(
        effect.statement
      );

      if (preReturnCode) {
        randomChancePreReturnCode +=
          (randomChancePreReturnCode ? "\n                " : "") +
          preReturnCode;
      }

      processedEffects.push({
        ...effect,
        statement: cleanedStatement,
      });
    });

    const randomChanceResults = processRandomChanceEffects(
      processedEffects,
      effects,
      randomChancePreReturnCode
    );
    return {
      statement: randomChanceResults,
      colour: processedEffects[0]?.colour ?? "G.C.WHITE",
      isRandomChance: true,
    };
  }

  let combinedPreReturnCode = variablePreCode || "";
  const processedEffects: EffectReturn[] = [];

  effectReturns.forEach((effect) => {
    const { cleanedStatement, preReturnCode } = extractPreReturnCode(
      effect.statement
    );

    if (preReturnCode) {
      combinedPreReturnCode +=
        (combinedPreReturnCode ? "\n                " : "") + preReturnCode;
    }

    processedEffects.push({
      ...effect,
      statement: cleanedStatement,
    });
  });

  const returnStatement = buildReturnStatement(processedEffects);

  return {
    statement: returnStatement,
    colour: processedEffects[0]?.colour ?? "G.C.WHITE",
    preReturnCode: combinedPreReturnCode || undefined,
  };
}

const generateSingleEffect = (
  effect: Effect,
  triggerType: string
): EffectReturn => {
  switch (effect.type) {
    case "add_chips":
      return generateAddChipsReturn(triggerType, effect);
    case "add_mult":
      return generateAddMultReturn(triggerType, effect);
    case "apply_x_mult":
      return generateApplyXMultReturn(triggerType, effect);
    case "add_dollars":
      return generateAddDollarsReturn(triggerType, effect);
    case "retrigger_cards":
      return generateRetriggerReturn(effect);
    case "destroy_self":
      return generateDestroySelfReturn(effect);
    case "edit_hand":
      return generateEditHandReturn(effect);
    case "edit_discard":
      return generateEditDiscardReturn(effect);
    case "edit_hand_size":
      return generateEditHandSizeReturn(effect);
    case "level_up_hand":
      return generateLevelUpHandReturn(triggerType, effect);
    case "add_card_to_deck":
      return generateAddCardToDeckReturn(effect, triggerType);
    case "copy_triggered_card":
      return generateCopyCardToDeckReturn(effect, triggerType);
    case "copy_played_card":
      return generateCopyCardToDeckReturn(effect, triggerType);
    case "delete_triggered_card":
      return generateDeleteCardReturn(effect);
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
    case "destroy_consumable":
      return generateDestroyConsumableReturn(effect, triggerType);
    case "copy_consumable":
      return generateCopyConsumableReturn(effect, triggerType);
    case "create_joker":
      return generateCreateJokerReturn(effect, triggerType);
    case "copy_joker":
      return generateCopyJokerReturn(effect, triggerType);
    case "destroy_joker":
      return generateDestroyJokerReturn(effect, triggerType);
    default:
      return {
        statement: "",
        colour: "G.C.WHITE",
      };
  }
};

const processRandomChanceEffects = (
  processedEffects: EffectReturn[],
  originalEffects: Effect[],
  preReturnCode?: string
): string => {
  const effect = processedEffects[0];
  const originalEffect = originalEffects[0];

  const numerator = originalEffect.params.chance_numerator || 1;
  const effectKey = `effect_0_${originalEffect.type}`;

  // Use the Balatro standard probability formula
  const probabilityCheck =
    numerator === 1
      ? `G.GAME.probabilities.normal / card.ability.extra.odds`
      : `G.GAME.probabilities.normal * ${numerator} / card.ability.extra.odds`;

  let content = "";

  // Add pre-return code first
  if (preReturnCode && preReturnCode.trim()) {
    content += `${preReturnCode}
                `;
  }

  // Add return statement with message
  if (effect.message) {
    content += `return {
                    message = ${effect.message}
                }`;
  }

  return `if pseudorandom('${effectKey}') < ${probabilityCheck} then
                ${content}
            end`;
};

const buildReturnStatement = (effects: EffectReturn[]): string => {
  if (effects.length === 0) return "";

  const functionalEffects = effects.filter((effect) =>
    effect.statement.includes("func = function()")
  );

  if (functionalEffects.length > 0) {
    const effect = functionalEffects[0];
    return `return {
                    ${effect.statement}${
      effect.message
        ? `,
                    message = ${effect.message}`
        : ""
    }
                }`;
  }

  const firstEffect = effects[0];
  const hasFirstStatement = firstEffect.statement.trim().length > 0;

  let returnStatement = "";

  if (hasFirstStatement) {
    returnStatement = `return {
                    ${firstEffect.statement}`;

    if (firstEffect.message) {
      returnStatement += `,
                    message = ${firstEffect.message}`;
    }
  } else if (firstEffect.message) {
    returnStatement = `return {
                    message = ${firstEffect.message}`;
  }

  if (effects.length > 1) {
    let extraChain = "";

    for (let i = 1; i < effects.length; i++) {
      const effect = effects[i];
      const hasStatement = effect.statement.trim().length > 0;

      let extraContent = "";
      if (hasStatement) {
        extraContent = effect.statement;
        if (effect.message) {
          extraContent += `,
                            message = ${effect.message}`;
        }
      } else if (effect.message) {
        extraContent = `message = ${effect.message}`;
      }

      if (!extraContent) continue;

      if (i === 1) {
        extraChain = `,
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

    const extraCount = effects
      .slice(1)
      .filter((e) => e.statement.trim().length > 0 || e.message).length;

    for (let i = 0; i < extraCount; i++) {
      extraChain += `
                        }`;
    }

    returnStatement += extraChain;
  }

  if (returnStatement.trim().length === 0) {
    returnStatement = `return {
                    colour = ${firstEffect.colour}`;
  }

  returnStatement += `
                }`;

  return returnStatement;
};

export const processPassiveEffects = (
  joker: JokerData
): PassiveEffectResult[] => {
  const passiveEffects: PassiveEffectResult[] = [];

  if (!joker.rules) return passiveEffects;

  joker.rules
    .filter((rule) => rule.trigger === "passive" && rule.effects?.length === 1)
    .forEach((rule) => {
      const effect = rule.effects[0];
      let passiveResult: PassiveEffectResult | null = null;

      switch (effect.type) {
        case "edit_hand_size":
          passiveResult = generatePassiveHandSize(effect);
          break;
        case "edit_hand":
          passiveResult = generatePassiveHand(effect);
          break;
        case "edit_discard":
          passiveResult = generatePassiveDiscard(effect);
          break;
        case "combine_ranks":
          passiveResult = generatePassiveCombineRanks(effect);
          break;
        case "considered_as": {
          const consideredAsResult: ConsideredAsResult =
            generatePassiveConsideredAs(effect);

          const sourceType =
            (effect.params?.source_type as string) || "enhancement";
          const targetType =
            (effect.params?.target_type as string) || "enhancement";

          let sourceValue = "";
          let targetValue = "";

          switch (sourceType) {
            case "rank":
              sourceValue = (effect.params?.source_rank as string) || "A";
              break;
            case "suit":
              sourceValue = (effect.params?.source_suit as string) || "Spades";
              break;
            case "enhancement":
              sourceValue =
                (effect.params?.source_enhancement as string) || "m_gold";
              break;
            case "seal":
              sourceValue = (effect.params?.source_seal as string) || "Gold";
              break;
            case "edition":
              sourceValue =
                (effect.params?.source_edition as string) || "e_foil";
              break;
          }

          switch (targetType) {
            case "enhancement":
              targetValue =
                (effect.params?.target_enhancement as string) || "m_steel";
              break;
            case "seal":
              targetValue = (effect.params?.target_seal as string) || "Gold";
              break;
            case "edition":
              targetValue =
                (effect.params?.target_edition as string) || "e_foil";
              break;
          }

          const updatedConfigVariables = [
            `source_type = "${sourceType}"`,
            `source_value = "${sourceValue}"`,
            `target_type = "${targetType}"`,
            `target_value = "${targetValue}"`,
          ];

          passiveResult = {
            calculateFunction: consideredAsResult.calculateFunction,
            configVariables: updatedConfigVariables,
            locVars: consideredAsResult.locVars,
          };
          break;
        }
      }

      if (passiveResult) {
        passiveEffects.push(passiveResult);
      }
    });

  return passiveEffects;
};

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
