import type { EffectReturn } from "./AddChipsEffect";

export const generateApplyXMultReturn = (triggerType: string): EffectReturn => {
  if (triggerType === "card_scored" || triggerType === "card_discarded") {
    // For card_scored and card_discarded, SMODS adds message automatically
    return {
      statement: `Xmult = card.ability.extra.Xmult`,
      colour: "G.C.XMULT",
    };
  } else {
    return {
      statement: `Xmult_mod = card.ability.extra.Xmult`,
      message: `localize{type='variable',key='a_xmult',vars={card.ability.extra.Xmult}}`,
      colour: "G.C.XMULT",
    };
  }
};
