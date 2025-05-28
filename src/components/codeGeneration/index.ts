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

export const exportJokersAsMod = async (
  jokers: JokerData[],
  modName: string,
  authorName: string
): Promise<boolean> => {
  try {
    const zip = new JSZip();
    const modId = modName.toLowerCase().replace(/\s+/g, "");

    zip.file("main.lua", generateMainLua(jokers));
    zip.file(`${modId}.json`, generateModJson(modName, modId, authorName));
    zip.file("config.lua", "return {}");

    await addAtlasToZip(zip, jokers);

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${modId}.zip`;
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

const generateMainLua = (jokers: JokerData[]): string => {
  // Track all helper functions
  const helperFunctions: string[] = [];
  // Track joker-specific data for final generation
  const jokerGenerationData: {
    joker: JokerData;
    index: number;
    conditionFunctionsByRule: { [ruleId: string]: string[] };
  }[] = [];

  // First pass: collect all helper functions
  jokers.forEach((joker, index) => {
    const conditionFunctionsByRule: { [ruleId: string]: string[] } = {};

    console.log("Joker rules:", joker.rules);

    if (joker.rules && joker.rules.length > 0) {
      // Process each rule individually
      joker.rules.forEach((rule) => {
        const ruleFunctionNames: string[] = [];

        // Check for poker hand rules in this specific rule
        if (
          rule.conditionGroups.some((group) =>
            group.conditions.some((condition) => condition.type === "hand_type")
          )
        ) {
          const pokerHandCondition = generatePokerHandCondition([rule]);
          if (pokerHandCondition) {
            helperFunctions.push(pokerHandCondition.functionCode);
            ruleFunctionNames.push(pokerHandCondition.functionName);
          }
        }

        // Check for suit rules in this specific rule
        if (
          rule.conditionGroups.some((group) =>
            group.conditions.some(
              (condition) =>
                condition.type === "suit_count" ||
                condition.type === "card_suit"
            )
          )
        ) {
          const suitCondition = generateSuitCardCondition([rule]);
          if (suitCondition) {
            helperFunctions.push(suitCondition.functionCode);
            ruleFunctionNames.push(suitCondition.functionName);
          }
        }

        // Check for rank rules in this specific rule
        if (
          rule.conditionGroups.some((group) =>
            group.conditions.some(
              (condition) =>
                condition.type === "rank_count" ||
                condition.type === "card_rank"
            )
          )
        ) {
          const rankCondition = generateRankCardCondition([rule]);
          if (rankCondition) {
            helperFunctions.push(rankCondition.functionCode);
            ruleFunctionNames.push(rankCondition.functionName);
          }
        }

        // Check for card count rules in this specific rule
        if (
          rule.conditionGroups.some((group) =>
            group.conditions.some(
              (condition) => condition.type === "card_count"
            )
          )
        ) {
          const countCondition = generateCountCardCondition([rule]);
          if (countCondition) {
            helperFunctions.push(countCondition.functionCode);
            ruleFunctionNames.push(countCondition.functionName);
          }
        }

        // Check for card enhancement rules in this specific rule
        if (
          rule.conditionGroups.some((group) =>
            group.conditions.some(
              (condition) => condition.type === "card_enhancement"
            )
          )
        ) {
          const enhancementCondition = generateCardEnhancementCondition([rule]);
          if (enhancementCondition) {
            helperFunctions.push(enhancementCondition.functionCode);
            ruleFunctionNames.push(enhancementCondition.functionName);
          }
        }

        // Check for card seal rules in this specific rule
        if (
          rule.conditionGroups.some((group) =>
            group.conditions.some((condition) => condition.type === "card_seal")
          )
        ) {
          const sealCondition = generateCardSealCondition([rule]);
          if (sealCondition) {
            helperFunctions.push(sealCondition.functionCode);
            ruleFunctionNames.push(sealCondition.functionName);
          }
        }

        // Check for player money rules in this specific rule
        if (
          rule.conditionGroups.some((group) =>
            group.conditions.some(
              (condition) => condition.type === "player_money"
            )
          )
        ) {
          const moneyCondition = generatePlayerMoneyCondition([rule]);
          if (moneyCondition) {
            helperFunctions.push(moneyCondition.functionCode);
            ruleFunctionNames.push(moneyCondition.functionName);
          }
        }

        // Check for remaining hands rules in this specific rule
        if (
          rule.conditionGroups.some((group) =>
            group.conditions.some(
              (condition) => condition.type === "remaining_hands"
            )
          )
        ) {
          const handsCondition = generateRemainingHandsCondition([rule]);
          if (handsCondition) {
            helperFunctions.push(handsCondition.functionCode);
            ruleFunctionNames.push(handsCondition.functionName);
          }
        }

        // Check for remaining discards rules in this specific rule
        if (
          rule.conditionGroups.some((group) =>
            group.conditions.some(
              (condition) => condition.type === "remaining_discards"
            )
          )
        ) {
          const discardCondition = generateRemainingDiscardsCondition([rule]);
          if (discardCondition) {
            helperFunctions.push(discardCondition.functionCode);
            ruleFunctionNames.push(discardCondition.functionName);
          }
        }

        // Check for joker count rules in this specific rule
        if (
          rule.conditionGroups.some((group) =>
            group.conditions.some(
              (condition) => condition.type === "joker_count"
            )
          )
        ) {
          const jokerCountCondition = generateJokerCountCondition([rule]);
          if (jokerCountCondition) {
            helperFunctions.push(jokerCountCondition.functionCode);
            ruleFunctionNames.push(jokerCountCondition.functionName);
          }
        }

        // Check for blind type rules in this specific rule
        if (
          rule.conditionGroups.some((group) =>
            group.conditions.some(
              (condition) => condition.type === "blind_type"
            )
          )
        ) {
          const blindTypeCondition = generateBlindTypeCondition([rule]);
          if (blindTypeCondition) {
            helperFunctions.push(blindTypeCondition.functionCode);
            ruleFunctionNames.push(blindTypeCondition.functionName);
          }
        }

        // Check for internal variable rules in this specific rule
        if (
          rule.conditionGroups.some((group) =>
            group.conditions.some(
              (condition) => condition.type === "internal_variable"
            )
          )
        ) {
          const internalVariableCondition = generateInternalVariableCondition([
            rule,
          ]);
          if (internalVariableCondition) {
            helperFunctions.push(internalVariableCondition.functionCode);
            ruleFunctionNames.push(internalVariableCondition.functionName);
          }
        }

        // Store the function names for this rule
        conditionFunctionsByRule[rule.id] = ruleFunctionNames;
      });
    }

    jokerGenerationData.push({
      joker,
      index,
      conditionFunctionsByRule,
    });
  });

  // Start building the output
  let output = `-- FILE GENERATED BY JOKER FORGE

local mod = SMODS.current_mod

mod.config = {}

-- Create custom joker atlas
SMODS.Atlas({
    key = "CustomJokers", 
    path = "CustomJokers.png", 
    px = 71,
    py = 95, 
    atlas_table = "ASSET_ATLAS"
}):register()

`;

  // Add all helper functions first
  if (helperFunctions.length > 0) {
    output += "-- Helper functions for joker conditions\n";
    output += helperFunctions.join("\n\n");
    output += "\n\n";
  }

  // Now add all joker definitions
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
  console.log(`Generating code for joker: ${joker.name}`);

  // Start with the base joker code
  let jokerCode = generateJokerBaseCode(joker, index, atlasKey);

  // Generate loc_vars function
  const locVarsCode = generateBasicLocVarsFunction(joker);

  // Generate the calculate function that combines all rules
  const calculateCode = generateCalculateFunction(
    joker.rules || [],
    conditionFunctionsByRule
  );

  // Add the generated code to the joker
  jokerCode += `,

    ${locVarsCode},

    ${calculateCode}
}`;

  return jokerCode;
};

const generateModJson = (
  modName: string,
  modId: string,
  authorName: string
): string => {
  const metadata = {
    id: modId,
    name: modName,
    display_name: modName,
    author: [authorName],
    description: "Custom jokers created with Joker Forge",
    prefix: modId,
    main_file: "main.lua",
    priority: 1,
    version: "1.0.0",
    dependencies: ["Steamodded (>=1.0.0~BETA-0404a)"],
  };

  return JSON.stringify(metadata, null, 2);
};
