import type { Rule } from "../ruleBuilder/types";
import { generateEffectReturnStatement } from "./effectUtils";

// Function to generate the main calculate function combining all conditions
export const generateCalculateFunction = (
  rules: Rule[],
  conditionFunctions: string[]
): string => {
  // Get trigger from the first rule (or default to hand_played)
  const triggerType = rules.length > 0 ? rules[0].trigger : "hand_played";

  if (!rules || rules.length === 0) {
    // Simple function with no rules
    return `calculate = function(self, card, context)
    if context.joker_main then
        -- Simple effect with no conditions
        ${generateReturnFromEffectUtils()}
    end
end`;
  }

  // Get all effect types from rules
  const effectTypes: string[] = [];
  rules.forEach((rule) => {
    rule.effects.forEach((effect) => {
      if (!effectTypes.includes(effect.type)) {
        effectTypes.push(effect.type);
      }
    });
  });

  // Check if there are retrigger effects
  const hasRetriggerEffects = effectTypes.includes("retrigger_cards");

  // Get return statement from effectUtils
  const { statement: returnStatement, colour } = generateEffectReturnStatement(
    effectTypes,
    triggerType
  );

  // Build the condition checking part
  let conditionChecks = "";
  if (conditionFunctions.length === 0) {
    conditionChecks = "true";
  } else if (conditionFunctions.length === 1) {
    conditionChecks = `${conditionFunctions[0]}(context)`;
  } else {
    conditionChecks = conditionFunctions
      .map((fn) => `${fn}(context)`)
      .join(" and ");
  }

  // Generate context check based on trigger type
  let contextCheck = "";
  let description = "";

  if (triggerType === "card_scored") {
    if (hasRetriggerEffects) {
      contextCheck = "context.repetition and context.cardarea == G.play";
      description = "-- Card repetition context for retriggering";
    } else {
      contextCheck = "context.individual and context.cardarea == G.play";
      description = "-- Individual card scoring";
    }
  } else if (triggerType === "blind_selected") {
    contextCheck = "context.setting_blind and not context.blueprint";
    description = "-- When blind is selected";
  } else if (triggerType === "blind_skipped") {
    contextCheck = "context.skip_blind and not context.blueprint";
    description = "-- When blind is skipped";
  } else if (triggerType === "boss_defeated") {
    contextCheck =
      "context.end_of_round and context.main_eval and G.GAME.blind.boss and not context.blueprint";
    description = "-- After boss blind is defeated";
  } else if (triggerType === "booster_opened") {
    contextCheck = "context.open_booster";
    description = "-- When booster pack is opened";
  } else if (triggerType === "booster_skipped") {
    contextCheck = "context.skipping_booster";
    description = "-- When booster pack is skipped";
  } else if (triggerType === "consumable_used") {
    contextCheck = "context.using_consumeable";
    description = "-- When consumable is used";
  } else if (triggerType === "hand_drawn") {
    contextCheck = "context.hand_drawn";
    description = "-- When hand is drawn";
  } else if (triggerType === "first_hand_drawn") {
    contextCheck = "context.first_hand_drawn";
  } else if (triggerType === "shop_exited") {
    contextCheck = "context.ending_shop and not context.blueprint";
    description = "-- When exiting shop";
  } else if (triggerType === "card_discarded") {
    contextCheck = "context.discard and not context.blueprint";
    description = "-- When card is discarded";
  } else if (triggerType === "passive") {
    contextCheck = "context.joker_main";
    description = "-- Passive effect during scoring";
  } else {
    // Default to hand_played behavior
    contextCheck = "context.cardarea == G.jokers and context.joker_main";
    description = "-- Main scoring time for jokers";
  }

  // Generate final calculate function
  return `calculate = function(self, card, context)
    ${description}
    if ${contextCheck} then
        -- Check all conditions
        if ${conditionChecks} then
            return {${returnStatement},
                colour = ${colour}
            }
        end
    end
end`;
};

// Helper function that uses effectUtils to get a return statement
const generateReturnFromEffectUtils = (): string => {
  // Just return a simple activation message if no effects
  const { statement, colour } = generateEffectReturnStatement([]);

  return `return {${statement},
            colour = ${colour}
        }`;
};
