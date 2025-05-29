import type { EffectReturn } from "./AddChipsEffect";
import type { Effect } from "../../ruleBuilder/types";

// Mapping of planet card names to their Balatro keys COULD BE WRONG?
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

  // Define scoring triggers that need the pre-return code approach
  const scoringTriggers = ["hand_played", "card_scored"];
  const isScoring = scoringTriggers.includes(triggerType);

  // Generate the planet card creation code
  let planetCreationCode = "";

  if (planetCard === "random") {
    // Create a random planet card using SMODS.add_card
    planetCreationCode = `
            -- Create random planet card
            if #G.consumeables.cards + G.GAME.consumeable_buffer < G.consumeables.config.card_limit then
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
  } else {
    // Create a specific planet card
    const planetKey = PLANET_CARD_KEYS[planetCard] || "c_pluto";
    planetCreationCode = `
            -- Create specific planet card: ${planetCard}
            if #G.consumeables.cards + G.GAME.consumeable_buffer < G.consumeables.config.card_limit then
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

  if (isScoring) {
    // For scoring triggers, use pre-return code
    return {
      statement: `__PRE_RETURN_CODE__${planetCreationCode}
                __PRE_RETURN_CODE_END__`,
      message: `localize('k_plus_planet')`,
      colour: "G.C.SECONDARY_SET.Planet",
    };
  } else {
    // For non-scoring triggers, use func approach
    return {
      statement: `func = function()${planetCreationCode}
                    card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = localize('k_plus_planet'), colour = G.C.SECONDARY_SET.Planet})
                    return true
                end`,
      colour: "G.C.SECONDARY_SET.Planet",
    };
  }
};
