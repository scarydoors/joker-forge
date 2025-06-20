import type { EffectReturn } from "./AddChipsEffect";

const EVAL_STATUS_TEXT_TRIGGERS = [
  "blind_selected",
  "blind_skipped",
  "boss_defeated",
  "booster_opened",
  "booster_skipped",
  "consumable_used",
  "hand_drawn",
  "first_hand_drawn",
  "shop_entered",
  "shop_exited",
  "card_discarded",
];

export const generateAddDollarsReturn = (triggerType: string): EffectReturn => {
  // For specific triggers, use card_eval_status_text pattern
  if (EVAL_STATUS_TEXT_TRIGGERS.includes(triggerType)) {
    return {
      statement: `func = function()
                    card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = "$"..tostring(card.ability.extra.dollars), colour = G.C.MONEY})
                    ease_dollars(card.ability.extra.dollars)
                    return true
                end`,
      colour: "G.C.MONEY",
    };
  } else {
    return {
      statement: `dollars = card.ability.extra.dollars`,
    };
  }
};
