import type { PassiveEffectResult } from "../effectUtils";

export const generateDoubleProbabilityEffect = (): PassiveEffectResult => {
  const addToDeck = `for k, v in pairs(G.GAME.probabilities) do
        G.GAME.probabilities[k] = v * 2
    end`;

  const removeFromDeck = `for k, v in pairs(G.GAME.probabilities) do
        G.GAME.probabilities[k] = v / 2
    end`;

  return {
    addToDeck,
    removeFromDeck,
    configVariables: [],
    locVars: [],
  };
};
