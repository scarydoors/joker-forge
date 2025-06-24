import { JokerData } from "../JokerCard";
import {
  extractVariablesFromRules,
  generateVariableConfig,
  generateVariableLocVars,
} from "./VariableUtils";
import type { PassiveEffectResult } from "./PassiveEffects";
import type { Rule } from "../ruleBuilder/types";

interface EffectVariableMapping {
  [effectId: string]: string;
}

let globalEffectVariableMapping: EffectVariableMapping = {};

export const generateJokerBaseCode = (
  joker: JokerData,
  index: number,
  atlasKey: string,
  passiveEffects: PassiveEffectResult[] = [],
  allJokers?: JokerData[]
): string => {
  let totalSlotsUsed = 0;
  if (allJokers) {
    for (let i = 0; i < index; i++) {
      totalSlotsUsed += allJokers[i].overlayImagePreview ? 2 : 1;
    }
  } else {
    totalSlotsUsed = index;
  }

  const x = totalSlotsUsed % 10;
  const y = Math.floor(totalSlotsUsed / 10);

  globalEffectVariableMapping = {};
  const effectsConfig = extractEffectsConfig(joker, passiveEffects);

  let jokerCode = `SMODS.Joker{ --${joker.name}
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

  if (joker.overlayImagePreview) {
    const soulX = (totalSlotsUsed + 1) % 10;
    const soulY = Math.floor((totalSlotsUsed + 1) / 10);
    jokerCode += `,
    soul_pos = {
        x = ${soulX},
        y = ${soulY}
    }`;
  }

  return jokerCode;
};

export const getEffectVariableName = (
  effectId: string,
  fallback: string
): string => {
  return globalEffectVariableMapping[effectId] || fallback;
};

export const extractEffectsConfig = (
  joker: JokerData,
  passiveEffects: PassiveEffectResult[] = []
): string => {
  const configItems: string[] = [];
  const variableCountByType: Record<string, number> = {};

  const getUniqueVariableName = (baseName: string): string => {
    if (variableCountByType[baseName] === undefined) {
      variableCountByType[baseName] = 0;
      return baseName;
    } else {
      variableCountByType[baseName]++;
      return `${baseName}${variableCountByType[baseName]}`;
    }
  };

  // Get all variable names for checking
  const allVariableNames = new Set<string>();
  if (joker.userVariables) {
    joker.userVariables.forEach((v) => allVariableNames.add(v.name));
  }
  if (joker.rules) {
    const nonPassiveRules = joker.rules.filter(
      (rule) => rule.trigger !== "passive"
    );
    const autoVariables = extractVariablesFromRules(nonPassiveRules);
    autoVariables.forEach((v) => allVariableNames.add(v.name));
  }

  const isVariableReference = (value: unknown): boolean => {
    return typeof value === "string" && allVariableNames.has(value);
  };

  passiveEffects.forEach((effect) => {
    if (effect.configVariables) {
      configItems.push(...effect.configVariables);
    }
  });

  // Add user-defined variables
  if (joker.userVariables && joker.userVariables.length > 0) {
    joker.userVariables.forEach((variable) => {
      configItems.push(`${variable.name} = ${variable.initialValue}`);
    });
  }

  if (joker.rules && joker.rules.length > 0) {
    const nonPassiveRules = joker.rules.filter(
      (rule) => rule.trigger !== "passive"
    );
    const variables = extractVariablesFromRules(nonPassiveRules);

    // Only add auto-detected variables that aren't already user-defined
    const userVariableNames = new Set(
      joker.userVariables?.map((v) => v.name) || []
    );
    const autoVariables = variables.filter(
      (v) => !userVariableNames.has(v.name)
    );

    if (autoVariables.length > 0) {
      const variableConfig = generateVariableConfig(autoVariables);
      if (variableConfig) {
        configItems.push(variableConfig);
      }
    }

    const rulesByTrigger: Record<string, Rule[]> = {};
    nonPassiveRules.forEach((rule) => {
      if (!rulesByTrigger[rule.trigger]) {
        rulesByTrigger[rule.trigger] = [];
      }
      rulesByTrigger[rule.trigger].push(rule);
    });

    Object.values(rulesByTrigger).forEach((rulesWithSameTrigger) => {
      rulesWithSameTrigger.forEach((rule) => {
        rule.effects.forEach((effect) => {
          // Skip effects that use variables as their value
          if (isVariableReference(effect.params.value)) {
            return;
          }

          if (
            effect.type === "add_chips" &&
            !isVariableReference(effect.params.value)
          ) {
            const varName = getUniqueVariableName("chips");
            configItems.push(`${varName} = ${effect.params.value || 10}`);
            globalEffectVariableMapping[effect.id] = varName;
          }
          if (
            effect.type === "add_mult" &&
            !isVariableReference(effect.params.value)
          ) {
            const varName = getUniqueVariableName("mult");
            configItems.push(`${varName} = ${effect.params.value || 5}`);
            globalEffectVariableMapping[effect.id] = varName;
          }
          if (
            effect.type === "apply_x_mult" &&
            !isVariableReference(effect.params.value)
          ) {
            const varName = getUniqueVariableName("Xmult");
            configItems.push(`${varName} = ${effect.params.value || 1.5}`);
            globalEffectVariableMapping[effect.id] = varName;
          }
          if (
            effect.type === "add_dollars" &&
            !isVariableReference(effect.params.value)
          ) {
            const varName = getUniqueVariableName("dollars");
            configItems.push(`${varName} = ${effect.params.value || 5}`);
            globalEffectVariableMapping[effect.id] = varName;
          }
          if (effect.type === "retrigger_cards") {
            const varName = getUniqueVariableName("repetitions");
            configItems.push(`${varName} = ${effect.params.repetitions || 1}`);
            globalEffectVariableMapping[effect.id] = varName;
          }
          if (effect.type === "edit_hand") {
            const varName = getUniqueVariableName("hands");
            configItems.push(`${varName} = ${effect.params.value || 1}`);
            globalEffectVariableMapping[effect.id] = varName;
          }
          if (effect.type === "edit_discard") {
            const varName = getUniqueVariableName("discards");
            configItems.push(`${varName} = ${effect.params.value || 1}`);
            globalEffectVariableMapping[effect.id] = varName;
          }
          if (effect.type === "level_up_hand") {
            const varName = getUniqueVariableName("levels");
            configItems.push(`${varName} = ${effect.params.value || 1}`);
            globalEffectVariableMapping[effect.id] = varName;
          }
        });
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
  const processedVarNames = new Set<string>();

  passiveEffects.forEach((effect) => {
    if (effect.locVars) {
      vars.push(...effect.locVars);
    }
  });

  if (joker.rules && joker.rules.length > 0) {
    const nonPassiveRules = joker.rules.filter(
      (rule) => rule.trigger !== "passive"
    );

    // Add user-defined variables
    if (joker.userVariables && joker.userVariables.length > 0) {
      joker.userVariables.forEach((variable) => {
        if (!processedVarNames.has(variable.name)) {
          vars.push(`card.ability.extra.${variable.name}`);
          processedVarNames.add(variable.name);
        }
      });
    }

    const variables = extractVariablesFromRules(nonPassiveRules);
    const variableLocVars = generateVariableLocVars(variables);

    // Only add auto-detected variables that aren't already processed
    variableLocVars.forEach((locVar) => {
      const varName = locVar.split(".").pop() || "";
      if (!processedVarNames.has(varName)) {
        vars.push(locVar);
        processedVarNames.add(varName);
      }
    });

    const rulesByTrigger: Record<string, Rule[]> = {};
    nonPassiveRules.forEach((rule) => {
      if (!rulesByTrigger[rule.trigger]) {
        rulesByTrigger[rule.trigger] = [];
      }
      rulesByTrigger[rule.trigger].push(rule);
    });

    Object.values(rulesByTrigger).forEach((rulesWithSameTrigger) => {
      rulesWithSameTrigger.forEach((rule) => {
        rule.effects.forEach((effect) => {
          // Skip effects that use variables as their value source
          if (effect.params.value_source === "variable") {
            return;
          }

          const configVarName = globalEffectVariableMapping[effect.id];
          if (configVarName && !processedVarNames.has(configVarName)) {
            vars.push(`card.ability.extra.${configVarName}`);
            processedVarNames.add(configVarName);
          }
        });
      });
    });
  }

  return `loc_vars = function(self, info_queue, card)
        return {vars = {${vars.join(", ")}}}
    end`;
};
