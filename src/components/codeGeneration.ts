// Functions for generating Lua code for Balatro mods

import { JokerData } from "./JokerCard";
import JSZip from "jszip";
import { addAtlasToZip } from "./imageProcessor";
import { Rule, ConditionGroup, Condition } from "./rulebuilder/types";

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

// Configure the mod
mod.config = {}

// Create custom joker atlas
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
    if (joker.xMult > 1) parts.push(`{X:mult,C:white}X#${n++}#{}`);
    formatted = parts.join(", ");
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
    .map((line, i) => `            [${i + 1}] = '${line.replace(/'/g, "\\'")}'`)
    .join(",\n")}\n        }`;
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
        return {vars = {${vars.join(", ")}}}
    end`;
};

/**
 * Generate the Joker's calculate function, including rule-based logic
 */
const generateCalculateFunction = (joker: JokerData): string => {
  // Handle case with no effects or rules
  const basicEffects = !!(
    joker.chipAddition > 0 ||
    joker.multAddition > 0 ||
    joker.xMult > 1
  );
  const hasRules = !!(joker.rules && joker.rules.length > 0);

  if (!basicEffects && !hasRules) {
    return "calculate = function(self, card, context) end";
  }

  // Generate code for basic effects
  let basicEffectsCode = "";
  if (basicEffects) {
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

    basicEffectsCode = `
        if context.cardarea == G.jokers and context.joker_main then
            return {
                ${message}
                ${mods}
            }
        end`;
  }

  // Generate code for rule-based logic
  let rulesCode = "";
  if (hasRules) {
    rulesCode = generateRulesCode(joker.rules || []);
  }

  return `calculate = function(self, card, context)${basicEffectsCode}${rulesCode}
    end`;
};

/**
 * Generate code for rule-based logic
 */
const generateRulesCode = (rules: Rule[]): string => {
  const pokerHandRules = rules.filter(
    (rule) => rule.trigger === "poker_hand_played"
  );

  if (pokerHandRules.length === 0) {
    return "";
  }

  let code = `
        -- Rule-based effects for when poker hands are played
        if context.before and context.cardarea == G.play then
            local chips_mod = 0
            local mult_mod = 0
            local xmult_mod = 1
            local level_up_value = 0
  `;

  pokerHandRules.forEach((rule) => {
    let conditionCode = "true";
    if (rule.conditionGroups.length > 0) {
      const groupCodes = rule.conditionGroups.map(generateConditionGroupCode);

      // Build the condition code with proper operators
      conditionCode = groupCodes[0];
      for (let i = 1; i < rule.conditionGroups.length; i++) {
        const operator =
          rule.conditionGroups[i].operator === "and" ? " and " : " or ";
        conditionCode += `${operator}${groupCodes[i]}`;
      }
    }

    const effectValues = getEffectValues(rule);

    code += `
            -- Check rule conditions
            if ${conditionCode} then
                ${
                  effectValues.chips
                    ? `chips_mod = chips_mod + ${effectValues.chips}`
                    : ""
                }
                ${
                  effectValues.mult
                    ? `mult_mod = mult_mod + ${effectValues.mult}`
                    : ""
                }
                ${
                  effectValues.xmult && effectValues.xmult !== 1
                    ? `xmult_mod = xmult_mod * ${effectValues.xmult}`
                    : ""
                }
                ${
                  effectValues.level_up
                    ? `level_up_value = ${effectValues.level_up}`
                    : ""
                }
                ${
                  effectValues.message
                    ? `card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = "${effectValues.message}", colour = G.C.CHIPS})`
                    : ""
                }
            end`;
  });

  code += `
            -- Return combined effects if any were triggered
            if chips_mod > 0 or mult_mod > 0 or xmult_mod > 1 or level_up_value > 0 then
                local ret = {}
                if chips_mod > 0 then ret.chip_mod = chips_mod end
                if mult_mod > 0 then ret.mult_mod = mult_mod end
                if xmult_mod > 1 then ret.Xmult_mod = xmult_mod end
                if level_up_value > 0 then ret.level_up = level_up_value end
                return ret
            end
        end`;

  return code;
};

/**
 * Generate code for a condition group
 */
const generateConditionGroupCode = (group: ConditionGroup): string => {
  if (group.conditions.length === 0) {
    return "true";
  }

  const conditionCodes = group.conditions.map(generateConditionCode);
  return `(${conditionCodes.join(" and ")})`;
};

/**
 * Generate code for a single condition
 */
const generateConditionCode = (condition: Condition): string => {
  if (condition.type === "hand_type") {
    return generateHandTypeConditionCode(condition);
  }

  // Add more condition types here as needed

  return "true"; // Default to true if condition type is not supported
};

/**
 * Generate code for a hand type condition
 */
const generateHandTypeConditionCode = (condition: Condition): string => {
  const operator = condition.params.operator as string;
  const value = condition.params.value as string;

  let code = "";
  if (operator === "equals") {
    code = `next(context.poker_hands["${value}"])`;
  } else if (operator === "not_equals") {
    code = `not next(context.poker_hands["${value}"])`;
  }

  return condition.negate ? `not (${code})` : code;
};

/**
 * Get effect values for a rule
 */
const getEffectValues = (rule: Rule): Record<string, any> => {
  const values: Record<string, any> = {};

  rule.effects.forEach((effect) => {
    if (effect.type === "add_chips") {
      const value = effect.params.value as number;
      values.chips = (values.chips || 0) + value;

      // Add a message for the first effect
      if (!values.message) {
        values.message = `+${value} Chips`;
      }
    } else if (effect.type === "add_mult") {
      const value = effect.params.value as number;
      values.mult = (values.mult || 0) + value;

      // Add a message for the first effect if none yet
      if (!values.message) {
        values.message = `+${value} Mult`;
      }
    } else if (effect.type === "apply_x_mult") {
      const value = effect.params.value as number;
      values.xmult = (values.xmult || 1) * value;

      // Add a message for the first effect if none yet
      if (!values.message) {
        values.message = `×${value}`;
      }
    } else if (effect.type === "level_up_hand") {
      const value = effect.params.value as number;
      values.level_up = value;

      // Add a message for the first effect if none yet
      if (!values.message) {
        values.message = `Level Up +${value}`;
      }
    }
    // Add more effect types here as needed
  });

  return values;
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
