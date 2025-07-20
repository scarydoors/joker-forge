import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";

export const generateCopySelectedCardsReturn = (
  effect: Effect
): EffectReturn => {
  const copies = effect.params?.copies || 1;
  const enhancement = effect.params?.enhancement || "none";
  const seal = effect.params?.seal || "none";
  const edition = effect.params?.edition || "none";
  const customMessage = effect.customMessage;

  let copyCardsCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                func = function()
                    local _first_materialize = nil
                    local new_cards = {}
                    
                    for _, selected_card in pairs(G.hand.highlighted) do
                        for i = 1, card.ability.extra.copy_cards_amount do
                            G.playing_card = (G.playing_card and G.playing_card + 1) or 1
                            local copied_card = copy_card(selected_card, nil, nil, G.playing_card)
                            copied_card:add_to_deck()
                            G.deck.config.card_limit = G.deck.config.card_limit + 1
                            table.insert(G.playing_cards, copied_card)
                            G.hand:emplace(copied_card)
                            copied_card:start_materialize(nil, _first_materialize)
                            _first_materialize = true
                            new_cards[#new_cards + 1] = copied_card`;

  // Apply enhancement if specified
  if (enhancement !== "none") {
    if (enhancement === "random") {
      copyCardsCode += `
                            
                            local cen_pool = {}
                            for _, enhancement_center in pairs(G.P_CENTER_POOLS["Enhanced"]) do
                                if enhancement_center.key ~= 'm_stone' then
                                    cen_pool[#cen_pool + 1] = enhancement_center
                                end
                            end
                            local enhancement = pseudorandom_element(cen_pool, 'copy_cards_enhancement')
                            copied_card:set_ability(enhancement)`;
    } else {
      copyCardsCode += `
                            
                            copied_card:set_ability(G.P_CENTERS['${enhancement}'])`;
    }
  }

  // Apply seal if specified
  if (seal !== "none") {
    if (seal === "random") {
      copyCardsCode += `
                            
                            local seal_pool = {'Gold', 'Red', 'Blue', 'Purple'}
                            local random_seal = pseudorandom_element(seal_pool, 'copy_cards_seal')
                            copied_card:set_seal(random_seal, nil, true)`;
    } else {
      copyCardsCode += `
                            
                            copied_card:set_seal('${seal}', nil, true)`;
    }
  }

  // Apply edition if specified
  if (edition !== "none") {
    const editionMap: Record<string, string> = {
      e_foil: "foil",
      e_holo: "holo",
      e_polychrome: "polychrome",
      e_negative: "negative",
    };

    if (edition === "random") {
      copyCardsCode += `
                            
                            local edition = poll_edition('copy_cards_edition', nil, true, true, 
                                { 'e_polychrome', 'e_holo', 'e_foil' })
                            copied_card:set_edition(edition, true)`;
    } else if (edition === "remove") {
      copyCardsCode += `
                            
                            copied_card:set_edition(nil, true)`;
    } else {
      const editionLua =
        editionMap[edition as keyof typeof editionMap] || "foil";
      copyCardsCode += `
                            
                            copied_card:set_edition({ ${editionLua} = true }, true)`;
    }
  }

  copyCardsCode += `
                        end
                    end
                    
                    SMODS.calculate_context({ playing_card_added = true, cards = new_cards })
                    return true
                end
            }))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;

  const result: EffectReturn = {
    statement: copyCardsCode,
    colour: "G.C.SECONDARY_SET.Spectral",
    configVariables: [`copy_cards_amount = ${copies}`],
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};
