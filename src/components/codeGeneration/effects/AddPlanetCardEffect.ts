import type { EffectReturn } from "./AddChipsEffect";
import type { Effect } from "../../ruleBuilder/types";

const PLANET_CARD_KEYS: Record<string, string> = {
  pluto: "c_pluto",
  mercury: "c_mercury",
  uranus: "c_uranus",
  venus: "c_venus",
  saturn: "c_saturn",
  jupiter: "c_jupiter",
  earth: "c_earth",
  mars: "c_mars",
  neptune: "c_neptune",
  planet_x: "c_planet_x",
  ceres: "c_ceres",
  eris: "c_eris",
};

export const generateAddPlanetCardReturn = (
  effect: Effect,
  triggerType: string
): EffectReturn => {
  const planetCard = (effect.params?.planet_card as string) || "random";
  const isNegative = (effect.params?.is_negative as string) === "negative";
  const customMessage = effect.customMessage;

  const scoringTriggers = ["hand_played", "card_scored"];
  const isScoring = scoringTriggers.includes(triggerType);

  let planetCreationCode = "";

  if (planetCard === "random") {
    if (isNegative) {
      planetCreationCode = `local created_planet = true
                G.E_MANAGER:add_event(Event({
                    func = function()
                        local planet_card = create_card('Planet', G.consumeables, nil, nil, nil, nil, nil, 'joker_forge_planet')
                        planet_card:set_edition("e_negative", true)
                        planet_card:add_to_deck()
                        G.consumeables:emplace(planet_card)
                        return true
                    end
                }))`;
    } else {
      planetCreationCode = `local created_planet = false
                if #G.consumeables.cards + G.GAME.consumeable_buffer < G.consumeables.config.card_limit then
                    created_planet = true
                    G.GAME.consumeable_buffer = G.GAME.consumeable_buffer + 1
                    G.E_MANAGER:add_event(Event({
                        func = function()
                            SMODS.add_card {
                                set = 'Planet',
                                key_append = 'joker_forge_planet'
                            }
                            G.GAME.consumeable_buffer = 0
                            return true
                        end
                    }))
                end`;
    }
  } else {
    const planetKey = PLANET_CARD_KEYS[planetCard] || "c_pluto";

    if (isNegative) {
      planetCreationCode = `local created_planet = true
                G.E_MANAGER:add_event(Event({
                    func = function()
                        local planet_card = create_card('Planet', G.consumeables, nil, nil, nil, nil, '${planetKey}')
                        planet_card:set_edition("e_negative", true)
                        planet_card:add_to_deck()
                        G.consumeables:emplace(planet_card)
                        return true
                    end
                }))`;
    } else {
      planetCreationCode = `local created_planet = false
                if #G.consumeables.cards + G.GAME.consumeable_buffer < G.consumeables.config.card_limit then
                    created_planet = true
                    G.GAME.consumeable_buffer = G.GAME.consumeable_buffer + 1
                    G.E_MANAGER:add_event(Event({
                        func = function()
                            local planet_card = create_card('Planet', G.consumeables, nil, nil, nil, nil, '${planetKey}')
                            planet_card:add_to_deck()
                            G.consumeables:emplace(planet_card)
                            G.GAME.consumeable_buffer = 0
                            return true
                        end
                    }))
                end`;
    }
  }

  if (isScoring) {
    return {
      statement: `__PRE_RETURN_CODE__${planetCreationCode}
                __PRE_RETURN_CODE_END__`,
      message: customMessage
        ? `"${customMessage}"`
        : `created_planet and localize('k_plus_planet') or nil`,
      colour: "G.C.SECONDARY_SET.Planet",
    };
  } else {
    return {
      statement: `func = function()${planetCreationCode}
                    if created_planet then
                        card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${
                          customMessage
                            ? `"${customMessage}"`
                            : `localize('k_plus_planet')`
                        }, colour = G.C.SECONDARY_SET.Planet})
                    end
                    return true
                end`,
      colour: "G.C.SECONDARY_SET.Planet",
    };
  }
};
