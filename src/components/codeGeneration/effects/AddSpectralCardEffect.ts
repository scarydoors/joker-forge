import type { EffectReturn } from "./AddChipsEffect";
import type { Effect } from "../../ruleBuilder/types";

// Mapping of spectral card names to their Balatro keys MAY BE WRONG?
const SPECTRAL_CARD_KEYS: Record<string, string> = {
  familiar: "c_familiar",
  grim: "c_grim",
  incantation: "c_incantation",
  talisman: "c_talisman",
  aura: "c_aura",
  wraith: "c_wraith",
  sigil: "c_sigil",
  ouija: "c_ouija",
  ectoplasm: "c_ectoplasm",
  immolate: "c_immolate",
  ankh: "c_ankh",
  deja_vu: "c_deja_vu",
  hex: "c_hex",
  trance: "c_trance",
  medium: "c_medium",
  cryptid: "c_cryptid",
  the_soul: "c_soul",
  black_hole: "c_black_hole",
};

export const generateAddSpectralCardReturn = (
  effect: Effect,
  triggerType: string
): EffectReturn => {
  const spectralCard = (effect.params?.spectral_card as string) || "random";

  // Define scoring triggers that need the pre-return code approach
  const scoringTriggers = ["hand_played", "card_scored"];
  const isScoring = scoringTriggers.includes(triggerType);

  // Generate the spectral card creation code
  let spectralCreationCode = "";

  if (spectralCard === "random") {
    // Create a random spectral card using SMODS.add_card
    spectralCreationCode = `
            -- Create random spectral card
            if #G.consumeables.cards + G.GAME.consumeable_buffer < G.consumeables.config.card_limit then
                G.GAME.consumeable_buffer = G.GAME.consumeable_buffer + 1
                G.E_MANAGER:add_event(Event({
                    func = function()
                        SMODS.add_card {
                            set = 'Spectral',
                            key_append = 'joker_forge_spectral'
                        }
                        G.GAME.consumeable_buffer = 0
                        return true
                    end
                }))
            end`;
  } else {
    // Create a specific spectral card
    const spectralKey = SPECTRAL_CARD_KEYS[spectralCard] || "c_familiar";
    spectralCreationCode = `
            -- Create specific spectral card: ${spectralCard}
            if #G.consumeables.cards + G.GAME.consumeable_buffer < G.consumeables.config.card_limit then
                G.GAME.consumeable_buffer = G.GAME.consumeable_buffer + 1
                G.E_MANAGER:add_event(Event({
                    func = function()
                        local spectral_card = create_card('Spectral', G.consumeables, nil, nil, nil, nil, '${spectralKey}')
                        spectral_card:add_to_deck()
                        G.consumeables:emplace(spectral_card)
                        G.GAME.consumeable_buffer = 0
                        return true
                    end
                }))
            end`;
  }

  if (isScoring) {
    // For scoring triggers, use pre-return code
    return {
      statement: `__PRE_RETURN_CODE__${spectralCreationCode}
                __PRE_RETURN_CODE_END__`,
      message: `localize('k_plus_spectral')`,
      colour: "G.C.SECONDARY_SET.Spectral",
    };
  } else {
    // For non-scoring triggers, use func approach
    return {
      statement: `func = function()${spectralCreationCode}
                    card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = localize('k_plus_spectral'), colour = G.C.SECONDARY_SET.Spectral})
                    return true
                end`,
      colour: "G.C.SECONDARY_SET.Spectral",
    };
  }
};
