import type { EffectReturn } from "./AddChipsEffect";

export const generateAddMultReturn = (triggerType: string): EffectReturn => {
  if (triggerType === "card_scored") {
    // For card_scored, SMODS adds message automatically
    return {
      statement: `mult = card.ability.extra.mult`,
      colour: "G.C.MULT",
    };
  } else {
    return {
      statement: `mult_mod = card.ability.extra.mult`,
      message: `localize{type='variable',key='a_mult',vars={card.ability.extra.mult}}`,
      colour: "G.C.MULT",
    };
  }
};
