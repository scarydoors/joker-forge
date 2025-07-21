import type { Effect } from "../../ruleBuilder/types";
import { generateLevelUpHandReturn } from "./effects/LevelUpHandEffect";
import { generateDestroySelectedCardsReturn } from "./effects/DestroySelectedCardsEffect";
import { generateDestroyRandomCardsReturn } from "./effects/DestroyRandomCardsEffect";
import { generateDoubleDollarsReturn } from "./effects/DoubleDollarsEffect";
import { generateAddDollarsFromJokersReturn } from "./effects/AddDollarsFromJokersEffect";
import { generateCreateConsumableReturn } from "./effects/CreateConsumableEffect";
import { generateEditHandSizeReturn } from "./effects/EditHandSizeEffect";
import { generateEditHandsReturn } from "./effects/EditHandsEffect";
import { generateEditDiscardsReturn } from "./effects/EditDiscardsEffect";
import { generateConvertAllCardsToSuitReturn } from "./effects/ConvertAllCardsToSuitEffect";
import { generateConvertAllCardsToRankReturn } from "./effects/ConvertAllCardsToRankEffect";
import { generateEditCardsReturn } from "./effects/EditCardsEffect";
import { generateEditCardsInHandReturn } from "./effects/EditCardsInHandEffect";
import { generateCreateJokerReturn } from "./effects/CreateJokerEffect";
import { generateIncrementRankReturn } from "./effects/IncrementRankEffect";
import { generateAddCardsToHandReturn } from "./effects/AddCardsToHandEffect";
import { generateEditDollarsReturn } from "./effects/EditDollarsEffect";
import { generateCopyRandomJokerReturn } from "./effects/CopyRandomJokerEffect";
import { generateDestroyRandomJokerReturn } from "./effects/DestroyRandomJokerEffect";
import { generateEditionRandomJokerReturn } from "./effects/EditionRandomJokerEffect";
import { generateCopySelectedCardsReturn } from "./effects/CopySelectedCardsEffect";
import { generateConvertLeftToRightReturn } from "./effects/ConvertLeftToRightEffect";
import { generateFoolEffectReturn } from "./effects/FoolEffect";

export interface EffectReturn {
  statement: string;
  message?: string;
  colour: string;
  configVariables?: string[];
  customCanUse?: string;
}

export interface ReturnStatementResult {
  statement: string;
  colour: string;
  preReturnCode?: string;
  isRandomChance?: boolean;
  configVariables?: string[];
  customCanUse?: string;
}

export interface RandomGroup {
  id: string;
  chance_numerator: number;
  chance_denominator: number;
  effects: Effect[];
}

export function generateEffectReturnStatement(
  regularEffects: Effect[] = [],
  randomGroups: RandomGroup[] = [],
  modprefix: string
): ReturnStatementResult {
  if (regularEffects.length === 0 && randomGroups.length === 0) {
    return {
      statement: "",
      colour: "G.C.WHITE",
      configVariables: [],
    };
  }

  let combinedPreReturnCode = "";
  let mainReturnStatement = "";
  let primaryColour = "G.C.WHITE";
  const customCanUseConditions: string[] = [];
  const allConfigVariables: string[] = [];

  if (regularEffects.length > 0) {
    const effectReturns: EffectReturn[] = regularEffects
      .map((effect) => generateSingleEffect(effect, modprefix))
      .filter((ret) => ret.statement || ret.message);

    effectReturns.forEach((effectReturn) => {
      if (effectReturn.configVariables) {
        allConfigVariables.push(...effectReturn.configVariables);
      }
      if (effectReturn.customCanUse) {
        customCanUseConditions.push(effectReturn.customCanUse);
      }
    });

    const processedEffects: EffectReturn[] = [];
    effectReturns.forEach((effect) => {
      const { cleanedStatement, preReturnCode } = extractPreReturnCode(
        effect.statement
      );

      if (preReturnCode) {
        combinedPreReturnCode +=
          (combinedPreReturnCode ? "\n            " : "") + preReturnCode;
      }

      processedEffects.push({
        ...effect,
        statement: cleanedStatement,
      });
    });

    if (processedEffects.length > 0) {
      mainReturnStatement = buildConsumableEffectCode(processedEffects);
      primaryColour = processedEffects[0]?.colour ?? "G.C.WHITE";
    }
  }

  if (randomGroups.length > 0) {
    randomGroups.forEach((group) => {
      const effectReturns: EffectReturn[] = group.effects
        .map((effect) => generateSingleEffect(effect, modprefix))
        .filter((ret) => ret.statement || ret.message);

      effectReturns.forEach((effectReturn) => {
        if (effectReturn.configVariables) {
          allConfigVariables.push(...effectReturn.configVariables);
        }
        if (effectReturn.customCanUse) {
          customCanUseConditions.push(effectReturn.customCanUse);
        }
      });

      if (effectReturns.length === 0) return;

      const probabilityCheck = `pseudorandom('${group.id}') < G.GAME.probabilities.normal / ${group.chance_denominator}`;

      let groupContent = "";
      effectReturns.forEach((effect) => {
        if (effect.statement && effect.statement.trim()) {
          groupContent += `
                ${effect.statement}`;
        }
      });

      const groupStatement = `if ${probabilityCheck} then${groupContent}
            end`;

      combinedPreReturnCode +=
        (combinedPreReturnCode ? "\n            " : "") + groupStatement;
    });
  }

  return {
    statement: mainReturnStatement,
    colour: primaryColour,
    preReturnCode: combinedPreReturnCode || undefined,
    isRandomChance: randomGroups.length > 0,
    configVariables: allConfigVariables,
    customCanUse:
      customCanUseConditions.length > 0
        ? customCanUseConditions.join(" and ")
        : undefined,
  };
}

const generateSingleEffect = (
  effect: Effect,
  modprefix: string
): EffectReturn => {
  switch (effect.type) {
    case "edit_cards":
      return generateEditCardsReturn(effect);

    case "double_dollars":
      return generateDoubleDollarsReturn(effect);

    case "edit_dollars":
      return generateEditDollarsReturn(effect);

    case "add_dollars_from_jokers":
      return generateAddDollarsFromJokersReturn(effect);

    case "create_consumable":
      return generateCreateConsumableReturn(effect);

    case "level_up_hand":
      return generateLevelUpHandReturn(effect);

    case "destroy_selected_cards":
      return generateDestroySelectedCardsReturn(effect);

    case "destroy_random_cards":
      return generateDestroyRandomCardsReturn(effect);

    case "edit_hand_size":
      return generateEditHandSizeReturn(effect);

    case "edit_hands":
      return generateEditHandsReturn(effect);

    case "edit_discards":
      return generateEditDiscardsReturn(effect);

    case "convert_all_cards_to_suit":
      return generateConvertAllCardsToSuitReturn(effect);

    case "convert_all_cards_to_rank":
      return generateConvertAllCardsToRankReturn(effect);

    case "edit_cards_in_hand":
      return generateEditCardsInHandReturn(effect);

    case "create_joker":
      return generateCreateJokerReturn(effect, modprefix);

    case "increment_rank":
      return generateIncrementRankReturn(effect);

    case "add_cards_to_hand":
      return generateAddCardsToHandReturn(effect);

    case "copy_random_joker":
      return generateCopyRandomJokerReturn(effect);

    case "destroy_random_joker":
      return generateDestroyRandomJokerReturn(effect);

    case "edition_random_joker":
      return generateEditionRandomJokerReturn(effect);

    case "copy_selected_cards":
      return generateCopySelectedCardsReturn(effect);

    case "convert_left_to_right":
      return generateConvertLeftToRightReturn(effect);

    case "fool_effect":
      return generateFoolEffectReturn(effect);

    default:
      return {
        statement: "",
        colour: "G.C.WHITE",
      };
  }
};

const buildConsumableEffectCode = (effects: EffectReturn[]): string => {
  if (effects.length === 0) return "";

  let effectCode = "";
  effects.forEach((effect) => {
    if (effect.statement.trim()) {
      effectCode += `
            ${effect.statement}`;
    }
  });

  return effectCode.trim();
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
