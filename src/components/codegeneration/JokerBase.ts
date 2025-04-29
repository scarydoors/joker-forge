import { JokerData } from "../JokerCard";

export const generateJokerBaseCode = (
  joker: JokerData,
  index: number,
  atlasKey: string
): string => {
  const x = index % 10;
  const y = Math.floor(index / 10);

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

  // No automatic description generation - use exactly what user provided

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
  if (joker.chipAddition > 0) vars.push("card.ability.extra.chips");
  if (joker.multAddition > 0) vars.push("card.ability.extra.mult");
  if (joker.xMult > 1) vars.push("card.ability.extra.Xmult");

  return `loc_vars = function(self, info_queue, card)
        return {vars = {${vars.join(", ")}}}
    end`;
};

export const generateBasicCalculateFunction = (joker: JokerData): string => {
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
