import type { Effect } from "../../ruleBuilder/types";
import type { PassiveEffectResult } from "../PassiveEffects";

export const generatePassiveCombineRanks = (
  effect: Effect
): PassiveEffectResult => {
  const sourceRankType =
    (effect.params?.source_rank_type as string) || "specific";
  const sourceRanksString = (effect.params?.source_ranks as string) || "J,Q,K";
  const sourceRanks =
    sourceRankType === "specific"
      ? sourceRanksString.split(",").map((rank) => rank.trim())
      : [];
  const targetRank = (effect.params?.target_rank as string) || "A";

  const addToDeck = `-- Hook Card:get_id function for rank combination
    if not G.GAME.combine_ranks_original_get_id then
        G.GAME.combine_ranks_original_get_id = Card.get_id
        function Card:get_id()
            local original_id = G.GAME.combine_ranks_original_get_id(self)
            -- Check all jokers for combine_ranks effect
            for _, joker_card in pairs(G.jokers.cards or {}) do
                if joker_card.ability.extra.source_rank_type then
                    local should_combine = false
                    if joker_card.ability.extra.source_rank_type == "all" then
                        should_combine = true
                    elseif joker_card.ability.extra.source_rank_type == "face_cards" then
                        should_combine = original_id >= 11
                    else
                        -- Check specific ranks
                        for _, source_rank in pairs(joker_card.ability.extra.source_ranks or {}) do
                            local source_id = tonumber(source_rank) or (source_rank == "A" and 14 or source_rank == "K" and 13 or source_rank == "Q" and 12 or source_rank == "J" and 11 or tonumber(source_rank))
                            if original_id == source_id then
                                should_combine = true
                                break
                            end
                        end
                    end
                    
                    if should_combine then
                        local target_id
                        if joker_card.ability.extra.target_rank == "face_cards" then
                            target_id = 11  -- Default to Jack when targeting face cards
                        else
                            target_id = tonumber(joker_card.ability.extra.target_rank) or (joker_card.ability.extra.target_rank == "A" and 14 or joker_card.ability.extra.target_rank == "K" and 13 or joker_card.ability.extra.target_rank == "Q" and 12 or joker_card.ability.extra.target_rank == "J" and 11 or tonumber(joker_card.ability.extra.target_rank))
                        end
                        return target_id
                    end
                end
            end
            return original_id
        end
    end`;

  const removeFromDeck = `-- Check if any combine ranks jokers remain
    local has_combine_ranks = false
    for _, joker_card in pairs(G.jokers.cards or {}) do
        if joker_card ~= card and joker_card.ability.extra.source_rank_type then
            has_combine_ranks = true
            break
        end
    end
    
    -- If no combine ranks jokers remain, restore the original function
    if not has_combine_ranks and G.GAME.combine_ranks_original_get_id then
        Card.get_id = G.GAME.combine_ranks_original_get_id
        G.GAME.combine_ranks_original_get_id = nil
    end`;

  return {
    addToDeck,
    removeFromDeck,
    configVariables: [
      `source_rank_type = "${sourceRankType}"`,
      `source_ranks = {${sourceRanks.map((rank) => `"${rank}"`).join(", ")}}`,
      `target_rank = "${targetRank}"`,
    ],
    locVars: [
      `card.ability.extra.source_rank_type`,
      `card.ability.extra.target_rank`,
    ],
  };
};
