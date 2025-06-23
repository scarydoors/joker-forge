import type { EffectReturn } from "./AddChipsEffect";
import type { Effect } from "../../ruleBuilder/types";

export const generateCopyCardToDeckReturn = (
  effect: Effect,
  triggerType: string
): EffectReturn => {
  const customMessage = effect.customMessage;
  const scoringTriggers = ["hand_played", "card_scored"];
  const isScoring = scoringTriggers.includes(triggerType);

  if (effect.type === "copy_triggered_card") {
    if (isScoring) {
      return {
        statement: `__PRE_RETURN_CODE__
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
        message: customMessage ? `"${customMessage}"` : `"Copied Card!"`,
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
        message: customMessage ? `"${customMessage}"` : `"Copied Card!"`,
        colour: "G.C.GREEN",
      };
    }
  }

  if (effect.type === "copy_played_card") {
    const cardIndex = (effect.params?.card_index as string) || "any";
    const cardRank = (effect.params?.card_rank as string) || "any";
    const cardSuit = (effect.params?.card_suit as string) || "any";

    const cardSelectionCode = generateCardSelectionLogic(
      cardIndex,
      cardRank,
      cardSuit
    );

    if (isScoring) {
      return {
        statement: `__PRE_RETURN_CODE__
                ${cardSelectionCode}
                
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
        message: customMessage ? `"${customMessage}"` : `"Copied Cards!"`,
        colour: "G.C.GREEN",
      };
    } else {
      return {
        statement: `func = function()
                        ${cardSelectionCode}
                        
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
        message: customMessage ? `"${customMessage}"` : `"Copied Cards!"`,
        colour: "G.C.GREEN",
      };
    }
  }

  return {
    statement: `message = "No Card to Copy"`,
    colour: "G.C.RED",
  };
};

const generateCardSelectionLogic = (
  cardIndex: string,
  cardRank: string,
  cardSuit: string
): string => {
  const conditions: string[] = [];

  if (cardRank !== "any") {
    conditions.push(`c:get_id() == ${getRankId(cardRank)}`);
  }

  if (cardSuit !== "any") {
    conditions.push(`c:is_suit("${cardSuit}")`);
  }

  if (cardIndex === "any") {
    if (conditions.length === 0) {
      return `
                local cards_to_copy = {}
                for i, c in ipairs(context.full_hand) do
                    table.insert(cards_to_copy, c)
                end`;
    } else {
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
    if (conditions.length === 0) {
      return `
                local cards_to_copy = {}
                local target_index = ${cardIndex}
                if context.full_hand[target_index] then
                    table.insert(cards_to_copy, context.full_hand[target_index])
                end`;
    } else {
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
