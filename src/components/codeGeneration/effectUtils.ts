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
import { generateApplyXChipsReturn } from "./effects/ApplyXChipsEffect";
import { generateCreateTagReturn } from "./effects/CreateTagEffect";
import { generateApplyExpMultReturn } from "./effects/ApplyExpMultEffect";
import { generateApplyExpChipsReturn } from "./effects/ApplyExpChipsEffect";
import { generateShowMessageReturn } from "./effects/ShowMessageEffect";
import { generateSetDollarsReturn } from "./effects/SetDollarsEffect";
import {
  generateDisableBossBlindReturn,
  generatePassiveDisableBossBlind,
} from "./effects/DisableBossBlindEffect";
import { generateSavedReturn } from "./effects/SavedEffect";
import { generateAddSellValueReturn } from "./effects/AddSellValueEffect";
import { generateBalanceReturn } from "./effects/BalanceEffect";
import { generateChangeSuitVariableReturn } from "./effects/ChangeSuitVariableEffect";
import { generateChangeRankVariableReturn } from "./effects/ChangeRankVariableEffect";
import {
  generateFreeRerollsReturn,
  generateDiscountItemsReturn,
} from "./effects/DiscountItemsEffect";
import { generateChangePokerHandVariableReturn } from "./effects/ChangePokerHandVariableEffect";
import { generatePassiveCopyJokerAbility } from "./effects/CopyJokerAbilityEffect";
import { slugify } from "./index";
import { generatePermaBonusReturn } from "./effects/PermaBonusEffect";
import { generateSetAnteReturn } from "./effects/SetAnteEffect";

export interface RandomGroup {
  id: string;
  chance_numerator: number;
  chance_denominator: number;
  effects: Effect[];
}

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
  needsHook?: {
    hookType: string;
    jokerKey: string;
    effectParams: unknown;
  };
}

export function generateEffectReturnStatement(
  regularEffects: Effect[] = [],
  randomGroups: RandomGroup[] = [],
  triggerType: string = "hand_played",
  ruleId?: string
): ReturnStatementResult {
  if (regularEffects.length === 0 && randomGroups.length === 0) {
    return {
      statement: "",
      colour: "G.C.WHITE",
    };
  }

  let combinedPreReturnCode = "";
  let mainReturnStatement = "";
  let primaryColour = "G.C.WHITE";

  if (regularEffects.length > 0) {
    const { preReturnCode: regularPreCode, modifiedEffects } =
      coordinateVariableConflicts(regularEffects);

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

    if (regularPreCode) {
      combinedPreReturnCode += regularPreCode;
    }

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

    if (processedEffects.length > 0) {
      mainReturnStatement = buildReturnStatement(processedEffects);
      primaryColour = processedEffects[0]?.colour ?? "G.C.WHITE";
    }
  }

  if (randomGroups.length > 0) {
    const randomGroupStatements: string[] = [];

    // Create mapping of denominators to odds variable names
    const denominators = [
      ...new Set(randomGroups.map((group) => group.chance_denominator)),
    ];
    const denominatorToOddsVar: Record<number, string> = {};

    if (denominators.length === 1) {
      denominatorToOddsVar[denominators[0]] = "card.ability.extra.odds";
    } else {
      denominators.forEach((denom, index) => {
        if (index === 0) {
          denominatorToOddsVar[denom] = "card.ability.extra.odds";
        } else {
          denominatorToOddsVar[denom] = `card.ability.extra.odds${index + 1}`;
        }
      });
    }

    randomGroups.forEach((group, groupIndex) => {
      const { preReturnCode: groupPreCode, modifiedEffects } =
        coordinateVariableConflicts(group.effects);

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

      if (effectReturns.length === 0) return;

      let groupPreReturnCode = groupPreCode || "";
      const processedEffects: EffectReturn[] = [];

      effectReturns.forEach((effect) => {
        const { cleanedStatement, preReturnCode } = extractPreReturnCode(
          effect.statement
        );

        if (preReturnCode) {
          groupPreReturnCode +=
            (groupPreReturnCode ? "\n                        " : "") +
            preReturnCode;
        }

        processedEffects.push({
          ...effect,
          statement: cleanedStatement,
        });
      });

      // Use the mapped odds variable instead of hardcoded denominator
      const oddsVar = denominatorToOddsVar[group.chance_denominator];
      const probabilityCheck =
        group.chance_numerator === 1
          ? `G.GAME.probabilities.normal / ${oddsVar}`
          : `G.GAME.probabilities.normal * ${group.chance_numerator} / ${oddsVar}`;

      let groupContent = "";
      if (groupPreReturnCode && groupPreReturnCode.trim()) {
        groupContent += `${groupPreReturnCode}
                        `;
      }

      // Convert effects to SMODS.calculate_effect calls for random groups
      const effectCalls: string[] = [];
      processedEffects.forEach((effect) => {
        if (effect.statement && effect.statement.trim()) {
          const effectObj = `{${effect.statement}}`;
          effectCalls.push(`SMODS.calculate_effect(${effectObj}, card)`);
        }
        if (effect.message) {
          effectCalls.push(
            `card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${
              effect.message
            }, colour = ${effect.colour || "G.C.WHITE"}})`
          );
        }
      });

      groupContent += effectCalls.join("\n                        ");

      const groupStatement = `if pseudorandom('group_${groupIndex}_${group.id.substring(
        0,
        8
      )}') < ${probabilityCheck} then
                        ${groupContent}
                    end`;

      randomGroupStatements.push(groupStatement);
    });

    if (mainReturnStatement && randomGroupStatements.length > 0) {
      const randomGroupCode = randomGroupStatements.join(
        "\n                    "
      );
      const funcStatement = `func = function()
                        ${randomGroupCode}
                        return true
                    end`;

      if (
        mainReturnStatement.includes("return {") &&
        mainReturnStatement.includes("}")
      ) {
        const insertIndex = mainReturnStatement.lastIndexOf("}");
        mainReturnStatement =
          mainReturnStatement.slice(0, insertIndex) +
          `,
                    ${funcStatement}
                ${mainReturnStatement.slice(insertIndex)}`;
      }
    } else if (!mainReturnStatement && randomGroupStatements.length > 0) {
      mainReturnStatement = randomGroupStatements.join("\n                ");
      if (randomGroups.length > 0 && randomGroups[0].effects.length > 0) {
        const firstEffect = generateSingleEffect(
          randomGroups[0].effects[0],
          triggerType
        );
        primaryColour = firstEffect.colour || "G.C.WHITE";
      }
    }
  }

  return {
    statement: mainReturnStatement,
    colour: primaryColour,
    preReturnCode: combinedPreReturnCode || undefined,
    isRandomChance: randomGroups.length > 0,
  };
}

const generateSingleEffect = (
  effect: Effect,
  triggerType: string
): EffectReturn => {
  switch (effect.type) {
    case "add_chips":
      return generateAddChipsReturn(effect);
    case "add_mult":
      return generateAddMultReturn(effect);
    case "apply_x_mult":
      return generateApplyXMultReturn(effect);
    case "add_dollars":
      return generateAddDollarsReturn(effect);
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
    case "apply_x_chips":
      return generateApplyXChipsReturn(effect);
    case "create_tag":
      return generateCreateTagReturn(effect, triggerType);
    case "apply_exp_mult":
      return generateApplyExpMultReturn(effect);
    case "apply_exp_chips":
      return generateApplyExpChipsReturn(effect);
    case "show_message":
      return generateShowMessageReturn(effect);
    case "set_dollars":
      return generateSetDollarsReturn(effect);
    case "disable_boss_blind":
      return generateDisableBossBlindReturn(effect, triggerType);
    case "prevent_game_over":
      return generateSavedReturn(effect);
    case "add_sell_value":
      return generateAddSellValueReturn(effect, triggerType);
    case "balance":
      return generateBalanceReturn(effect);
    case "change_suit_variable":
      return generateChangeSuitVariableReturn(effect);
    case "change_rank_variable":
      return generateChangeRankVariableReturn(effect);
    case "change_pokerhand_variable":
      return generateChangePokerHandVariableReturn(effect);
    case "permanent_bonus":
      return generatePermaBonusReturn(effect);
    case "set_ante":
      return generateSetAnteReturn(effect, triggerType);

    default:
      return {
        statement: "",
        colour: "G.C.WHITE",
      };
  }
};

const buildReturnStatement = (effects: EffectReturn[]): string => {
  if (effects.length === 0) return "";

  let firstContentEffectIndex = -1;
  for (let i = 0; i < effects.length; i++) {
    const effect = effects[i];
    if (effect.statement.trim().length > 0 || effect.message) {
      firstContentEffectIndex = i;
      break;
    }
  }

  if (firstContentEffectIndex === -1) {
    return "";
  }

  const firstContentEffect = effects[firstContentEffectIndex];
  const hasFirstStatement = firstContentEffect.statement.trim().length > 0;

  let returnStatement = "";

  if (hasFirstStatement) {
    returnStatement = `return {
                    ${firstContentEffect.statement}`;

    if (firstContentEffect.message) {
      returnStatement += `,
                    message = ${firstContentEffect.message}`;
    }
  } else if (firstContentEffect.message) {
    returnStatement = `return {
                    message = ${firstContentEffect.message}`;
  }

  const remainingEffects = effects.slice(firstContentEffectIndex + 1);
  if (remainingEffects.length > 0) {
    let extraChain = "";
    let extraCount = 0;

    for (let i = 0; i < remainingEffects.length; i++) {
      const effect = remainingEffects[i];
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

      if (extraCount === 0) {
        extraChain = `,
                    extra = {
                        ${extraContent}`;

        if (effect.colour && effect.colour.trim()) {
          extraChain += `,
                        colour = ${effect.colour}`;
        }
      } else {
        extraChain += `,
                        extra = {
                            ${extraContent}`;

        if (effect.colour && effect.colour.trim()) {
          extraChain += `,
                            colour = ${effect.colour}`;
        }
      }
      extraCount++;
    }

    for (let i = 0; i < extraCount; i++) {
      extraChain += `
                        }`;
    }

    returnStatement += extraChain;
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

      const jokerKey = slugify(joker.name);

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
        case "disable_boss_blind": {
          passiveResult = generatePassiveDisableBossBlind(effect);
          break;
        }
        case "free_rerolls": {
          passiveResult = generateFreeRerollsReturn(effect);
          break;
        }
        case "discount_items": {
          passiveResult = generateDiscountItemsReturn(effect, jokerKey);
          break;
        }
        case "copy_joker_ability": {
          passiveResult = generatePassiveCopyJokerAbility(effect);
          break;
        }
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
