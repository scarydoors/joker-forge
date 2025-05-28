import type { EffectReturn } from "./AddChipsEffect";
import type { Effect } from "../../ruleBuilder/types";

export const generateCopyCardToDeckReturn = (
  effect: Effect,
  triggerType: string
): EffectReturn => {
  // Define scoring triggers that need the copy_card method
  const scoringTriggers = ["hand_played", "card_scored"];
  const isScoring = scoringTriggers.includes(triggerType);

  // Handle the "copy_triggered_card" effect type (for card_scored/card_discarded)
  if (effect.type === "copy_triggered_card") {
    if (isScoring) {
      return {
        statement: `__PRE_RETURN_CODE__
                -- Copy the triggered card like Ship of Theseus does
                G.playing_card = (G.playing_card and G.playing_card + 1) or 1
                local copied_card = copy_card(context.other_card, nil, nil, G.playing_card)
                copied_card:add_to_deck()
                G.deck.config.card_limit = G.deck.config.card_limit + 1
                G.deck:emplace(copied_card)
                table.insert(G.playing_cards, copied_card)
                playing_card_joker_effects({true})
                
                G.E_MANAGER:add_event(Event({
                    func = function() 
                        copied_card:start_materialize()
                        return true
                    end
                }))
                __PRE_RETURN_CODE_END__`,
        message: `"Copied Card!"`,
        colour: "G.C.GREEN",
      };
    } else {
      return {
        statement: `func = function()
                        G.playing_card = (G.playing_card and G.playing_card + 1) or 1
                        local copied_card = copy_card(context.other_card, nil, nil, G.playing_card)
                        copied_card:add_to_deck()
                        G.deck.config.card_limit = G.deck.config.card_limit + 1
                        G.deck:emplace(copied_card)
                        table.insert(G.playing_cards, copied_card)
                        playing_card_joker_effects({true})
                        
                        G.E_MANAGER:add_event(Event({
                            func = function()
                                copied_card:start_materialize()
                                return true
                            end
                        }))
                    end`,
        message: `"Copied Card!"`,
        colour: "G.C.GREEN",
      };
    }
  }

  // Handle the "copy_played_card" effect type (for hand_played)
  if (effect.type === "copy_played_card") {
    const cardIndex = (effect.params?.card_index as string) || "any";
    const cardRank = (effect.params?.card_rank as string) || "any";
    const cardSuit = (effect.params?.card_suit as string) || "any";

    // Generate card selection logic based on parameters
    const cardSelectionCode = generateCardSelectionLogic(
      cardIndex,
      cardRank,
      cardSuit
    );

    if (isScoring) {
      return {
        statement: `__PRE_RETURN_CODE__
                ${cardSelectionCode}
                
                -- Copy all matching cards
                for i, source_card in ipairs(cards_to_copy) do
                    G.playing_card = (G.playing_card and G.playing_card + 1) or 1
                    local copied_card = copy_card(source_card, nil, nil, G.playing_card)
                    copied_card:add_to_deck()
                    G.deck.config.card_limit = G.deck.config.card_limit + 1
                    G.deck:emplace(copied_card)
                    table.insert(G.playing_cards, copied_card)
                    playing_card_joker_effects({true})
                    
                    G.E_MANAGER:add_event(Event({
                        func = function() 
                            copied_card:start_materialize()
                            return true
                        end
                    }))
                end
                __PRE_RETURN_CODE_END__`,
        message: `"Copied Cards!"`,
        colour: "G.C.GREEN",
      };
    } else {
      return {
        statement: `func = function()
                        ${cardSelectionCode}
                        
                        -- Copy all matching cards
                        for i, source_card in ipairs(cards_to_copy) do
                            G.playing_card = (G.playing_card and G.playing_card + 1) or 1
                            local copied_card = copy_card(source_card, nil, nil, G.playing_card)
                            copied_card:add_to_deck()
                            G.deck.config.card_limit = G.deck.config.card_limit + 1
                            G.deck:emplace(copied_card)
                            table.insert(G.playing_cards, copied_card)
                            playing_card_joker_effects({true})
                            
                            G.E_MANAGER:add_event(Event({
                                func = function()
                                    copied_card:start_materialize()
                                    return true
                                end
                            }))
                        end
                    end`,
        message: `"Copied Cards!"`,
        colour: "G.C.GREEN",
      };
    }
  }

  // Default fallback case
  return {
    statement: `message = "No Card to Copy"`,
    colour: "G.C.RED",
  };
};

// Helper function to generate card selection logic based on parameters
const generateCardSelectionLogic = (
  cardIndex: string,
  cardRank: string,
  cardSuit: string
): string => {
  // Build filtering conditions
  const conditions: string[] = [];

  if (cardRank !== "any") {
    conditions.push(`c:get_id() == ${getRankId(cardRank)}`);
  }

  if (cardSuit !== "any") {
    conditions.push(`c:is_suit("${cardSuit}")`);
  }

  if (cardIndex === "any") {
    // Copy ALL cards that match the rank/suit criteria
    if (conditions.length === 0) {
      // All parameters are "any" - copy ALL cards
      return `
                local cards_to_copy = {}
                for i, c in ipairs(context.full_hand) do
                    table.insert(cards_to_copy, c)
                end`;
    } else {
      // Copy all cards matching the rank/suit conditions
      const filterCondition = conditions.join(" and ");
      return `
                local cards_to_copy = {}
                for i, c in ipairs(context.full_hand) do
                    if ${filterCondition} then
                        table.insert(cards_to_copy, c)
                    end
                end`;
    }
  } else {
    // Copy only the card at the specific position, if it matches conditions
    if (conditions.length === 0) {
      // Only position specified - copy that specific card
      return `
                local cards_to_copy = {}
                local target_index = ${cardIndex}
                if context.full_hand[target_index] then
                    table.insert(cards_to_copy, context.full_hand[target_index])
                end`;
    } else {
      // Position + rank/suit specified - copy only if the card at that position matches
      const filterCondition = conditions.join(" and ");
      return `
                local cards_to_copy = {}
                local target_index = ${cardIndex}
                if context.full_hand[target_index] then
                    local c = context.full_hand[target_index]
                    if ${filterCondition} then
                        table.insert(cards_to_copy, c)
                    end
                end`;
    }
  }
};

// Helper function to convert rank string to numeric ID
const getRankId = (rank: string): number => {
  switch (rank) {
    case "2":
      return 2;
    case "3":
      return 3;
    case "4":
      return 4;
    case "5":
      return 5;
    case "6":
      return 6;
    case "7":
      return 7;
    case "8":
      return 8;
    case "9":
      return 9;
    case "10":
      return 10;
    case "J":
      return 11;
    case "Q":
      return 12;
    case "K":
      return 13;
    case "A":
      return 14;
    default:
      return 14;
  }
};
