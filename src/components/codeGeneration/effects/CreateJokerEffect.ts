import type { EffectReturn } from "./AddChipsEffect";
import type { Effect } from "../../ruleBuilder/types";

export const generateCreateJokerReturn = (
  effect: Effect,
  triggerType: string
): EffectReturn => {
  const jokerType = (effect.params?.joker_type as string) || "random";
  const rarity = (effect.params?.rarity as string) || "random";
  const jokerKey = (effect.params?.joker_key as string) || "";
  const edition = (effect.params?.edition as string) || "none";
  const customMessage = effect.customMessage;

  const scoringTriggers = ["hand_played", "card_scored"];
  const isScoring = scoringTriggers.includes(triggerType);

  const isNegative = edition === "e_negative";
  const hasEdition = edition !== "none";

  let jokerCreationCode = "";

  if (jokerType === "specific" && jokerKey) {
    const editionCode = hasEdition
      ? `\n                        joker_card:set_edition("${edition}", true)`
      : "";

    if (isNegative) {
      jokerCreationCode = `local created_joker = true
                G.E_MANAGER:add_event(Event({
                    func = function()
                        local joker_card = create_card('Joker', G.jokers, nil, nil, nil, nil, '${jokerKey}')${editionCode}
                        joker_card:add_to_deck()
                        G.jokers:emplace(joker_card)
                        return true
                    end
                }))`;
    } else {
      jokerCreationCode = `local created_joker = false
                if #G.jokers.cards + G.GAME.joker_buffer < G.jokers.config.card_limit then
                    created_joker = true
                    G.GAME.joker_buffer = G.GAME.joker_buffer + 1
                    G.E_MANAGER:add_event(Event({
                        func = function()
                            local joker_card = create_card('Joker', G.jokers, nil, nil, nil, nil, '${jokerKey}')${editionCode}
                            joker_card:add_to_deck()
                            G.jokers:emplace(joker_card)
                            G.GAME.joker_buffer = 0
                            return true
                        end
                    }))
                end`;
    }
  } else {
    // Random joker creation
    let rarityNumber = "nil";
    if (rarity !== "random") {
      const rarityNumberMap: Record<string, string> = {
        common: "1",
        uncommon: "2",
        rare: "3",
        legendary: "4",
      };
      rarityNumber = rarityNumberMap[rarity] || "nil";
    }

    if (isNegative) {
      jokerCreationCode = `local created_joker = true
                G.E_MANAGER:add_event(Event({
                    func = function()
                        local joker_card = create_card('Joker', G.jokers, nil, ${rarityNumber}, nil, nil, nil, 'joker_forge_random')
                        joker_card:set_edition("e_negative", true)
                        joker_card:add_to_deck()
                        G.jokers:emplace(joker_card)
                        return true
                    end
                }))`;
    } else {
      const editionCode = hasEdition
        ? `\n                            joker_card:set_edition("${edition}", true)`
        : "";

      if (hasEdition) {
        jokerCreationCode = `local created_joker = false
                if #G.jokers.cards + G.GAME.joker_buffer < G.jokers.config.card_limit then
                    created_joker = true
                    G.GAME.joker_buffer = G.GAME.joker_buffer + 1
                    G.E_MANAGER:add_event(Event({
                        func = function()
                            local joker_card = create_card('Joker', G.jokers, nil, ${rarityNumber}, nil, nil, nil, 'joker_forge_random')${editionCode}
                            joker_card:add_to_deck()
                            G.jokers:emplace(joker_card)
                            G.GAME.joker_buffer = 0
                            return true
                        end
                    }))
                end`;
      } else {
        jokerCreationCode = `local created_joker = false
                if #G.jokers.cards + G.GAME.joker_buffer < G.jokers.config.card_limit then
                    created_joker = true
                    G.GAME.joker_buffer = G.GAME.joker_buffer + 1
                    G.E_MANAGER:add_event(Event({
                        func = function()
                            SMODS.add_card {
                                set = 'Joker',
                                key_append = 'joker_forge_random'
                            }
                            G.GAME.joker_buffer = 0
                            return true
                        end
                    }))
                end`;
      }
    }
  }

  if (isScoring) {
    return {
      statement: `__PRE_RETURN_CODE__${jokerCreationCode}
                __PRE_RETURN_CODE_END__`,
      message: customMessage
        ? `"${customMessage}"`
        : `created_joker and localize('k_plus_joker') or nil`,
      colour: "G.C.BLUE",
    };
  } else {
    return {
      statement: `func = function()
            ${jokerCreationCode}
            if created_joker then
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${
                  customMessage
                    ? `"${customMessage}"`
                    : `localize('k_plus_joker')`
                }, colour = G.C.BLUE})
            end
            return true
        end`,
      colour: "G.C.BLUE",
    };
  }
};
