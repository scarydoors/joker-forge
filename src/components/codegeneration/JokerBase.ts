import { JokerData } from "../JokerCard";
import { Rule, Effect } from "../ruleBuilder/types";

export const generateJokerBaseCode = (
  joker: JokerData,
  index: number,
  atlasKey: string
): string => {
  const x = index % 10;
  const y = Math.floor(index / 10);

  // Extract effect values from joker data and rules
  const effectsConfig = extractEffectsConfig(joker);

  return `SMODS.Joker{ --${joker.name}
    name = "${joker.name}",
    key = "${slugify(joker.name)}",
    config = {
        extra = {
            ${effectsConfig}
        }
    },
    loc_txt = {
        ['name'] = '${joker.name}',
        ['text'] = ${formatJokerDescription(joker)}
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
    atlas = '${atlasKey}'`;
};

// Extract effect values from joker data and rules to populate the config.extra section
export const extractEffectsConfig = (joker: JokerData): string => {
  const configItems = [];

  // Add basic effects from joker data
  if (joker.chipAddition > 0) {
    configItems.push(`chips = ${joker.chipAddition}`);
  }
  if (joker.multAddition > 0) {
    configItems.push(`mult = ${joker.multAddition}`);
  }
  if (joker.xMult > 1) {
    configItems.push(`Xmult = ${joker.xMult}`);
  }

  // If there are rules, check for additional effects
  if (joker.rules && joker.rules.length > 0) {
    joker.rules.forEach((rule) => {
      rule.effects.forEach((effect) => {
        // Extract effects from rules
        if (effect.type === "add_chips" && effect.params.value) {
          // Only add if not already added
          if (!configItems.some((item) => item.startsWith("chips ="))) {
            configItems.push(`chips = ${effect.params.value}`);
          }
        }
        if (effect.type === "add_mult" && effect.params.value) {
          if (!configItems.some((item) => item.startsWith("mult ="))) {
            configItems.push(`mult = ${effect.params.value}`);
          }
        }
        if (effect.type === "apply_x_mult" && effect.params.value) {
          if (!configItems.some((item) => item.startsWith("Xmult ="))) {
            configItems.push(`Xmult = ${effect.params.value}`);
          }
        }
      });
    });
  }

  return configItems.join(",\n            ");
};

export const slugify = (text: string): string => {
  return (
    text
      .toLowerCase()
      .replace(/[\s\W_]+/g, "")
      .replace(/^[\d]/, "_$&") ||
    `joker_${Math.random().toString(36).substring(2, 8)}`
  );
};

export const formatJokerDescription = (joker: JokerData): string => {
  const formatted = joker.description.replace(/<br\s*\/?>/gi, "[s]");

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

export const generateBasicLocVarsFunction = (joker: JokerData): string => {
  const vars = [];

  // Check joker properties
  if (joker.chipAddition > 0) vars.push("card.ability.extra.chips");
  if (joker.multAddition > 0) vars.push("card.ability.extra.mult");
  if (joker.xMult > 1) vars.push("card.ability.extra.Xmult");

  // Check rules for additional vars
  if (joker.rules && joker.rules.length > 0) {
    joker.rules.forEach((rule) => {
      rule.effects.forEach((effect) => {
        if (
          effect.type === "add_chips" &&
          !vars.includes("card.ability.extra.chips")
        ) {
          vars.push("card.ability.extra.chips");
        }
        if (
          effect.type === "add_mult" &&
          !vars.includes("card.ability.extra.mult")
        ) {
          vars.push("card.ability.extra.mult");
        }
        if (
          effect.type === "apply_x_mult" &&
          !vars.includes("card.ability.extra.Xmult")
        ) {
          vars.push("card.ability.extra.Xmult");
        }
      });
    });
  }

  return `loc_vars = function(self, info_queue, card)
        return {vars = {${vars.join(", ")}}}
    end`;
};

export const generateBasicCalculateFunction = (joker: JokerData): string => {
  if (joker.chipAddition <= 0 && joker.multAddition <= 0 && joker.xMult <= 1) {
    return "calculate = function(self, card, context) end";
  }

  let returnItems = [];

  if (joker.chipAddition > 0) {
    returnItems.push(
      `message = localize{type='variable',key='a_chips',vars={card.ability.extra.chips}}`
    );
    returnItems.push(`chip_mod = card.ability.extra.chips`);
    returnItems.push(`colour = G.C.CHIPS`);
  } else if (joker.multAddition > 0) {
    returnItems.push(
      `message = localize{type='variable',key='a_mult',vars={card.ability.extra.mult}}`
    );
    returnItems.push(`mult_mod = card.ability.extra.mult`);
    returnItems.push(`colour = G.C.MULT`);
  } else if (joker.xMult > 1) {
    returnItems.push(
      `message = localize{type='variable',key='a_xmult',vars={card.ability.extra.Xmult}}`
    );
    returnItems.push(`Xmult_mod = card.ability.extra.Xmult`);
    returnItems.push(`colour = G.C.MONEY`);
  }

  return `calculate = function(self, card, context)
        if context.joker_main then
            return {
                ${returnItems.join(",\n                ")}
            }
        end
    end`;
};

export const getCostFromRarity = (rarity: number): number => {
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
