import type { Rule, Effect } from "../ruleBuilder/types";
import type { JokerData, UserVariable } from "../JokerCard";
import { parseGameVariable } from "./gameVariableUtils";
import { getGameVariableById } from "../data/GameVars";
import {
  SUIT_VALUES,
  RANK_VALUES,
  RANK_LABELS,
  ENHANCEMENT_VALUES,
  EDITION_VALUES,
  SEAL_VALUES,
} from "../data/BalatroUtils";

export interface VariableInfo {
  name: string;
  initialValue: number;
  usedInEffects: string[];
}

export interface VariableUsage {
  variableName: string;
  ruleId: string;
  ruleIndex: number;
  type: "condition" | "effect";
  itemId: string;
  count: number;
}

export interface GameVariableInfo {
  id: string;
  name: string;
  description: string;
  multiplier: number;
  startsFrom: number;
  code: string;
}

export interface SuitVariableInfo {
  isSuitVariable: boolean;
  variableName?: string;
  code?: string;
}

export interface RankVariableInfo {
  isRankVariable: boolean;
  variableName?: string;
  code?: string;
}

export interface PokerHandVariableInfo {
  isPokerHandVariable: boolean;
  variableName?: string;
  code?: string;
}

export const coordinateVariableConflicts = (
  effects: Effect[]
): {
  preReturnCode?: string;
  modifiedEffects: Effect[];
} => {
  const variableOperations: Array<{
    varName: string;
    type: "read" | "write";
    effectIndex: number;
    effect: Effect;
  }> = [];

  effects.forEach((effect, index) => {
    if (effect.type === "modify_internal_variable") {
      const varName = effect.params.variable_name as string;
      if (varName) {
        variableOperations.push({
          varName,
          type: "write",
          effectIndex: index,
          effect,
        });
      }
    }

    const explicitVariables = extractExplicitVariablesFromEffect(effect);
    explicitVariables.forEach((varName) => {
      variableOperations.push({
        varName,
        type: "read",
        effectIndex: index,
        effect,
      });
    });
  });

  const varGroups = variableOperations.reduce((acc, op) => {
    if (!acc[op.varName]) {
      acc[op.varName] = [];
    }
    acc[op.varName].push(op);
    return acc;
  }, {} as Record<string, typeof variableOperations>);

  const conflictedVars: string[] = [];

  Object.entries(varGroups).forEach(([varName, operations]) => {
    const reads = operations.filter((op) => op.type === "read");
    const writes = operations.filter((op) => op.type === "write");

    if (reads.length === 0 || writes.length === 0) {
      return;
    }

    for (const read of reads) {
      for (const write of writes) {
        if (read.effectIndex < write.effectIndex) {
          conflictedVars.push(varName);
          return;
        }
      }
    }
  });

  if (conflictedVars.length === 0) {
    return { modifiedEffects: effects };
  }

  const preReturnCode = conflictedVars
    .map((varName) => `local ${varName}_value = card.ability.extra.${varName}`)
    .join("\n                ");

  const modifiedEffects = effects.map((effect) => {
    if (effect.type === "modify_internal_variable") {
      return effect;
    }

    const modifiedParams = { ...effect.params };
    const explicitVariables = extractExplicitVariablesFromEffect(effect);

    explicitVariables.forEach((varName) => {
      if (conflictedVars.includes(varName)) {
        Object.entries(effect.params).forEach(([key, value]) => {
          if (value === varName) {
            modifiedParams[key] = `${varName}_value`;
          }
        });
      }
    });

    return { ...effect, params: modifiedParams };
  });

  return { preReturnCode, modifiedEffects };
};

const extractExplicitVariablesFromEffect = (effect: Effect): string[] => {
  const variables: string[] = [];

  Object.entries(effect.params).forEach(([, value]) => {
    if (typeof value === "string" && isUserDefinedVariable(value)) {
      variables.push(value);
    }
  });

  return variables;
};

export const extractGameVariablesFromRules = (
  rules: Rule[]
): GameVariableInfo[] => {
  const gameVariableMap = new Map<string, GameVariableInfo>();

  const processParams = (params: Record<string, unknown>) => {
    Object.values(params).forEach((value) => {
      const parsed = parseGameVariable(value);
      if (parsed.isGameVariable && parsed.gameVariableId && parsed.code) {
        const gameVar = getGameVariableById(parsed.gameVariableId);
        if (gameVar && !gameVariableMap.has(parsed.gameVariableId)) {
          gameVariableMap.set(parsed.gameVariableId, {
            id: parsed.gameVariableId,
            name: gameVar.label,
            description: gameVar.description,
            multiplier: parsed.multiplier || 1,
            startsFrom: parsed.startsFrom || 0,
            code: parsed.code,
          });
        }
      }
    });
  };

  rules.forEach((rule) => {
    rule.conditionGroups.forEach((group) => {
      group.conditions.forEach((condition) => {
        processParams(condition.params);
      });
    });

    (rule.effects || []).forEach((effect) => {
      processParams(effect.params);
    });

    (rule.randomGroups || []).forEach((group) => {
      group.effects.forEach((effect) => {
        processParams(effect.params);
      });
    });
  });

  return Array.from(gameVariableMap.values());
};

export const getSuitVariables = (joker: JokerData): UserVariable[] => {
  return (joker.userVariables || []).filter((v) => v.type === "suit");
};

export const getRankVariables = (joker: JokerData): UserVariable[] => {
  return (joker.userVariables || []).filter((v) => v.type === "rank");
};

export const parseSuitVariable = (
  value: unknown,
  joker?: JokerData
): SuitVariableInfo => {
  if (typeof value === "string" && joker?.userVariables) {
    const suitVariable = joker.userVariables.find(
      (v) => v.name === value && v.type === "suit"
    );

    if (suitVariable) {
      return {
        isSuitVariable: true,
        variableName: value,
        code: `G.GAME.current_round.${value}_card.suit`,
      };
    }
  }

  return {
    isSuitVariable: false,
  };
};

export const parseRankVariable = (
  value: unknown,
  joker?: JokerData
): RankVariableInfo => {
  if (typeof value === "string" && joker?.userVariables) {
    const rankVariable = joker.userVariables.find(
      (v) => v.name === value && v.type === "rank"
    );

    if (rankVariable) {
      return {
        isRankVariable: true,
        variableName: value,
        code: `G.GAME.current_round.${value}_card.id`,
      };
    }
  }

  return {
    isRankVariable: false,
  };
};

export const addSuitVariablesToOptions = (
  baseOptions: Array<{ value: string; label: string }>,
  joker: JokerData
): Array<{ value: string; label: string }> => {
  const suitVariables = getSuitVariables(joker);
  const variableOptions = suitVariables.map((variable) => ({
    value: variable.name,
    label: `${variable.name} (suit variable)`,
  }));

  return [...baseOptions, ...variableOptions];
};

export const addRankVariablesToOptions = (
  baseOptions: Array<{ value: string; label: string }>,
  joker: JokerData
): Array<{ value: string; label: string }> => {
  const rankVariables = getRankVariables(joker);
  const variableOptions = rankVariables.map((variable) => ({
    value: variable.name,
    label: `${variable.name} (rank variable)`,
  }));

  return [...baseOptions, ...variableOptions];
};

const isUserDefinedVariable = (str: string): boolean => {
  return (
    /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(str) &&
    !isReservedKeyword(str) &&
    !isBuiltInValue(str)
  );
};

export const getPokerHandVariables = (joker: JokerData): UserVariable[] => {
  return (joker.userVariables || []).filter((v) => v.type === "pokerhand");
};

export const parsePokerHandVariable = (
  value: unknown,
  joker?: JokerData
): PokerHandVariableInfo => {
  if (typeof value === "string" && joker?.userVariables) {
    const pokerHandVariable = joker.userVariables.find(
      (v) => v.name === value && v.type === "pokerhand"
    );

    if (pokerHandVariable) {
      return {
        isPokerHandVariable: true,
        variableName: value,
        code: `G.GAME.current_round.${value}_hand`,
      };
    }
  }

  return {
    isPokerHandVariable: false,
  };
};

export const addPokerHandVariablesToOptions = (
  baseOptions: Array<{ value: string; label: string }>,
  joker: JokerData
): Array<{ value: string; label: string }> => {
  const pokerHandVariables = getPokerHandVariables(joker);
  const variableOptions = pokerHandVariables.map((variable) => ({
    value: variable.name,
    label: `${variable.name} (poker hand variable)`,
  }));

  return [...baseOptions, ...variableOptions];
};

const isReservedKeyword = (str: string): boolean => {
  const reserved = new Set([
    "true",
    "false",
    "nil",
    "and",
    "or",
    "not",
    "if",
    "then",
    "else",
    "end",
    "function",
    "return",
    "local",
    "for",
    "while",
    "repeat",
    "until",
    "break",
    "do",
    "in",
    "self",
    "card",
    "context",
    "G",
    "SMODS",
  ]);
  return reserved.has(str);
};

const isBuiltInValue = (str: string): boolean => {
  const suitValues = new Set(SUIT_VALUES);
  const rankValues = new Set([...RANK_VALUES, ...RANK_LABELS]);
  const enhancementValues = new Set(ENHANCEMENT_VALUES);
  const editionValues = new Set(EDITION_VALUES);
  const sealValues = new Set(SEAL_VALUES);

  type SuitType = (typeof SUIT_VALUES)[number];
  type RankType = (typeof RANK_VALUES)[number] | (typeof RANK_LABELS)[number];
  type EnhancementType = (typeof ENHANCEMENT_VALUES)[number];
  type EditionType = (typeof EDITION_VALUES)[number];
  type SealType = (typeof SEAL_VALUES)[number];

  if (
    suitValues.has(str as SuitType) ||
    rankValues.has(str as RankType) ||
    enhancementValues.has(str as EnhancementType) ||
    editionValues.has(str as EditionType) ||
    sealValues.has(str as SealType)
  ) {
    return true;
  }

  const otherBuiltIns = new Set([
    "random",
    "none",
    "any",
    "all",
    "specific",
    "group",
    "equals",
    "not_equals",
    "greater_than",
    "less_than",
    "greater_equals",
    "less_equals",
    "contains",
    "scoring",
    "all_played",
    "face",
    "even",
    "odd",
    "red",
    "black",
    "current",
    "add",
    "subtract",
    "set",
    "increment",
    "decrement",
    "multiply",
    "divide",
    "small",
    "big",
    "boss",
    "remaining",
    "total",
    "rank",
    "suit",
    "enhancement",
    "seal",
    "edition",
    "first",
    "last",
    "left",
    "right",
    "position",
    "tarot",
    "planet",
    "spectral",
    "negative",
    "common",
    "uncommon",
    "rare",
    "legendary",
    "remove",
    "Gold",
    "Red",
    "Blue",
    "Purple",
    "T",
  ]);

  return otherBuiltIns.has(str);
};

export const extractVariablesFromRules = (rules: Rule[]): VariableInfo[] => {
  const variableMap = new Map<string, VariableInfo>();

  rules.forEach((rule) => {
    rule.conditionGroups.forEach((group) => {
      group.conditions.forEach((condition) => {
        if (condition.type === "internal_variable") {
          const varName = (condition.params.variable_name as string) || "var1";
          if (!variableMap.has(varName)) {
            variableMap.set(varName, {
              name: varName,
              initialValue: 0,
              usedInEffects: [],
            });
          }
        }
      });
    });

    (rule.effects || []).forEach((effect) => {
      if (effect.type === "modify_internal_variable") {
        const varName = (effect.params.variable_name as string) || "var1";
        if (!variableMap.has(varName)) {
          variableMap.set(varName, {
            name: varName,
            initialValue: 0,
            usedInEffects: [],
          });
        }
        variableMap.get(varName)!.usedInEffects.push(effect.type);
      }

      const explicitVariables = extractExplicitVariablesFromEffect(effect);
      explicitVariables.forEach((varName) => {
        if (!variableMap.has(varName)) {
          variableMap.set(varName, {
            name: varName,
            initialValue: 0,
            usedInEffects: [],
          });
        }
        variableMap.get(varName)!.usedInEffects.push(effect.type);
      });
    });

    (rule.randomGroups || []).forEach((group) => {
      group.effects.forEach((effect) => {
        if (effect.type === "modify_internal_variable") {
          const varName = (effect.params.variable_name as string) || "var1";
          if (!variableMap.has(varName)) {
            variableMap.set(varName, {
              name: varName,
              initialValue: 0,
              usedInEffects: [],
            });
          }
          variableMap.get(varName)!.usedInEffects.push(effect.type);
        }

        const explicitVariables = extractExplicitVariablesFromEffect(effect);
        explicitVariables.forEach((varName) => {
          if (!variableMap.has(varName)) {
            variableMap.set(varName, {
              name: varName,
              initialValue: 0,
              usedInEffects: [],
            });
          }
          variableMap.get(varName)!.usedInEffects.push(effect.type);
        });
      });
    });
  });

  return Array.from(variableMap.values());
};

export const generateVariableConfig = (variables: VariableInfo[]): string => {
  if (variables.length === 0) return "";

  const configItems = variables.map((variable) => {
    return `${variable.name} = ${variable.initialValue}`;
  });

  return configItems.join(",\n            ");
};

export const getVariableNamesFromJoker = (joker: JokerData): string[] => {
  if (!joker.rules) return [];

  const variableNames = new Set<string>();

  joker.rules.forEach((rule) => {
    (rule.effects || []).forEach((effect) => {
      if (effect.type === "modify_internal_variable") {
        const varName = (effect.params.variable_name as string) || "var1";
        variableNames.add(varName);
      }

      const explicitVariables = extractExplicitVariablesFromEffect(effect);
      explicitVariables.forEach((varName) => {
        variableNames.add(varName);
      });
    });

    (rule.randomGroups || []).forEach((group) => {
      group.effects.forEach((effect) => {
        if (effect.type === "modify_internal_variable") {
          const varName = (effect.params.variable_name as string) || "var1";
          variableNames.add(varName);
        }

        const explicitVariables = extractExplicitVariablesFromEffect(effect);
        explicitVariables.forEach((varName) => {
          variableNames.add(varName);
        });
      });
    });

    rule.conditionGroups.forEach((group) => {
      group.conditions.forEach((condition) => {
        if (condition.type === "internal_variable") {
          const varName = (condition.params.variable_name as string) || "var1";
          variableNames.add(varName);
        }
      });
    });
  });

  return Array.from(variableNames).sort();
};

export const getVariableUsageDetails = (joker: JokerData): VariableUsage[] => {
  if (!joker.rules) return [];

  const usageDetails: VariableUsage[] = [];
  const usageCount = new Map<string, number>();

  joker.rules.forEach((rule, ruleIndex) => {
    (rule.effects || []).forEach((effect) => {
      if (effect.type === "modify_internal_variable") {
        const varName = (effect.params.variable_name as string) || "var1";
        const currentCount = usageCount.get(varName) || 0;
        usageCount.set(varName, currentCount + 1);

        usageDetails.push({
          variableName: varName,
          ruleId: rule.id,
          ruleIndex: ruleIndex + 1,
          type: "effect",
          itemId: effect.id,
          count: currentCount + 1,
        });
      }

      const explicitVariables = extractExplicitVariablesFromEffect(effect);
      explicitVariables.forEach((varName) => {
        const currentCount = usageCount.get(varName) || 0;
        usageCount.set(varName, currentCount + 1);

        usageDetails.push({
          variableName: varName,
          ruleId: rule.id,
          ruleIndex: ruleIndex + 1,
          type: "effect",
          itemId: effect.id,
          count: currentCount + 1,
        });
      });
    });

    (rule.randomGroups || []).forEach((group) => {
      group.effects.forEach((effect) => {
        if (effect.type === "modify_internal_variable") {
          const varName = (effect.params.variable_name as string) || "var1";
          const currentCount = usageCount.get(varName) || 0;
          usageCount.set(varName, currentCount + 1);

          usageDetails.push({
            variableName: varName,
            ruleId: rule.id,
            ruleIndex: ruleIndex + 1,
            type: "effect",
            itemId: effect.id,
            count: currentCount + 1,
          });
        }

        const explicitVariables = extractExplicitVariablesFromEffect(effect);
        explicitVariables.forEach((varName) => {
          const currentCount = usageCount.get(varName) || 0;
          usageCount.set(varName, currentCount + 1);

          usageDetails.push({
            variableName: varName,
            ruleId: rule.id,
            ruleIndex: ruleIndex + 1,
            type: "effect",
            itemId: effect.id,
            count: currentCount + 1,
          });
        });
      });
    });

    rule.conditionGroups.forEach((group) => {
      group.conditions.forEach((condition) => {
        if (condition.type === "internal_variable") {
          const varName = (condition.params.variable_name as string) || "var1";
          const currentCount = usageCount.get(varName) || 0;
          usageCount.set(varName, currentCount + 1);

          usageDetails.push({
            variableName: varName,
            ruleId: rule.id,
            ruleIndex: ruleIndex + 1,
            type: "condition",
            itemId: condition.id,
            count: currentCount + 1,
          });
        }
      });
    });
  });

  return usageDetails;
};

export const getAllVariables = (joker: JokerData): UserVariable[] => {
  const userVars = joker.userVariables || [];
  const autoVars: UserVariable[] = [];

  const nonPassiveRules =
    joker.rules?.filter((rule) => rule.trigger !== "passive") || [];

  const hasRandomGroups = nonPassiveRules.some(
    (rule) => rule.randomGroups && rule.randomGroups.length > 0
  );

  if (hasRandomGroups) {
    const randomGroups = nonPassiveRules.flatMap(
      (rule) => rule.randomGroups || []
    );
    const numerators = [
      ...new Set(randomGroups.map((group) => group.chance_numerator)),
    ];
    const denominators = [
      ...new Set(randomGroups.map((group) => group.chance_denominator)),
    ];

    if (numerators.length === 1) {
      autoVars.push({
        id: "auto_numerator",
        name: "numerator",
        initialValue: Number(numerators[0]),
        description: `Chance numerator (e.g., ${numerators[0]} in '${numerators[0]} in X')`,
      });
    } else {
      numerators.forEach((num, index) => {
        if (index === 0) {
          autoVars.push({
            id: "auto_numerator",
            name: "numerator",
            initialValue: Number(num),
            description: `First chance numerator (e.g., ${num} in '${num} in X')`,
          });
        } else {
          autoVars.push({
            id: `auto_numerator_${index + 1}`,
            name: `numerator${index + 1}`,
            initialValue: Number(num),
            description: `${index + 1}${getOrdinalSuffix(
              index + 1
            )} chance numerator (e.g., ${num} in '${num} in X')`,
          });
        }
      });
    }

    if (denominators.length === 1) {
      autoVars.push({
        id: "auto_denominator",
        name: "denominator",
        initialValue: Number(denominators[0]),
        description: `Chance denominator (e.g., ${denominators[0]} in 'X in ${denominators[0]}')`,
      });
    } else {
      denominators.forEach((denom, index) => {
        if (index === 0) {
          autoVars.push({
            id: "auto_denominator",
            name: "denominator",
            initialValue: Number(denom),
            description: `First chance denominator (e.g., ${denom} in 'X in ${denom}')`,
          });
        } else {
          autoVars.push({
            id: `auto_denominator_${index + 1}`,
            name: `denominator${index + 1}`,
            initialValue: Number(denom),
            description: `${index + 1}${getOrdinalSuffix(
              index + 1
            )} chance denominator (e.g., ${denom} in 'X in ${denom}')`,
          });
        }
      });
    }
  }

  const explicitVariableNames = getVariableNamesFromJoker(joker)
    .filter((name) => !userVars.some((uv) => uv.name === name))
    .filter(
      (name) => !name.startsWith("denominator") && !name.startsWith("numerator")
    );

  const otherAutoVars = explicitVariableNames.map((name) => ({
    id: `auto_${name}`,
    name,
    initialValue: getDefaultVariableValue(name),
    description: getDefaultVariableDescription(name),
  }));

  const gameVariables = extractGameVariablesFromRules(joker.rules || []);
  const gameVarAutoVars = gameVariables.map((gameVar) => ({
    id: `auto_gamevar_${gameVar.id}`,
    name: gameVar.name.replace(/\s+/g, "").toLowerCase(),
    initialValue: gameVar.startsFrom,
    description: `${gameVar.description}${
      gameVar.multiplier !== 1 ? ` (×${gameVar.multiplier})` : ""
    }${gameVar.startsFrom !== 0 ? ` (starts from ${gameVar.startsFrom})` : ""}`,
  }));

  return [...userVars, ...autoVars, ...otherAutoVars, ...gameVarAutoVars];
};

const getOrdinalSuffix = (num: number): string => {
  if (num === 2) return "nd";
  if (num === 3) return "rd";
  return "th";
};

const getDefaultVariableValue = (name: string): number => {
  const defaults: Record<string, number> = {
    chips: 10,
    mult: 5,
    Xmult: 1.5,
    xchips: 1.5,
    dollars: 5,
    repetitions: 1,
    hands: 1,
    discards: 1,
    levels: 1,
    ante_value: 1,
  };
  return defaults[name] || 0;
};

const getDefaultVariableDescription = (name: string): string => {
  const descriptions: Record<string, string> = {
    chips: "Chips to add",
    mult: "Mult to add",
    Xmult: "X Mult multiplier",
    xchips: "X Chips multiplier",
    dollars: "Money to add",
    repetitions: "Card repetitions",
    hands: "Hands to modify",
    discards: "Discards to modify",
    levels: "Hand levels to add",
    ante_value: "Ante level value",
  };
  return descriptions[name] || "Custom variable";
};
