import { JokerData } from "../JokerCard";
import {
  extractVariablesFromRules,
  generateVariableConfig,
  generateVariableLocVars,
} from "./VariableUtils";
import type { PassiveEffectResult } from "./PassiveEffects";

export const generateJokerBaseCode = (
  joker: JokerData,
  index: number,
  atlasKey: string,
  passiveEffects: PassiveEffectResult[] = []
): string => {
  const x = index % 10;
  const y = Math.floor(index / 10);

  const effectsConfig = extractEffectsConfig(joker, passiveEffects);

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
    cost = ${joker.cost !== undefined ? joker.cost : 4},
    rarity = ${joker.rarity},
    blueprint_compat = ${
      joker.blueprint_compat !== undefined ? joker.blueprint_compat : true
    },
    eternal_compat = ${
      joker.eternal_compat !== undefined ? joker.eternal_compat : true
    },
    unlocked = ${joker.unlocked !== undefined ? joker.unlocked : true},
    discovered = ${joker.discovered !== undefined ? joker.discovered : true},
    atlas = '${atlasKey}'`;
};

export const extractEffectsConfig = (
  joker: JokerData,
  passiveEffects: PassiveEffectResult[] = []
): string => {
  const configItems: string[] = [];
  const variableCount: Record<string, number> = {};

  const getUniqueVariableName = (baseName: string): string => {
    if (variableCount[baseName] === undefined) {
      variableCount[baseName] = 0;
      return baseName;
    } else {
      variableCount[baseName]++;
      return `${baseName}${variableCount[baseName]}`;
    }
  };

  passiveEffects.forEach((effect) => {
    if (effect.configVariables) {
      configItems.push(...effect.configVariables);
    }
  });

  if (joker.rules && joker.rules.length > 0) {
    const nonPassiveRules = joker.rules.filter(
      (rule) => rule.trigger !== "passive"
    );
    const variables = extractVariablesFromRules(nonPassiveRules);
    const variableConfig = generateVariableConfig(variables);
    if (variableConfig) {
      configItems.push(variableConfig);
    }

    nonPassiveRules.forEach((rule) => {
      rule.effects.forEach((effect) => {
        if (effect.params.value_source === "variable") {
          return;
        }

        if (
          effect.type === "add_chips" &&
          effect.params.value_source !== "variable"
        ) {
          const varName = getUniqueVariableName("chips");
          configItems.push(`${varName} = ${effect.params.value || 10}`);
        }
        if (
          effect.type === "add_mult" &&
          effect.params.value_source !== "variable"
        ) {
          const varName = getUniqueVariableName("mult");
          configItems.push(`${varName} = ${effect.params.value || 5}`);
        }
        if (
          effect.type === "apply_x_mult" &&
          effect.params.value_source !== "variable"
        ) {
          const varName = getUniqueVariableName("Xmult");
          configItems.push(`${varName} = ${effect.params.value || 1.5}`);
        }
        if (
          effect.type === "add_dollars" &&
          effect.params.value_source !== "variable"
        ) {
          const varName = getUniqueVariableName("dollars");
          configItems.push(`${varName} = ${effect.params.value || 5}`);
        }
        if (effect.type === "retrigger_cards") {
          const varName = getUniqueVariableName("repetitions");
          configItems.push(`${varName} = ${effect.params.repetitions || 1}`);
        }
        if (effect.type === "edit_hand") {
          const varName = getUniqueVariableName("hands");
          configItems.push(`${varName} = ${effect.params.value || 1}`);
        }
        if (effect.type === "edit_discard") {
          const varName = getUniqueVariableName("discards");
          configItems.push(`${varName} = ${effect.params.value || 1}`);
        }
        if (effect.type === "level_up_hand") {
          const varName = getUniqueVariableName("levels");
          configItems.push(`${varName} = ${effect.params.value || 1}`);
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

export const generateBasicLocVarsFunction = (
  joker: JokerData,
  passiveEffects: PassiveEffectResult[] = []
): string => {
  const vars: string[] = [];
  const variableCount: Record<string, number> = {};

  passiveEffects.forEach((effect) => {
    if (effect.locVars) {
      vars.push(...effect.locVars);
    }
  });

  if (joker.rules && joker.rules.length > 0) {
    const nonPassiveRules = joker.rules.filter(
      (rule) => rule.trigger !== "passive"
    );
    const variables = extractVariablesFromRules(nonPassiveRules);
    const variableLocVars = generateVariableLocVars(variables);
    vars.push(...variableLocVars);
  }

  const getUniqueVariableName = (baseName: string): string => {
    if (variableCount[baseName] === undefined) {
      variableCount[baseName] = 0;
      return baseName;
    } else {
      variableCount[baseName]++;
      return `${baseName}${variableCount[baseName]}`;
    }
  };

  if (joker.rules && joker.rules.length > 0) {
    const nonPassiveRules = joker.rules.filter(
      (rule) => rule.trigger !== "passive"
    );
    nonPassiveRules.forEach((rule) => {
      rule.effects.forEach((effect) => {
        if (effect.type === "add_chips") {
          const varName = getUniqueVariableName("chips");
          vars.push(`card.ability.extra.${varName}`);
        }
        if (effect.type === "add_mult") {
          const varName = getUniqueVariableName("mult");
          vars.push(`card.ability.extra.${varName}`);
        }
        if (effect.type === "apply_x_mult") {
          const varName = getUniqueVariableName("Xmult");
          vars.push(`card.ability.extra.${varName}`);
        }
        if (effect.type === "add_dollars") {
          const varName = getUniqueVariableName("dollars");
          vars.push(`card.ability.extra.${varName}`);
        }
        if (effect.type === "retrigger_cards") {
          const varName = getUniqueVariableName("repetitions");
          vars.push(`card.ability.extra.${varName}`);
        }
        if (effect.type === "edit_hand") {
          const varName = getUniqueVariableName("hands");
          vars.push(`card.ability.extra.${varName}`);
        }
        if (effect.type === "edit_discard") {
          const varName = getUniqueVariableName("discards");
          vars.push(`card.ability.extra.${varName}`);
        }
        if (effect.type === "level_up_hand") {
          const varName = getUniqueVariableName("levels");
          vars.push(`card.ability.extra.${varName}`);
        }
      });
    });
  }

  return `loc_vars = function(self, info_queue, card)
        return {vars = {${vars.join(", ")}}}
    end`;
};
