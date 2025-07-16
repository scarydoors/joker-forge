import type { Effect } from "../../../ruleBuilder/types";
import type { PassiveEffectResult } from "../effectUtils";

export const generatePassiveAllowDebt = (
  effect: Effect
): PassiveEffectResult => {
  const debtAmount = (effect.params?.debt_amount as number) || 20;

  const addToDeck = `G.GAME.bankrupt_at = G.GAME.bankrupt_at - ${debtAmount}`;
  const removeFromDeck = `G.GAME.bankrupt_at = G.GAME.bankrupt_at + ${debtAmount}`;

  return {
    addToDeck,
    removeFromDeck,
  };
};
