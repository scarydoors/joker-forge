import type { EffectReturn } from "./AddChipsEffect";
import type { Effect } from "../../ruleBuilder/types";

export const generateAddCardToDeckReturn = (effect: Effect): EffectReturn => {
  const suit = (effect.params?.suit as string) || "random";
  const rank = (effect.params?.rank as string) || "random";
  const enhancement = (effect.params?.enhancement as string) || "none";
  const seal = (effect.params?.seal as string) || "none";
  const edition = (effect.params?.edition as string) || "none";

  // Generate the card selection logic
  let cardSelectionCode = "";

  if (suit === "random" && rank === "random") {
    // Both random - pick any card
    cardSelectionCode =
      "local card_front = pseudorandom_element(G.P_CARDS, pseudoseed('add_card'))";
  } else if (suit !== "random" && rank !== "random") {
    // Both specific - pick exact card
    const cardRank = rank === "10" ? "T" : rank;
    const cardKey = `${suit.charAt(0)}_${cardRank}`;
    cardSelectionCode = `local card_front = G.P_CARDS.${cardKey}`;
  } else if (suit === "random" && rank !== "random") {
    // Random suit, specific rank
    const cardRank = rank === "10" ? "T" : rank;
    cardSelectionCode = `local card_front = pseudorandom_element({G.P_CARDS.S_${cardRank}, G.P_CARDS.H_${cardRank}, G.P_CARDS.D_${cardRank}, G.P_CARDS.C_${cardRank}}, pseudoseed('add_card_suit'))`;
  } else if (suit !== "random" && rank === "random") {
    // Specific suit, random rank
    const suitCode = suit.charAt(0);
    cardSelectionCode = `local card_front = pseudorandom_element({G.P_CARDS.${suitCode}_2, G.P_CARDS.${suitCode}_3, G.P_CARDS.${suitCode}_4, G.P_CARDS.${suitCode}_5, G.P_CARDS.${suitCode}_6, G.P_CARDS.${suitCode}_7, G.P_CARDS.${suitCode}_8, G.P_CARDS.${suitCode}_9, G.P_CARDS.${suitCode}_T, G.P_CARDS.${suitCode}_J, G.P_CARDS.${suitCode}_Q, G.P_CARDS.${suitCode}_K, G.P_CARDS.${suitCode}_A}, pseudoseed('add_card_rank'))`;
  }

  // Handle enhancement/center
  let centerParam = "";
  if (enhancement === "none") {
    centerParam = "G.P_CENTERS.c_base";
  } else if (enhancement === "random") {
    centerParam =
      "pseudorandom_element({G.P_CENTERS.m_gold, G.P_CENTERS.m_steel, G.P_CENTERS.m_glass, G.P_CENTERS.m_wild, G.P_CENTERS.m_mult, G.P_CENTERS.m_lucky, G.P_CENTERS.m_stone}, pseudoseed('add_card_enhancement'))";
  } else {
    centerParam = `G.P_CENTERS.${enhancement}`;
  }

  // Generate seal code inline
  let sealCode = "";
  if (seal === "random") {
    sealCode = `\n            new_card:set_seal(pseudorandom_element({"Gold", "Red", "Blue", "Purple"}, pseudoseed('add_card_seal')), true)`;
  } else if (seal !== "none") {
    sealCode = `\n            new_card:set_seal("${seal}", true)`;
  }

  // Generate edition code inline
  let editionCode = "";
  if (edition === "random") {
    editionCode = `\n            new_card:set_edition(pseudorandom_element({"e_foil", "e_holo", "e_polychrome", "e_negative"}, pseudoseed('add_card_edition')), true)`;
  } else if (edition !== "none") {
    editionCode = `\n            new_card:set_edition("${edition}", true)`;
  }

  return {
    statement: `func = function()
                    ${cardSelectionCode}
                    local new_card = create_playing_card({
                        front = card_front,
                        center = ${centerParam}
                    }, G.discard, true, false, nil, true)${sealCode}${editionCode}
                    
                    G.E_MANAGER:add_event(Event({
                        func = function()
                            new_card:start_materialize()
                            G.play:emplace(new_card)
                            return true
                        end
                    }))
                    
                    G.E_MANAGER:add_event(Event({
                        func = function()
                            G.deck.config.card_limit = G.deck.config.card_limit + 1
                            return true
                        end
                    }))
                    draw_card(G.play, G.deck, 90, 'up')
                    SMODS.calculate_context({ playing_card_added = true, cards = { new_card } })
                end`,
    message: `"Added Card!"`,
    colour: "G.C.GREEN",
  };
};
