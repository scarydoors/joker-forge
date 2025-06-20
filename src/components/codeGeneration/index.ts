import { JokerData } from "../JokerCard";
import JSZip from "jszip";
import { addAtlasToZip } from "./ImageProcessor";
import {
  generateJokerBaseCode,
  generateBasicLocVarsFunction,
} from "./JokerBase";
import { generatePokerHandConditionCode } from "./conditions/PokerHandCondition";
import { generateCalculateFunction } from "./calculateUtils";
import { generateSuitCardConditionCode } from "./conditions/SuitCardCondition";
import { generateRankCardConditionCode } from "./conditions/RankCardCondition";
import { generateCountCardConditionCode } from "./conditions/CountHandCondition";
import { generatePlayerMoneyConditionCode } from "./conditions/PlayerMoneyCondition";
import { generateRemainingHandsConditionCode } from "./conditions/RemainingHandsCondition";
import { generateRemainingDiscardsConditionCode } from "./conditions/RemainingDiscardsCondition";
import { generateJokerCountConditionCode } from "./conditions/JokerCountCondition";
import { generateBlindTypeConditionCode } from "./conditions/BlindTypeCondition";
import { generateCardEnhancementConditionCode } from "./conditions/CardEnhancementCondition";
import { generateCardSealConditionCode } from "./conditions/CardSealCondition";
import { generateInternalVariableConditionCode } from "./conditions/InternalVariableCondition";
import { generateRandomChanceConditionCode } from "./conditions/RandomChanceCondition";
import { generateFirstPlayedHandConditionCode } from "./conditions/FirstHandPlayedCondition";
import { generateFirstDiscardedHandConditionCode } from "./conditions/FirstDiscardedHandCondition";
import { generateAnteLevelConditionCode } from "./conditions/AnteLevelCondition";

// Types
export interface ModMetadata {
  id: string;
  name: string;
  author: string[];
  description: string;
  prefix: string;
  main_file: string;
  version: string;
  priority: number;
  badge_colour: string;
  badge_text_colour: string;
  display_name: string;
  dependencies: string[];
  conflicts: string[];
  provides: string[];
  dump_loc?: boolean;
}

export const exportJokersAsMod = async (
  jokers: JokerData[],
  metadata: ModMetadata
): Promise<boolean> => {
  try {
    const zip = new JSZip();

    zip.file(metadata.main_file, generateMainLua(jokers, metadata));
    zip.file(`${metadata.id}.json`, generateModJson(metadata));
    zip.file("config.lua", "return {}");

    await addAtlasToZip(zip, jokers);

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${metadata.id}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Failed to generate mod:", error);
    return false;
  }
};

const generateMainLua = (
  jokers: JokerData[],
  metadata: ModMetadata
): string => {
  const jokerGenerationData: {
    joker: JokerData;
    index: number;
    conditionCodeByRule: { [ruleId: string]: string[] };
  }[] = [];

  // Collect condition codes
  jokers.forEach((joker, index) => {
    const conditionCodeByRule: { [ruleId: string]: string[] } = {};

    if (joker.rules && joker.rules.length > 0) {
      joker.rules.forEach((rule) => {
        const ruleConditionCodes: string[] = [];

        // Process each condition individually
        rule.conditionGroups.forEach((group) => {
          group.conditions.forEach((condition) => {
            // Create a single-condition rule for each condition
            const singleConditionRule = {
              ...rule,
              conditionGroups: [
                {
                  ...group,
                  conditions: [condition],
                },
              ],
            };

            let conditionCode = null;

            if (condition.type === "hand_type") {
              conditionCode = generatePokerHandConditionCode([
                singleConditionRule,
              ]);
            } else if (
              condition.type === "suit_count" ||
              condition.type === "card_suit"
            ) {
              conditionCode = generateSuitCardConditionCode([
                singleConditionRule,
              ]);
            } else if (
              condition.type === "rank_count" ||
              condition.type === "card_rank"
            ) {
              conditionCode = generateRankCardConditionCode([
                singleConditionRule,
              ]);
            } else if (condition.type === "card_count") {
              conditionCode = generateCountCardConditionCode([
                singleConditionRule,
              ]);
            } else if (condition.type === "card_enhancement") {
              conditionCode = generateCardEnhancementConditionCode([
                singleConditionRule,
              ]);
            } else if (condition.type === "card_seal") {
              conditionCode = generateCardSealConditionCode([
                singleConditionRule,
              ]);
            } else if (condition.type === "player_money") {
              conditionCode = generatePlayerMoneyConditionCode([
                singleConditionRule,
              ]);
            } else if (condition.type === "remaining_hands") {
              conditionCode = generateRemainingHandsConditionCode([
                singleConditionRule,
              ]);
            } else if (condition.type === "remaining_discards") {
              conditionCode = generateRemainingDiscardsConditionCode([
                singleConditionRule,
              ]);
            } else if (condition.type === "joker_count") {
              conditionCode = generateJokerCountConditionCode([
                singleConditionRule,
              ]);
            } else if (condition.type === "blind_type") {
              conditionCode = generateBlindTypeConditionCode([
                singleConditionRule,
              ]);
            } else if (condition.type === "internal_variable") {
              conditionCode = generateInternalVariableConditionCode([
                singleConditionRule,
              ]);
            } else if (condition.type === "random_chance") {
              conditionCode = generateRandomChanceConditionCode([
                singleConditionRule,
              ]);
            } else if (condition.type === "first_played_hand") {
              conditionCode = generateFirstPlayedHandConditionCode();
            } else if (condition.type === "first_discarded_hand") {
              conditionCode = generateFirstDiscardedHandConditionCode();
            } else if (condition.type === "ante_level") {
              conditionCode = generateAnteLevelConditionCode([
                singleConditionRule,
              ]);
            }

            if (conditionCode) {
              ruleConditionCodes.push(conditionCode);
            }
          });
        });

        conditionCodeByRule[rule.id] = ruleConditionCodes;
      });
    }

    jokerGenerationData.push({
      joker,
      index,
      conditionCodeByRule,
    });
  });

  // Build output
  let output = `-- FILE GENERATED BY JOKER FORGE
-- Mod: ${metadata.name}
-- Author(s): ${metadata.author.join(", ")}
-- Version: ${metadata.version}
-- Description: ${metadata.description}

local mod = SMODS.current_mod

mod.config = {}

-- Atlas
SMODS.Atlas({
    key = "CustomJokers", 
    path = "CustomJokers.png", 
    px = 71,
    py = 95, 
    atlas_table = "ASSET_ATLAS"
}):register()

`;

  jokerGenerationData.forEach(({ joker, index, conditionCodeByRule }) => {
    output +=
      generateJokerCode(joker, index, "CustomJokers", conditionCodeByRule) +
      "\n\n";
  });

  output += "return mod";
  return output;
};

const generateJokerCode = (
  joker: JokerData,
  index: number,
  atlasKey: string,
  conditionCodeByRule: { [ruleId: string]: string[] }
): string => {
  let jokerCode = generateJokerBaseCode(joker, index, atlasKey);
  const locVarsCode = generateBasicLocVarsFunction(joker);
  const calculateCode = generateCalculateFunction(
    joker.rules || [],
    conditionCodeByRule
  );

  jokerCode += `,

    ${locVarsCode},

    ${calculateCode}
}`;

  return jokerCode;
};

const generateModJson = (metadata: ModMetadata): string => {
  const modJson: Record<string, unknown> = {
    id: metadata.id,
    name: metadata.name,
    author: metadata.author,
    description: metadata.description,
    prefix: metadata.prefix,
    main_file: metadata.main_file,
    version: metadata.version,
    priority: metadata.priority,
    badge_colour: metadata.badge_colour,
    badge_text_colour: metadata.badge_text_colour,
  };

  if (metadata.display_name && metadata.display_name !== metadata.name) {
    modJson.display_name = metadata.display_name;
  }

  if (metadata.dependencies && metadata.dependencies.length > 0) {
    modJson.dependencies = metadata.dependencies;
  }

  if (metadata.conflicts && metadata.conflicts.length > 0) {
    modJson.conflicts = metadata.conflicts;
  }

  if (metadata.provides && metadata.provides.length > 0) {
    modJson.provides = metadata.provides;
  }

  if (metadata.dump_loc) {
    modJson.dump_loc = metadata.dump_loc;
  }

  return JSON.stringify(modJson, null, 2);
};
