import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";

export const generateAddCardsToHandReturn = (effect: Effect): EffectReturn => {
  const enhancement = effect.params?.enhancement || "none";
  const seal = effect.params?.seal || "none";
  const edition = effect.params?.edition || "none";
  const suit = effect.params?.suit || "none";
  const rank = effect.params?.rank || "random";
  const count = effect.params?.count || 1;
  const customMessage = effect.customMessage;

  let addCardsCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.7,
                func = function()
                    local cards = {}
                    for i = 1, card.ability.extra.add_cards_count do`;

  // Handle rank selection
  if (rank === "Face Cards") {
    addCardsCode += `
                        local faces = {}
                        for _, rank_key in ipairs(SMODS.Rank.obj_buffer) do
                            local rank = SMODS.Ranks[rank_key]
                            if rank.face then table.insert(faces, rank) end
                        end
                        local _rank = pseudorandom_element(faces, 'add_face_cards').card_key`;
  } else if (rank === "Numbered Cards") {
    addCardsCode += `
                        local numbers = {}
                        for _, rank_key in ipairs(SMODS.Rank.obj_buffer) do
                            local rank = SMODS.Ranks[rank_key]
                            if rank_key ~= 'Ace' and not rank.face then table.insert(numbers, rank) end
                        end
                        local _rank = pseudorandom_element(numbers, 'add_numbered_cards').card_key`;
  } else if (rank === "random") {
    addCardsCode += `
                        local _rank = pseudorandom_element(SMODS.Ranks, 'add_random_rank').card_key`;
  } else {
    addCardsCode += `
                        local _rank = '${rank}'`;
  }

  // Handle suit selection
  if (suit === "random") {
    addCardsCode += `
                        local _suit = pseudorandom_element(SMODS.Suits, 'add_random_suit').key`;
  } else if (suit !== "none") {
    addCardsCode += `
                        local _suit = '${suit}'`;
  } else {
    addCardsCode += `
                        local _suit = nil`;
  }

  // Handle enhancement selection
  if (enhancement === "random") {
    addCardsCode += `
                        local cen_pool = {}
                        for _, enhancement_center in pairs(G.P_CENTER_POOLS["Enhanced"]) do
                            if enhancement_center.key ~= 'm_stone' and not enhancement_center.overrides_base_rank then
                                cen_pool[#cen_pool + 1] = enhancement_center
                            end
                        end
                        local enhancement = pseudorandom_element(cen_pool, 'add_cards_enhancement')`;
  } else if (enhancement !== "none") {
    addCardsCode += `
                        local enhancement = G.P_CENTERS['${enhancement}']`;
  }

  // Create the card
  addCardsCode += `
                        local new_card_params = { set = "Base" }
                        if _rank then new_card_params.rank = _rank end
                        if _suit then new_card_params.suit = _suit end`;

  if (enhancement !== "none") {
    addCardsCode += `
                        if enhancement then new_card_params.enhancement = enhancement.key end`;
  }

  addCardsCode += `
                        cards[i] = SMODS.add_card(new_card_params)`;

  // Apply seal if specified
  if (seal !== "none") {
    if (seal === "random") {
      addCardsCode += `
                        if cards[i] then
                            local seal_pool = {'Gold', 'Red', 'Blue', 'Purple'}
                            local random_seal = pseudorandom_element(seal_pool, 'add_cards_seal')
                            cards[i]:set_seal(random_seal, nil, true)
                        end`;
    } else {
      addCardsCode += `
                        if cards[i] then
                            cards[i]:set_seal('${seal}', nil, true)
                        end`;
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
      addCardsCode += `
                        if cards[i] then
                            local edition = poll_edition('add_cards_edition', nil, true, true, 
                                { 'e_polychrome', 'e_holo', 'e_foil' })
                            cards[i]:set_edition(edition, true)
                        end`;
    } else {
      const editionLua =
        editionMap[edition as keyof typeof editionMap] || "foil";
      addCardsCode += `
                        if cards[i] then
                            cards[i]:set_edition({ ${editionLua} = true }, true)
                        end`;
    }
  }

  addCardsCode += `
                    end
                    SMODS.calculate_context({ playing_card_added = true, cards = cards })
                    return true
                end
            }))
            delay(0.3)
            __PRE_RETURN_CODE_END__`;

  const result: EffectReturn = {
    statement: addCardsCode,
    colour: "G.C.SECONDARY_SET.Spectral",
    configVariables: [`add_cards_count = ${count}`],
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};
