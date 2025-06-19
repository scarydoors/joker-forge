import { JokerData } from "../JokerCard";
import JSZip from "jszip";
import { addAtlasToZip } from "./ImageProcessor";
import {
  generateJokerBaseCode,
  generateBasicLocVarsFunction,
} from "./JokerBase";
import { generatePokerHandCondition } from "./conditions/PokerHandCondition";
import { generateCalculateFunction } from "./calculateUtils";
import { generateSuitCardCondition } from "./conditions/SuitCardCondition";
import { generateRankCardCondition } from "./conditions/RankCardCondition";
import { generateCountCardCondition } from "./conditions/CountHandCondition";
import { generatePlayerMoneyCondition } from "./conditions/PlayerMoneyCondition";
import { generateRemainingHandsCondition } from "./conditions/RemainingHandsCondition";
import { generateRemainingDiscardsCondition } from "./conditions/RemainingDiscardsCondition";
import { generateJokerCountCondition } from "./conditions/JokerCountCondition";
import { generateBlindTypeCondition } from "./conditions/BlindTypeCondition";
import { generateCardEnhancementCondition } from "./conditions/CardEnhancementCondition";
import { generateCardSealCondition } from "./conditions/CardSealCondition";
import { generateInternalVariableCondition } from "./conditions/InternalVariableCondition";
import { generateRandomChanceCondition } from "./conditions/RandomChanceCondition";

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
  const helperFunctions: string[] = [];
  const jokerGenerationData: {
    joker: JokerData;
    index: number;
    conditionFunctionsByRule: { [ruleId: string]: string[] };
  }[] = [];

  // Collect helper functions
  jokers.forEach((joker, index) => {
    const conditionFunctionsByRule: { [ruleId: string]: string[] } = {};

    if (joker.rules && joker.rules.length > 0) {
      joker.rules.forEach((rule) => {
        const ruleFunctionNames: string[] = [];

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

            let conditionFunction = null;

            if (condition.type === "hand_type") {
              conditionFunction = generatePokerHandCondition([
                singleConditionRule,
              ]);
            } else if (
              condition.type === "suit_count" ||
              condition.type === "card_suit"
            ) {
              conditionFunction = generateSuitCardCondition([
                singleConditionRule,
              ]);
            } else if (
              condition.type === "rank_count" ||
              condition.type === "card_rank"
            ) {
              conditionFunction = generateRankCardCondition([
                singleConditionRule,
              ]);
            } else if (condition.type === "card_count") {
              conditionFunction = generateCountCardCondition([
                singleConditionRule,
              ]);
            } else if (condition.type === "card_enhancement") {
              conditionFunction = generateCardEnhancementCondition([
                singleConditionRule,
              ]);
            } else if (condition.type === "card_seal") {
              conditionFunction = generateCardSealCondition([
                singleConditionRule,
              ]);
            } else if (condition.type === "player_money") {
              conditionFunction = generatePlayerMoneyCondition([
                singleConditionRule,
              ]);
            } else if (condition.type === "remaining_hands") {
              conditionFunction = generateRemainingHandsCondition([
                singleConditionRule,
              ]);
            } else if (condition.type === "remaining_discards") {
              conditionFunction = generateRemainingDiscardsCondition([
                singleConditionRule,
              ]);
            } else if (condition.type === "joker_count") {
              conditionFunction = generateJokerCountCondition([
                singleConditionRule,
              ]);
            } else if (condition.type === "blind_type") {
              conditionFunction = generateBlindTypeCondition([
                singleConditionRule,
              ]);
            } else if (condition.type === "internal_variable") {
              conditionFunction = generateInternalVariableCondition([
                singleConditionRule,
              ]);
            } else if (condition.type === "random_chance") {
              conditionFunction = generateRandomChanceCondition([
                singleConditionRule,
              ]);
            }

            if (conditionFunction) {
              helperFunctions.push(conditionFunction.functionCode);
              ruleFunctionNames.push(conditionFunction.functionName);
            }
          });
        });

        conditionFunctionsByRule[rule.id] = ruleFunctionNames;
      });
    }

    jokerGenerationData.push({
      joker,
      index,
      conditionFunctionsByRule,
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

  // Helper functions
  if (helperFunctions.length > 0) {
    output += "-- Helper functions\n";
    output += helperFunctions.join("\n\n");
    output += "\n\n";
  }

  // Joker definitions
  jokerGenerationData.forEach(({ joker, index, conditionFunctionsByRule }) => {
    output +=
      generateJokerCode(
        joker,
        index,
        "CustomJokers",
        conditionFunctionsByRule
      ) + "\n\n";
  });

  output += "return mod";
  return output;
};

const generateJokerCode = (
  joker: JokerData,
  index: number,
  atlasKey: string,
  conditionFunctionsByRule: { [ruleId: string]: string[] }
): string => {
  let jokerCode = generateJokerBaseCode(joker, index, atlasKey);
  const locVarsCode = generateBasicLocVarsFunction(joker);
  const calculateCode = generateCalculateFunction(
    joker.rules || [],
    conditionFunctionsByRule
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
