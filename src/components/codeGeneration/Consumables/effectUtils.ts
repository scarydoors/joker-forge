import type { Effect } from "../../ruleBuilder/types";
import { generateAddDollarsReturn } from "./effects/AddDollarsEffect";

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

export interface EffectReturn {
  statement: string;
  message?: string;
  colour: string;
  configVariables?: string[];
}

export interface ReturnStatementResult {
  statement: string;
  colour: string;
  preReturnCode?: string;
  isRandomChance?: boolean;
  configVariables?: string[];
}

export interface RandomGroup {
  id: string;
  chance_numerator: number;
  chance_denominator: number;
  effects: Effect[];
}

export function generateEffectReturnStatement(
  regularEffects: Effect[] = [],
  randomGroups: RandomGroup[] = []
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
  const allConfigVariables: string[] = [];

  if (regularEffects.length > 0) {
    const effectReturns: EffectReturn[] = regularEffects
      .map((effect) => generateSingleEffect(effect))
      .filter((ret) => ret.statement || ret.message);

    effectReturns.forEach((effectReturn) => {
      if (effectReturn.configVariables) {
        allConfigVariables.push(...effectReturn.configVariables);
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
        .map((effect) => generateSingleEffect(effect))
        .filter((ret) => ret.statement || ret.message);

      effectReturns.forEach((effectReturn) => {
        if (effectReturn.configVariables) {
          allConfigVariables.push(...effectReturn.configVariables);
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
  };
}

const generateSingleEffect = (effect: Effect): EffectReturn => {
  switch (effect.type) {
    case "edit_cards":
      return generateEditCardsReturn(effect);

    case "add_dollars":
      return generateAddDollarsReturn(effect);

    case "double_dollars":
      return generateDoubleDollarsReturn(effect);

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
