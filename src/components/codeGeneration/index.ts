import { JokerData } from "../JokerCard";
import JSZip from "jszip";
import { addAtlasToZip } from "./ImageProcessor";
import {
  generateJokerBaseCode,
  generateBasicLocVarsFunction,
} from "./JokerBase";
import { generatePokerHandCondition } from "./effects/PokerHandEffects";
import { generateCalculateFunction } from "./calculateUtils";
import { generateSuitCardCondition } from "./effects/SuitCardEffects";
import { generateRankCardCondition } from "./effects/RankCardEffects";
import { generateCountCardCondition } from "./effects/CountHandEffects";
import { generatePlayerMoneyCondition } from "./effects/PlayerMoneyEffects";
import { generateRemainingHandsCondition } from "./effects/RemainingHandsEffects";
import { generateRemainingDiscardsCondition } from "./effects/RemainingDiscardsEffects";
import { generateJokerCountCondition } from "./effects/JokerCountEffects";
import { generateBlindTypeCondition } from "./effects/BlindTypeEffects";

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
    functionNames: string[];
  }[] = [];

  // First pass: collect all helper functions
  jokers.forEach((joker, index) => {
    const functionNames: string[] = [];

    console.log("Joker rules:", joker.rules);

    if (joker.rules && joker.rules.length > 0) {
      // Check for poker hand rules
      const pokerHandRules = joker.rules.filter((rule) => {
        return rule.conditionGroups.some((group) =>
          group.conditions.some((condition) => condition.type === "hand_type")
        );
      });

      // Generate poker hand condition function if needed
      if (pokerHandRules.length > 0) {
        const pokerHandCondition = generatePokerHandCondition(pokerHandRules);
        if (pokerHandCondition) {
          helperFunctions.push(pokerHandCondition.functionCode);
          functionNames.push(pokerHandCondition.functionName);
        }
      }

      // Check for suit rules
      const suitRules = joker.rules.filter((rule) => {
        return rule.conditionGroups.some((group) =>
          group.conditions.some(
            (condition) =>
              condition.type === "suit_count" || condition.type === "card_suit"
          )
        );
      });

      // Generate suit condition function if needed
      if (suitRules.length > 0) {
        const suitCondition = generateSuitCardCondition(suitRules);
        if (suitCondition) {
          helperFunctions.push(suitCondition.functionCode);
          functionNames.push(suitCondition.functionName);
        }
      }

      // Check for rank rules
      const rankRules = joker.rules.filter((rule) => {
        return rule.conditionGroups.some((group) =>
          group.conditions.some(
            (condition) =>
              condition.type === "rank_count" || condition.type === "card_rank"
          )
        );
      });

      // Generate rank condition function if needed
      if (rankRules.length > 0) {
        const rankCondition = generateRankCardCondition(rankRules);
        if (rankCondition) {
          helperFunctions.push(rankCondition.functionCode);
          functionNames.push(rankCondition.functionName);
        }
      }

      // Check for card count rules
      const countRules = joker.rules.filter((rule) => {
        return rule.conditionGroups.some((group) =>
          group.conditions.some((condition) => condition.type === "card_count")
        );
      });

      // Generate card count condition function if needed
      if (countRules.length > 0) {
        const countCondition = generateCountCardCondition(countRules);
        if (countCondition) {
          helperFunctions.push(countCondition.functionCode);
          functionNames.push(countCondition.functionName);
        }
      }
    }

    // Check for player money rules
    const moneyRules = (joker.rules ?? []).filter((rule) => {
      return rule.conditionGroups.some((group) =>
        group.conditions.some((condition) => condition.type === "player_money")
      );
    });

    // Generate player money condition function if needed
    if (moneyRules.length > 0) {
      const moneyCondition = generatePlayerMoneyCondition(moneyRules);
      if (moneyCondition) {
        helperFunctions.push(moneyCondition.functionCode);
        functionNames.push(moneyCondition.functionName);
      }
    }

    // Check for remaining hands rules
    const handsRules = (joker.rules ?? []).filter((rule) => {
      return rule.conditionGroups.some((group) =>
        group.conditions.some(
          (condition) => condition.type === "remaining_hands"
        )
      );
    });

    // Generate remaining hands condition function if needed
    if (handsRules.length > 0) {
      const handsCondition = generateRemainingHandsCondition(handsRules);
      if (handsCondition) {
        helperFunctions.push(handsCondition.functionCode);
        functionNames.push(handsCondition.functionName);
      }
    }

    // Check for remaining discards rules
    const discardRules = (joker.rules ?? []).filter((rule) => {
      return rule.conditionGroups.some((group) =>
        group.conditions.some(
          (condition) => condition.type === "remaining_discards"
        )
      );
    });

    // Generate remaining discards condition function if needed
    if (discardRules.length > 0) {
      const discardCondition = generateRemainingDiscardsCondition(discardRules);
      if (discardCondition) {
        helperFunctions.push(discardCondition.functionCode);
        functionNames.push(discardCondition.functionName);
      }
    }

    const jokerCountRules = (joker.rules ?? []).filter((rule) => {
      return rule.conditionGroups.some((group) =>
        group.conditions.some((condition) => condition.type === "joker_count")
      );
    });

    // Generate joker count condition function if needed
    if (jokerCountRules.length > 0) {
      const jokerCountCondition = generateJokerCountCondition(jokerCountRules);
      if (jokerCountCondition) {
        helperFunctions.push(jokerCountCondition.functionCode);
        functionNames.push(jokerCountCondition.functionName);
      }
    }

    // Check for blind type rules
    const blindTypeRules = (joker.rules ?? []).filter((rule) => {
      return rule.conditionGroups.some((group) =>
        group.conditions.some((condition) => condition.type === "blind_type")
      );
    });

    // Generate blind type condition function if needed
    if (blindTypeRules.length > 0) {
      const blindTypeCondition = generateBlindTypeCondition(blindTypeRules);
      if (blindTypeCondition) {
        helperFunctions.push(blindTypeCondition.functionCode);
        functionNames.push(blindTypeCondition.functionName);
      }
    }

    // More condition types will be added here in the future

    jokerGenerationData.push({
      joker,
      index,
      functionNames,
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
  jokerGenerationData.forEach(({ joker, index, functionNames }) => {
    output +=
      generateJokerCode(joker, index, "CustomJokers", functionNames) + "\n\n";
  });

  output += "return mod";
  return output;
};

const generateJokerCode = (
  joker: JokerData,
  index: number,
  atlasKey: string,
  conditionFunctions: string[]
): string => {
  console.log(`Generating code for joker: ${joker.name}`);

  // Start with the base joker code
  let jokerCode = generateJokerBaseCode(joker, index, atlasKey);

  // Generate loc_vars function
  const locVarsCode = generateBasicLocVarsFunction(joker);

  // Generate the calculate function that combines all conditions
  const calculateCode = generateCalculateFunction(
    joker,
    joker.rules || [],
    conditionFunctions
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
