// codeGeneration.ts
// Functions for generating Lua code for Balatro mods

import { JokerData } from "./JokerCard";
import JSZip from "jszip";
import { addAtlasToZip } from "./imageProcessor";

/**
 * Generate Lua code for a Balatro mod based on the jokers provided
 */
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

/**
 * Generate the main.lua file content
 */
const generateMainLua = (jokers: JokerData[]): string => {
  let output = `local mod = SMODS.current_mod

mod.config = {}

SMODS.Atlas({
    key = "CustomJokers",
    path = "CustomJokers.png",
    px = 71,
    py = 95,
    atlas_table = "ASSET_ATLAS"
}):register()

`;

  jokers.forEach((joker, index) => {
    output += generateJokerCode(joker, index, "CustomJokers") + "\n\n";
  });

  output += "return mod";
  return output;
};

/**
 * Generate code for a single joker
 * @param joker - Joker configuration object
 * @param index - Index in the joker list (for position)
 * @param atlasKey - The key used when registering the SMODS.Atlas
 * @returns - Lua code for this joker
 */
const generateJokerCode = (
  joker: JokerData,
  index: number,
  atlasKey: string
): string => {
  const x = index % 10;
  const y = Math.floor(index / 10);
  const formattedDescription = formatJokerDescription(joker);
  const calculateFunc = generateCalculateFunction(joker);
  const locVarsFunc = generateLocVarsFunction(joker);

  return `SMODS.Joker{ --${joker.name}
    name = "${joker.name}",
    key = "${slugify(joker.name)}",
    config = {
        extra = {
            ${joker.chipAddition > 0 ? `chips = ${joker.chipAddition},` : ""}
            ${joker.multAddition > 0 ? `mult = ${joker.multAddition},` : ""}
            ${joker.xMult > 1 ? `Xmult = ${joker.xMult},` : ""}
        }
    },
    loc_txt = {
        ['name'] = '${joker.name}',
        ['text'] = ${formattedDescription}
    },
    pos = {
        x = ${x},
        y = ${y}
    },
    cost = ${getCostFromRarity(joker.rarity)},
    rarity = ${joker.rarity},
    pools = { ['Joker'] = true },
    blueprint_compat = true,
    eternal_compat = true,
    unlocked = true,
    discovered = true,
    atlas = '${atlasKey}',

    ${locVarsFunc.trim()},

    ${calculateFunc}
}`;
};

/**
 * Generate the mod metadata JSON file
 */
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

/**
 * Format joker description into a Lua loc_txt table
 */
const formatJokerDescription = (joker: JokerData): string => {
  let formatted = joker.description.replace(/<br\s*\/?>/gi, "[s]");

  if (
    formatted === "A {C:blue}custom{} joker with {C:red}unique{} effects." &&
    (joker.chipAddition > 0 || joker.multAddition > 0 || joker.xMult > 1)
  ) {
    const parts = [];
    let n = 1;
    if (joker.chipAddition > 0) parts.push(`{C:chips}+#${n++}# Chips{}`);
    if (joker.multAddition > 0) parts.push(`{C:mult}+#${n++}# Mult{}`);
    if (joker.xMult > 1) parts.push(`{X:mult,C:white}X#${n++}#`);
    formatted = parts.join(", ") + " to all hands";
  }

  const words = formatted.split(" ");
  const lines = [];
  let line = "";

  words.forEach((word) => {
    if (line.length + word.length + 1 > 28 || word.includes("[s]")) {
      lines.push(line.trim());
      line = "";
    }
    line += (line ? " " : "") + word.replace("[s]", "");
  });

  if (line) lines.push(line.trim());

  return `{\n${lines
    .map((line, i) => `        [${i + 1}] = '${line.replace(/'/g, "\\'")}'`)
    .join(",\n")}\n    }`;
};

/**
 * Generate the Joker's loc_vars function
 */
const generateLocVarsFunction = (joker: JokerData): string => {
  const vars = [];
  if (joker.chipAddition > 0) vars.push("card.ability.extra.chips");
  if (joker.multAddition > 0) vars.push("card.ability.extra.mult");
  if (joker.xMult > 1) vars.push("card.ability.extra.Xmult");

  return `loc_vars = function(self, info_queue, card)
        return { vars = { ${vars.join(", ")} } }
    end`;
};

/**
 * Generate the Joker's calculate function
 */
const generateCalculateFunction = (joker: JokerData): string => {
  if (joker.chipAddition <= 0 && joker.multAddition <= 0 && joker.xMult <= 1) {
    return "calculate = function(self, card, context) end";
  }

  let message = "";
  if (joker.xMult > 1) {
    message =
      "message = localize{type='variable',key='a_xmult',vars={card.ability.extra.Xmult}},";
  } else if (joker.multAddition > 0) {
    message =
      "message = localize{type='variable',key='a_mult',vars={card.ability.extra.mult}},";
  } else if (joker.chipAddition > 0) {
    message =
      "message = localize{type='variable',key='a_chips',vars={card.ability.extra.chips}},";
  }

  const mods = [
    joker.chipAddition > 0 ? "chip_mod = card.ability.extra.chips" : "",
    joker.multAddition > 0 ? "mult_mod = card.ability.extra.mult" : "",
    joker.xMult > 1 ? "Xmult_mod = card.ability.extra.Xmult" : "",
  ]
    .filter(Boolean)
    .join(",\n                ");

  return `calculate = function(self, card, context)
        if context.cardarea == G.jokers and context.joker_main then
            return {
                ${message}
                ${mods}
            }
        end
    end`;
};

/**
 * Turn a name into a safe Lua key
 */
const slugify = (text: string): string => {
  return (
    text
      .toLowerCase()
      .replace(/[\s\W_]+/g, "")
      .replace(/^[\d]/, "_$&") ||
    `joker_${Math.random().toString(36).substring(2, 8)}`
  );
};

/**
 * Get the cost value from rarity
 */
const getCostFromRarity = (rarity: number): number => {
  switch (rarity) {
    case 1:
      return 4;
    case 2:
      return 5;
    case 3:
      return 6;
    case 4:
      return 8;
    default:
      return 5;
  }
};
