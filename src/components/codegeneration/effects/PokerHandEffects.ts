import { JokerData } from "../../JokerCard";
import type { Rule } from "../../ruleBuilder/types";
import { generateEffectReturnStatement } from "../effectUtils";

export const generatePokerHandCode = (
  joker: JokerData,
  rules: Rule[]
): string => {
  const pokerHandRules =
    rules?.filter((rule) => rule.trigger === "hand_played") || [];
  if (pokerHandRules.length === 0) return "";

  // Collect all effect types from the rules
  const effectTypes: string[] = [];

  // Structure to track hand type conditions and their card scope
  type HandTypeCondition = {
    handType: string;
    scope: string;
    negate: boolean;
  };

  const handConditions: HandTypeCondition[] = [];

  // Track if we have special effects that need different handling
  let hasLevelUpEffect = false;
  let hasMoneyEffect = false;
  let hasDiscardEffect = false;
  let hasHandEffect = false;
  let hasSelfDestructEffect = false;

  // Parameter values
  let levelUpValue = 1;
  let moneyValue = 0;
  let discardValue = 1;
  let handValue = 1;

  // Extract hand types, card scopes, and effects from rules
  pokerHandRules.forEach((rule) => {
    // Extract hand types and card scope from conditions
    rule.conditionGroups.forEach((group) => {
      group.conditions.forEach((condition) => {
        if (condition.type === "hand_type") {
          // Only process hand_type conditions with equals or not_equals operators
          if (
            condition.params.operator === "equals" ||
            condition.params.operator === "not_equals"
          ) {
            handConditions.push({
              handType: condition.params.value as string,
              scope: (condition.params.card_scope as string) || "scoring", // Default to scoring if not specified
              negate:
                condition.params.operator === "not_equals" || condition.negate,
            });
          }
        }
      });
    });

    // Extract all effect types and specific parameter values
    rule.effects.forEach((effect) => {
      if (!effectTypes.includes(effect.type)) {
        effectTypes.push(effect.type);
      }

      // Capture effect-specific values
      if (effect.type === "level_up_hand") {
        hasLevelUpEffect = true;
        if (effect.params.value) levelUpValue = effect.params.value as number;
      } else if (effect.type === "add_money") {
        hasMoneyEffect = true;
        if (effect.params.value) moneyValue = effect.params.value as number;
      } else if (effect.type === "add_discard") {
        hasDiscardEffect = true;
        if (effect.params.value) discardValue = effect.params.value as number;
      } else if (effect.type === "add_hand") {
        hasHandEffect = true;
        if (effect.params.value) handValue = effect.params.value as number;
      } else if (effect.type === "destroy_self") {
        hasSelfDestructEffect = true;
      }
    });
  });

  if (handConditions.length === 0) return "";

  // If no standard effects found in rules, add defaults based on joker properties
  const standardEffectTypes = effectTypes.filter((type) =>
    ["add_chips", "add_mult", "apply_x_mult", "level_up_hand"].includes(type)
  );

  if (standardEffectTypes.length === 0) {
    if (joker.chipAddition > 0) effectTypes.push("add_chips");
    if (joker.multAddition > 0) effectTypes.push("add_mult");
    if (joker.xMult > 1) effectTypes.push("apply_x_mult");
  }

  // For the standard effects (chips, mult, xmult, level_up), generate a normal return statement
  const standardEffects = effectTypes.filter((type) =>
    ["add_chips", "add_mult", "apply_x_mult", "level_up_hand"].includes(type)
  );

  const { statement: returnStatement, colour } = generateEffectReturnStatement(
    joker,
    standardEffects
  );

  // Generate code for hand conditions with AND logic
  let conditionChecks = "";
  let conditionComment = "";

  // Create the condition check code and appropriate comment
  if (handConditions.length === 1) {
    // Single condition case
    const condition = handConditions[0];

    if (condition.scope === "scoring") {
      // For scoring cards, check the scoring_name
      if (condition.negate) {
        conditionChecks = `context.scoring_name ~= "${condition.handType}"`;
        conditionComment = `-- Check if scoring hand is NOT a ${condition.handType}`;
      } else {
        conditionChecks = `context.scoring_name == "${condition.handType}"`;
        conditionComment = `-- Check if scoring hand is a ${condition.handType}`;
      }
    } else if (condition.scope === "all_played") {
      // For all played cards, check if the poker hand exists in context.poker_hands
      if (condition.negate) {
        conditionChecks = `not next(context.poker_hands["${condition.handType}"] or {})`;
        conditionComment = `-- Check if NO ${condition.handType} exists in played cards`;
      } else {
        conditionChecks = `next(context.poker_hands["${condition.handType}"] or {})`;
        conditionComment = `-- Check if a ${condition.handType} exists in played cards`;
      }
    }
  } else {
    // Multiple conditions case - using AND logic between them
    conditionComment = `-- Check that ALL of the following conditions are true:`;

    handConditions.forEach((condition, index) => {
      if (index > 0) conditionChecks += " and "; // Changed from OR to AND

      // Different check based on card scope
      if (condition.scope === "scoring") {
        // For scoring cards, check the scoring_name
        if (condition.negate) {
          conditionChecks += `context.scoring_name ~= "${condition.handType}"`;
        } else {
          conditionChecks += `context.scoring_name == "${condition.handType}"`;
        }

        conditionComment += `\n        -- ${index + 1}. ${
          condition.negate ? "NOT " : ""
        }${condition.handType} (scoring hand)`;
      } else if (condition.scope === "all_played") {
        // For all played cards, check if the poker hand exists in context.poker_hands
        if (condition.negate) {
          conditionChecks += `not next(context.poker_hands["${condition.handType}"] or {})`;
        } else {
          conditionChecks += `next(context.poker_hands["${condition.handType}"] or {})`;
        }

        conditionComment += `\n        -- ${index + 1}. ${
          condition.negate ? "NO " : ""
        }${condition.handType} (any played cards)`;
      }
    });
  }

  // Generate additional code for special effects
  let additionalFunctions = "";

  // Add money uses calc_dollar_bonus, not calculate
  if (hasMoneyEffect) {
    additionalFunctions += `
    calc_dollar_bonus = function(self, card)
        ${conditionComment}
        if ${conditionChecks} then
            local bonus = card.ability.extra.money or ${moneyValue}
            if bonus > 0 then return bonus end
        end
        return 0
    end,`;
  }

  // Add discard and hand use add_to_deck/remove_from_deck
  if (hasDiscardEffect || hasHandEffect) {
    let addToFuncBody = "";
    let removeFromFuncBody = "";

    // For these resource effects, we need to:
    // 1. Store the condition state in the joker's ability
    // 2. Check the condition and set the state flag when the hand is played
    // 3. Apply the effect in add_to_deck if the flag is set

    // First add a condition check to the calculate function
    additionalFunctions += `
    calculate = function(self, card, context)
        -- Store whether conditions are met for resource allocation
        if context.before and context.cardarea == G.play then
            ${conditionComment}
            card.ability.extra.condition_met = ${conditionChecks}
        end
        
        -- For standard effects, apply them in the main joker context
        if context.cardarea == G.jokers and context.joker_main and card.ability.extra.condition_met then
            return {${returnStatement},
                colour = ${colour}
            }
        end`;

    // For level up, add a specific before context handler
    if (hasLevelUpEffect) {
      additionalFunctions += `
        
        -- Level up effect
        if context.cardarea == G.play and context.before and card.ability.extra.condition_met then
            return {
                level_up = ${levelUpValue},
                message = "Level Up!",
                colour = G.C.MULT
            }
        end`;
    }

    // For self-destruct
    if (hasSelfDestructEffect) {
      additionalFunctions += `
        
        -- Self destruct effect at end of round if condition was met
        if context.end_of_round and not context.repetition and context.game_over == false and not context.blueprint and card.ability.extra.condition_met then
            G.E_MANAGER:add_event(Event({
                func = function()
                    play_sound('tarot1')
                    card.T.r = -0.2
                    card:juice_up(0.3, 0.4)
                    card.states.drag.is = true
                    card.children.center.pinch.x = true
                    
                    G.E_MANAGER:add_event(Event({
                        trigger = 'after',
                        delay = 0.3,
                        blockable = false,
                        func = function()
                            G.jokers:remove_card(card)
                            card:remove()
                            card = nil
                            return true;
                        end
                    }))
                    return true
                end
            }))
            return {
                message = 'Self Destruct!',
                colour = G.C.RED
            }
        end`;
    }

    additionalFunctions += `
    end,
    
    -- Initialize the condition flag
    set_ability = function(self, card)
        card.ability.extra.condition_met = false
    end,`;

    if (hasDiscardEffect) {
      addToFuncBody += `if card.ability.extra.condition_met then
            G.GAME.round_resets.discards = G.GAME.round_resets.discards + ${discardValue}
        end`;
    }

    if (hasHandEffect) {
      if (addToFuncBody) addToFuncBody += "\n        ";
      addToFuncBody += `if card.ability.extra.condition_met then
            G.GAME.round_resets.hands = G.GAME.round_resets.hands + ${handValue}
        end`;
    }

    additionalFunctions += `
    
    add_to_deck = function(self, card, from_debuff)
        ${addToFuncBody}
    end,`;
  } else {
    // If no special resource effects, just generate the normal calculate function
    additionalFunctions += `
    calculate = function(self, card, context)
        -- Main scoring time for jokers - this is when most jokers apply their effects
        if context.cardarea == G.jokers and context.joker_main then
            ${conditionComment}
            if ${conditionChecks} then
                return {${returnStatement},
                    colour = ${colour}
                }
            end
        end`;

    // For level up, add a specific before context handler
    if (hasLevelUpEffect) {
      additionalFunctions += `
        
        -- Level up effect
        if context.cardarea == G.play and context.before then
            ${conditionComment}
            if ${conditionChecks} then
                return {
                    level_up = ${levelUpValue},
                    message = "Level Up!",
                    colour = G.C.MULT
                }
            end
        end`;
    }

    // For self-destruct
    if (hasSelfDestructEffect) {
      additionalFunctions += `
        
        -- Self destruct effect at end of round if condition was met
        if context.end_of_round and not context.repetition and context.game_over == false and not context.blueprint then
            ${conditionComment}
            if ${conditionChecks} then
                G.E_MANAGER:add_event(Event({
                    func = function()
                        play_sound('tarot1')
                        card.T.r = -0.2
                        card:juice_up(0.3, 0.4)
                        card.states.drag.is = true
                        card.children.center.pinch.x = true
                        
                        G.E_MANAGER:add_event(Event({
                            trigger = 'after',
                            delay = 0.3,
                            blockable = false,
                            func = function()
                                G.jokers:remove_card(card)
                                card:remove()
                                card = nil
                                return true;
                            end
                        }))
                        return true
                    end
                }))
                return {
                    message = 'Self Destruct!',
                    colour = G.C.RED
                }
            end
        end`;
    }

    additionalFunctions += `
    end`;
  }

  return additionalFunctions;
};
