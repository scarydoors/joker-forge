import type { Rule } from "../ruleBuilder/types";

interface TriggerContext {
  check: string;
  comment: string;
}

export const generateTriggerContext = (
  triggerType: string,
  rules: Rule[]
): TriggerContext => {
  const hasRetriggerEffects = rules.some((rule) =>
    rule.effects.some((effect) => effect.type === "retrigger_cards")
  );

  switch (triggerType) {
    case "card_scored":
      if (hasRetriggerEffects) {
        return {
          check: "context.repetition and context.cardarea == G.play",
          comment: "-- Card repetition context for retriggering",
        };
      } else {
        return {
          check:
            "context.individual and context.cardarea == G.play and not context.blueprint",
          comment: "-- Individual card scoring",
        };
      }

    case "card_held_in_hand":
      if (hasRetriggerEffects) {
        return {
          check:
            "context.repetition and context.cardarea == G.hand and (next(context.card_effects[1]) or #context.card_effects > 1)",
          comment: "-- Card repetition context for held cards",
        };
      } else {
        return {
          check:
            "context.individual and context.cardarea == G.hand and not context.end_of_round and not context.blueprint",
          comment: "-- Individual card held in hand",
        };
      }

    case "blind_selected":
      return {
        check: "context.setting_blind and not context.blueprint",
        comment: "-- When blind is selected",
      };

    case "blind_skipped":
      return {
        check: "context.skip_blind and not context.blueprint",
        comment: "-- When blind is skipped",
      };

    case "boss_defeated":
      return {
        check:
          "context.end_of_round and context.main_eval and G.GAME.blind.boss and not context.blueprint",
        comment: "-- After boss blind is defeated",
      };

    case "booster_opened":
      return {
        check: "context.open_booster and not context.blueprint",
        comment: "-- When booster pack is opened",
      };

    case "booster_skipped":
      return {
        check: "context.skipping_booster and not context.blueprint",
        comment: "-- When booster pack is skipped",
      };

    case "consumable_used":
      return {
        check: "context.using_consumeable and not context.blueprint",
        comment: "-- When consumable is used",
      };

    case "hand_drawn":
      return {
        check: "context.hand_drawn and not context.blueprint",
        comment: "-- When hand is drawn",
      };

    case "first_hand_drawn":
      return {
        check: "context.first_hand_drawn and not context.blueprint",
        comment: "-- When first hand is drawn",
      };

    case "shop_exited":
      return {
        check: "context.ending_shop and not context.blueprint",
        comment: "-- When exiting shop",
      };

    case "shop_reroll":
      return {
        check: "context.reroll_shop and not context.blueprint",
        comment: "-- When shop is rerolled",
      };

    case "round_end":
      return {
        check:
          "context.end_of_round and context.game_over == false and context.main_eval and not context.blueprint",
        comment: "-- At the end of the round",
      };

    case "card_discarded":
      return {
        check: "context.discard and not context.blueprint",
        comment: "-- When card is discarded",
      };

    case "hand_discarded":
      return {
        check: "context.pre_discard and not context.blueprint",
        comment: "-- When hand is discarded",
      };

    case "after_hand_played":
      return {
        check: "context.after and context.cardarea == G.jokers",
        comment: "-- After hand has finished scoring",
      };

    case "card_sold":
      return {
        check: "context.selling_card and not context.blueprint",
        comment: "-- When any card is sold",
      };

    case "card_bought":
      return {
        check: "context.buying_card and not context.blueprint",
        comment: "-- When any card is bought",
      };

    case "selling_self":
      return {
        check: "context.selling_self and not context.blueprint",
        comment: "-- When this specific joker is sold",
      };

    case "hand_played":
    default:
      return {
        check: "context.cardarea == G.jokers and context.joker_main",
        comment: "-- Main scoring time for jokers",
      };
  }
};
