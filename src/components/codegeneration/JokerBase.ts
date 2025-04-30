import { JokerData } from "../JokerCard";
import { hasEffectType, getEffectParamValue } from "./effectUtils";

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
  const configItems: string[] = [];

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

        // Add new effect types
        if (effect.type === "add_money" && effect.params.value) {
          if (!configItems.some((item) => item.startsWith("money ="))) {
            configItems.push(`money = ${effect.params.value}`);
          }
        }
        if (effect.type === "level_up_hand" && effect.params.value) {
          if (!configItems.some((item) => item.startsWith("level_up ="))) {
            configItems.push(`level_up = ${effect.params.value}`);
          }
        }
        if (effect.type === "add_discard" && effect.params.value) {
          if (
            !configItems.some((item) => item.startsWith("discard_amount ="))
          ) {
            configItems.push(`discard_amount = ${effect.params.value}`);
          }
        }
        if (effect.type === "add_hand" && effect.params.value) {
          if (!configItems.some((item) => item.startsWith("hand_amount ="))) {
            configItems.push(`hand_amount = ${effect.params.value}`);
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

// Generate a loc_vars function
export const generateBasicLocVarsFunction = (joker: JokerData): string => {
  const vars: string[] = [];

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

        // Add new effect vars
        if (
          effect.type === "add_money" &&
          !vars.includes("card.ability.extra.money")
        ) {
          vars.push("card.ability.extra.money");
        }
        if (
          effect.type === "level_up_hand" &&
          !vars.includes("card.ability.extra.level_up")
        ) {
          vars.push("card.ability.extra.level_up");
        }
        if (
          effect.type === "add_discard" &&
          !vars.includes("card.ability.extra.discard_amount")
        ) {
          vars.push("card.ability.extra.discard_amount");
        }
        if (
          effect.type === "add_hand" &&
          !vars.includes("card.ability.extra.hand_amount")
        ) {
          vars.push("card.ability.extra.hand_amount");
        }
      });
    });
  }

  return `loc_vars = function(self, info_queue, card)
        return {vars = {${vars.join(", ")}}}
    end`;
};

export const generateBasicCalculateFunction = (joker: JokerData): string => {
  // Generate standard joker_main calculate function
  let calculateBody = "";

  // First check main effects
  if (joker.chipAddition > 0 || joker.multAddition > 0 || joker.xMult > 1) {
    calculateBody += `if context.joker_main then
            return {`;

    const returnItems: string[] = [];

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

    calculateBody += `
                ${returnItems.join(",\n                ")}
            }
        end`;
  }

  // Add level_up_hand logic if needed
  const hasLevelUp = hasEffectType(joker, "level_up_hand");
  if (hasLevelUp) {
    const levelUpValue =
      getEffectParamValue(joker, "level_up_hand", "value") || 1;

    calculateBody += `${
      calculateBody ? "\n\n        " : ""
    }if context.cardarea == G.play and context.before then
            return {
                level_up = ${levelUpValue},
                message = "Level Up!",
                colour = G.C.MULT
            }
        end`;
  }

  // If no calculate body was generated, create a simple placeholder function
  if (!calculateBody) {
    return "calculate = function(self, card, context) end";
  }

  return `calculate = function(self, card, context)
        ${calculateBody}
    end`;
};

// Generate add_to_deck and remove_from_deck functions for discard/hand effects
export const generateAddToRemoveFromDeckFunctions = (
  joker: JokerData
): string => {
  const hasDiscardEffect = hasEffectType(joker, "add_discard");
  const hasHandEffect = hasEffectType(joker, "add_hand");

  if (!hasDiscardEffect && !hasHandEffect) {
    return "";
  }

  const discardValue = getEffectParamValue(joker, "add_discard", "value") || 1;
  const handValue = getEffectParamValue(joker, "add_hand", "value") || 1;

  let addToFuncBody = "";
  let removeFromFuncBody = "";

  if (hasDiscardEffect) {
    addToFuncBody += `G.GAME.round_resets.discards = G.GAME.round_resets.discards + ${discardValue}`;
    removeFromFuncBody += `G.GAME.round_resets.discards = G.GAME.round_resets.discards - ${discardValue}`;
  }

  if (hasHandEffect) {
    addToFuncBody += `${
      addToFuncBody ? "\n        " : ""
    }G.GAME.round_resets.hands = G.GAME.round_resets.hands + ${handValue}`;
    removeFromFuncBody += `${
      removeFromFuncBody ? "\n        " : ""
    }G.GAME.round_resets.hands = G.GAME.round_resets.hands - ${handValue}`;
  }

  return `
    add_to_deck = function(self, card, from_debuff)
        ${addToFuncBody}
    end,
    
    remove_from_deck = function(self, card, from_debuff)
        ${removeFromFuncBody}
    end`;
};

// Generate calc_dollar_bonus function for add_money effect
export const generateCalcDollarBonusFunction = (joker: JokerData): string => {
  const hasMoneyEffect = hasEffectType(joker, "add_money");

  if (!hasMoneyEffect) {
    return "";
  }

  const moneyValue = getEffectParamValue(joker, "add_money", "value") || 0;

  return `
    calc_dollar_bonus = function(self, card)
        local bonus = card.ability.extra.money or ${moneyValue}
        if bonus > 0 then return bonus end
    end`;
};

// Generate self-destruct code
export const generateSelfDestructCode = (joker: JokerData): string => {
  const hasSelfDestruct = hasEffectType(joker, "destroy_self");

  if (!hasSelfDestruct) {
    return "";
  }

  // This follows the pattern from Gros Michel 2
  return `
    calculate = function(self, card, context)
        if context.end_of_round and not context.repetition and context.game_over == false and not context.blueprint then
            G.E_MANAGER:add_event(Event({
                func = function()
                    play_sound('tarot1')
                    card.T.r = -0.2
                    card:juice_up(0.3, 0.4)
                    card.states.drag.is = true
                    card.children.center.pinch.x = true
                    
                    G.E_MANAGER:add_event(Event({
                        trigger = 'after',
                        delay = 0.3,
                        blockable = false,
                        func = function()
                            G.jokers:remove_card(card)
                            card:remove()
                            card = nil
                            return true;
                        end
                    }))
                    return true
                end
            }))
            return {
                message = 'Self Destruct!',
                colour = G.C.RED
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
