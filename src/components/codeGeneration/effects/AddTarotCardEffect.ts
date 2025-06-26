import type { EffectReturn } from "./AddChipsEffect";
import type { Effect } from "../../ruleBuilder/types";

const TAROT_CARD_KEYS: Record<string, string> = {
  the_fool: "c_fool",
  the_magician: "c_magician",
  the_high_priestess: "c_high_priestess",
  the_empress: "c_empress",
  the_emperor: "c_emperor",
  the_hierophant: "c_hierophant",
  the_lovers: "c_lovers",
  the_chariot: "c_chariot",
  justice: "c_justice",
  the_hermit: "c_hermit",
  the_wheel_of_fortune: "c_wheel_of_fortune",
  strength: "c_strength",
  the_hanged_man: "c_hanged_man",
  death: "c_death",
  temperance: "c_temperance",
  the_devil: "c_devil",
  the_tower: "c_tower",
  the_star: "c_star",
  the_moon: "c_moon",
  the_sun: "c_sun",
  judgement: "c_judgement",
  the_world: "c_world",
};

export const generateAddTarotCardReturn = (
  effect: Effect,
  triggerType: string
): EffectReturn => {
  const tarotCard = (effect.params?.tarot_card as string) || "random";
  const isNegative = (effect.params?.is_negative as string) === "negative";
  const customMessage = effect.customMessage;

  const scoringTriggers = ["hand_played", "card_scored"];
  const isScoring = scoringTriggers.includes(triggerType);

  let tarotCreationCode = "";
  let tarotKey = "";

  if (tarotCard === "random") {
    tarotKey = "nil, nil, nil, nil, nil, nil, 'joker_forge_tarot'";
  } else {
    const specificKey = TAROT_CARD_KEYS[tarotCard] || "c_fool";
    tarotKey = `nil, nil, nil, nil, nil, '${specificKey}'`;
  }

  if (isNegative) {
    tarotCreationCode = `local created_tarot = true
                G.E_MANAGER:add_event(Event({
                    func = function()
                        local tarot_card = create_card('Tarot', G.consumeables, ${tarotKey})
                        tarot_card:set_edition("e_negative", true)
                        tarot_card:add_to_deck()
                        G.consumeables:emplace(tarot_card)
                        return true
                    end
                }))`;
  } else {
    tarotCreationCode = `local created_tarot = false
                if #G.consumeables.cards + G.GAME.consumeable_buffer < G.consumeables.config.card_limit then
                    created_tarot = true
                    G.GAME.consumeable_buffer = G.GAME.consumeable_buffer + 1
                    G.E_MANAGER:add_event(Event({
                        func = function()
                            local tarot_card = create_card('Tarot', G.consumeables, ${tarotKey})
                            tarot_card:add_to_deck()
                            G.consumeables:emplace(tarot_card)
                            G.GAME.consumeable_buffer = 0
                            return true
                        end
                    }))
                end`;
  }

  if (isScoring) {
    return {
      statement: `__PRE_RETURN_CODE__${tarotCreationCode}
                __PRE_RETURN_CODE_END__`,
      message: customMessage
        ? `"${customMessage}"`
        : `created_tarot and localize('k_plus_tarot') or nil`,
      colour: "G.C.PURPLE",
    };
  } else {
    return {
      statement: `func = function()${tarotCreationCode}
                    if created_tarot then
                        card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${
                          customMessage
                            ? `"${customMessage}"`
                            : `localize('k_plus_tarot')`
                        }, colour = G.C.PURPLE})
                    end
                    return true
                end`,
      colour: "G.C.PURPLE",
    };
  }
};
