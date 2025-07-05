import { getGameVariableById } from "../ruleBuilder/data/GameVars";

export interface ParsedGameVariable {
  isGameVariable: boolean;
  gameVariableId?: string;
  multiplier?: number;
  startsFrom?: number;
  code?: string;
}

export const parseGameVariable = (value: unknown): ParsedGameVariable => {
  if (typeof value === "string" && value.startsWith("GAMEVAR:")) {
    const parts = value.replace("GAMEVAR:", "").split("|");
    const gameVariableId = parts[0];
    const multiplier = parseFloat(parts[1] || "1");
    const startsFrom = parseFloat(parts[2] || "0");
    const gameVariable = getGameVariableById(gameVariableId);

    return {
      isGameVariable: true,
      gameVariableId,
      multiplier,
      startsFrom,
      code: gameVariable?.code,
    };
  }

  return {
    isGameVariable: false,
  };
};

export const generateGameVariableCode = (
  value: unknown,
  fallbackVariableName?: string
): string => {
  const parsed = parseGameVariable(value);

  if (
    parsed.isGameVariable &&
    parsed.code &&
    parsed.multiplier !== undefined &&
    parsed.startsFrom !== undefined
  ) {
    const gameVariable = getGameVariableById(parsed.gameVariableId!);
    const configVarName = gameVariable?.label.replace(/\s+/g, "").toLowerCase();

    if (parsed.multiplier === 1 && parsed.startsFrom === 0) {
      return parsed.code;
    } else if (parsed.startsFrom === 0) {
      return `(${parsed.code}) * ${parsed.multiplier}`;
    } else if (parsed.multiplier === 1) {
      return `card.ability.extra.${configVarName} + (${parsed.code})`;
    } else {
      return `card.ability.extra.${configVarName} + (${parsed.code}) * ${parsed.multiplier}`;
    }
  }

  if (typeof value === "string" && fallbackVariableName) {
    return `card.ability.extra.${value}`;
  }

  if (fallbackVariableName) {
    return `card.ability.extra.${fallbackVariableName}`;
  }

  return typeof value === "number" ? value.toString() : "0";
};
