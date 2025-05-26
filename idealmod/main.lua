SMODS.Joker{ --addcardjokeraceblindselect
    name = "addcardjokeraceblindselect",
    key = "addcardjokeraceblindselect",
    config = {
        extra = {
            
        }
    },
    loc_txt = {
        ['name'] = 'addcardjokeraceblindselect',
        ['text'] = {
            [1] = 'A {C:blue}custom{} joker',
            [2] = 'with {C:red}unique{}',
            [3] = 'effects.'
        }
    },
    pos = {
        x = 0,
        y = 0
    },
    cost = 4,
    rarity = 1,
    blueprint_compat = true,
    eternal_compat = true,
    unlocked = true,
    discovered = true,
    atlas = 'CustomJokers',

    loc_vars = function(self, info_queue, card)
        return {vars = {}}
    end,

    calculate = function(self, card, context)
        if context.setting_blind then
            local new_card = create_playing_card({
                front = G.P_CARDS.H_A,
                center = pseudorandom_element({G.P_CENTERS.m_gold, G.P_CENTERS.m_steel, G.P_CENTERS.m_glass, G.P_CENTERS.m_wild, G.P_CENTERS.m_mult, G.P_CENTERS.m_lucky, G.P_CENTERS.m_stone}, pseudoseed('add_card_enhancement'))
            }, G.discard, true, false, nil, true)
            
            new_card:set_seal(pseudorandom_element({"Gold", "Red", "Blue", "Purple"}, pseudoseed('add_card_seal')), true)
            new_card:set_edition(pseudorandom_element({"e_foil", "e_holo", "e_polychrome", "e_negative"}, pseudoseed('add_card_edition')), true)
            
            G.E_MANAGER:add_event(Event({
                func = function()
                    new_card:start_materialize()
                    G.play:emplace(new_card)
                    return true
                end
            }))
            return {
                message = "Added Card!",
                colour = G.C.GREEN,
                func = function()
                    G.E_MANAGER:add_event(Event({
                        func = function()
                            G.deck.config.card_limit = G.deck.config.card_limit + 1
                            return true
                        end
                    }))
                    draw_card(G.play, G.deck, 90, 'up')
                    SMODS.calculate_context({ playing_card_added = true, cards = { new_card } })
                end
            }
        end
    end
}