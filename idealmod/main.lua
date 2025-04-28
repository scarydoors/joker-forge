local mod = SMODS.current_mod

-- Configure the mod
mod.config = {}

-- Create custom joker atlas
SMODS.Atlas({
    key = "CustomJokers", 
    path = "CustomJokers.png", 
    px = 71,
    py = 95, 
    atlas_table = "ASSET_ATLAS"
}):register()

-- Register the jokers
SMODS.Joker{ --New Joker
    name = "New Joker",
    key = "newjoker",
    config = {
        extra = {
            chips = 5,
            mult = 5,
            Xmult = 5,
        }
    },
    loc_txt = {
        ['name'] = 'New Joker',
        ['text'] = {
            [1] = '{C:chips}+#1# Chips{}, {C:mult}+#2# Mult{},',
            [2] = 'and {X:mult,C:white}X#3#{} to all hands'
        }
    },
    pos = {
        x = 0,
        y = 0
    },
    cost = 5,
    rarity = 1,
    pools = { ['Joker'] = true },
    blueprint_compat = true,
    eternal_compat = true,
    unlocked = true,
    discovered = true,
    atlas = 'CustomJokers',

    loc_vars = function(self, info_queue, card)
        return {vars = {card.ability.extra.chips, card.ability.extra.mult, card.ability.extra.Xmult}}
    end,

    calculate = function(self, card, context)
        if context.cardarea == G.jokers and context.joker_main then
            -- Instead of trying to combine everything in one message, 
            -- just show a standard chips message
            return {
                message = localize{type='variable',key='a_chips',vars={card.ability.extra.chips}},
                chip_mod = card.ability.extra.chips,
                mult_mod = card.ability.extra.mult,
                Xmult_mod = card.ability.extra.Xmult
            }
        end
    end
}

-- Return the mod
return mod