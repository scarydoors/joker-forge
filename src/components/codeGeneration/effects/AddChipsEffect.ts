export interface EffectReturn {
  statement: string;
  message?: string;
  colour: string;
}

export const generateAddChipsReturn = (triggerType: string): EffectReturn => {
  if (triggerType === "card_scored" || triggerType === "card_discarded") {
    // For card_scored, SMODS adds message automatically
    return {
      statement: `chips = card.ability.extra.chips`,
      colour: "G.C.CHIPS",
    };
  } else {
    return {
      statement: `chip_mod = card.ability.extra.chips`,
      message: `localize{type='variable',key='a_chips',vars={card.ability.extra.chips}}`,
      colour: "G.C.CHIPS",
    };
  }
};
