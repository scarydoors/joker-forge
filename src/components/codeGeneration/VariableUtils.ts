import type { Rule } from "../ruleBuilder/types";
import type { JokerData } from "../JokerCard";

export interface VariableInfo {
  name: string;
  initialValue: number;
  usedInEffects: string[];
}

// Extract all variables used in rules
export const extractVariablesFromRules = (rules: Rule[]): VariableInfo[] => {
  const variableMap = new Map<string, VariableInfo>();

  rules.forEach((rule) => {
    // Check conditions for variable usage
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

    // Check effects for variable usage
    rule.effects.forEach((effect) => {
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

      // Check if any effects use variables as value sources
      if (effect.params.value_source === "variable") {
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
    });
  });

  return Array.from(variableMap.values());
};

// Generate config.extra entries for variables
export const generateVariableConfig = (variables: VariableInfo[]): string => {
  if (variables.length === 0) return "";

  const configItems = variables.map((variable) => {
    return `${variable.name} = ${variable.initialValue}`;
  });

  return configItems.join(",\n            ");
};

// Generate loc_vars entries for variables
export const generateVariableLocVars = (
  variables: VariableInfo[]
): string[] => {
  return variables.map((variable) => `card.ability.extra.${variable.name}`);
};

// Get all variable names used in effects that support variable values
export const getVariableNamesFromJoker = (joker: JokerData): string[] => {
  if (!joker.rules) return [];

  const variableNames = new Set<string>();

  joker.rules.forEach((rule) => {
    rule.effects.forEach((effect) => {
      if (effect.type === "modify_internal_variable") {
        const varName = (effect.params.variable_name as string) || "var1";
        variableNames.add(varName);
      }

      if (effect.params.value_source === "variable") {
        const varName = (effect.params.variable_name as string) || "var1";
        variableNames.add(varName);
      }
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
