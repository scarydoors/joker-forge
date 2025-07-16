import type { Effect } from "../../ruleBuilder/types";
import type { ConsumableData } from "../../ConsumableCard";
import { generateAddDollarsReturn } from "./effects/AddDollarsEffect";
import { generateEnhanceCardsReturn } from "./effects/EnhanceCardsEffect";
import { generateChangeSuitReturn } from "./effects/ChangeSuitEffect";
import { generateChangeRankReturn } from "./effects/ChangeRankEffect";
import { generateAddSealReturn } from "./effects/AddSealEffect";
import { generateAddEditionReturn } from "./effects/AddEditionEffect";
import { generateLevelUpHandReturn } from "./effects/LevelUpHandEffect";

export interface PassiveEffectResult {
  addToDeck?: string;
  removeFromDeck?: string;
  configVariables?: string[];
  locVars?: string[];
  calculateFunction?: string;
}

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
    case "add_dollars":
      return generateAddDollarsReturn(effect);

    case "enhance_cards":
      return generateEnhanceCardsReturn(effect);

    case "change_suit":
      return generateChangeSuitReturn(effect);

    case "change_rank":
      return generateChangeRankReturn(effect);

    case "add_seal":
      return generateAddSealReturn(effect);

    case "add_edition":
      return generateAddEditionReturn(effect);

    case "level_up_hand":
      return generateLevelUpHandReturn(effect);

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

export const processPassiveEffects = (
  consumable: ConsumableData
): PassiveEffectResult[] => {
  const passiveEffects: PassiveEffectResult[] = [];

  if (!consumable.rules) return passiveEffects;

  consumable.rules
    .filter((rule) => rule.trigger === "passive")
    .forEach((rule) => {
      rule.effects?.forEach((effect) => {
        let passiveResult: PassiveEffectResult | null = null;

        switch (effect.type) {
          case "edit_hand_size":
            passiveResult = {
              configVariables: [`hand_size = ${effect.params?.value || 1}`],
              addToDeck: `G.hand:change_size(card.ability.extra.hand_size)`,
              removeFromDeck: `G.hand:change_size(-card.ability.extra.hand_size)`,
            };
            break;
        }

        if (passiveResult) {
          passiveEffects.push(passiveResult);
        }
      });
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
