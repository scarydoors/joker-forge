import type { Rule } from "../ruleBuilder/types";
import { generateEffectReturnStatement } from "./effectUtils";

export const generateCalculateFunction = (
  rules: Rule[],
  conditionFunctionsByRule: { [ruleId: string]: string[] }
): string => {
  if (!rules || rules.length === 0) {
    return `calculate = function(self, card, context)
    if context.joker_main then
        ${generateReturnFromNoEffects()}
    end
end`;
  }

  let calculateFunction = `calculate = function(self, card, context)`;

  rules.forEach((rule) => {
    const triggerType = rule.trigger;
    const effects = rule.effects || [];
    const conditionFunctions = conditionFunctionsByRule[rule.id] || [];

    const hasRetriggerEffects = effects.some(
      (effect) => effect.type === "retrigger_cards"
    );

    const {
      statement: returnStatement,
      colour,
      preReturnCode,
    } = generateEffectReturnStatement(effects, triggerType);

    let conditionChecks = "";
    if (conditionFunctions.length === 0) {
      conditionChecks = "true";
    } else if (conditionFunctions.length === 1) {
      const functionName = conditionFunctions[0];
      if (functionName.includes("internal_var")) {
        conditionChecks = `${functionName}(context, card)`;
      } else {
        conditionChecks = `${functionName}(context)`;
      }
    } else {
      conditionChecks = conditionFunctions
        .map((fn) => {
          if (fn.includes("internal_var")) {
            return `${fn}(context, card)`;
          } else {
            return `${fn}(context)`;
          }
        })
        .join(" and ");
    }

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
      description = "-- When first hand is drawn";
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
      contextCheck = "context.cardarea == G.jokers and context.joker_main";
      description = "-- Main scoring time for jokers";
    }

    calculateFunction += `
    ${description}
    if ${contextCheck} then`;

    if (conditionChecks !== "true") {
      calculateFunction += `
        -- Check conditions for this rule
        if ${conditionChecks} then`;
    }

    if (preReturnCode) {
      calculateFunction += `
            -- Pre-return code execution
            ${preReturnCode}
            `;
    }

    calculateFunction += `
            return {${returnStatement},
                colour = ${colour}
            }`;

    if (conditionChecks !== "true") {
      calculateFunction += `
        end`;
    }

    calculateFunction += `
    end`;
  });

  calculateFunction += `
end`;

  return calculateFunction;
};

const generateReturnFromNoEffects = (): string => {
  const { statement, colour } = generateEffectReturnStatement([]);

  return `return {${statement},
            colour = ${colour}
        }`;
};
