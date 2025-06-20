import type { Rule } from "../ruleBuilder/types";
import { generateEffectReturnStatement } from "./effectUtils";

export const generateCalculateFunction = (
  rules: Rule[],
  conditionCodeByRule: { [ruleId: string]: string[] }
): string => {
  const nonPassiveRules = rules.filter((rule) => rule.trigger !== "passive");

  if (!nonPassiveRules || nonPassiveRules.length === 0) {
    return "";
  }

  let calculateFunction = `calculate = function(self, card, context)`;

  nonPassiveRules.forEach((rule) => {
    const triggerType = rule.trigger;
    const effects = rule.effects || [];
    const conditionCodes = conditionCodeByRule[rule.id] || [];

    const hasRetriggerEffects = effects.some(
      (effect) => effect.type === "retrigger_cards"
    );

    let conditionChecks = "";
    if (conditionCodes.length === 0) {
      conditionChecks = "true";
    } else if (conditionCodes.length === 1) {
      conditionChecks = `(${conditionCodes[0]})`;
    } else {
      const allConditions = rule.conditionGroups.flatMap(
        (group) => group.conditions
      );
      conditionChecks = conditionCodes
        .map((code, index) => {
          if (index === conditionCodes.length - 1) {
            return `(${code})`;
          }
          const condition = allConditions[index];
          const operator = condition?.operator || "and";
          return `(${code}) ${operator}`;
        })
        .join(" ");
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
    } else if (triggerType === "hand_discarded") {
      contextCheck = "context.pre_discard and not context.blueprint";
      description = "-- When hand is discarded";
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

    const randomChanceEffects = effects.filter(
      (effect) => effect.params.has_random_chance === "true"
    );
    const normalEffects = effects.filter(
      (effect) => effect.params.has_random_chance !== "true"
    );

    if (normalEffects.length > 0) {
      const {
        statement: returnStatement,
        colour,
        preReturnCode,
      } = generateEffectReturnStatement(normalEffects, triggerType);

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
    }

    randomChanceEffects.forEach((effect, index) => {
      const numerator = effect.params.chance_numerator || 1;
      const denominator = effect.params.chance_denominator || 4;
      const effectKey = `effect_${index}_${effect.type}`;

      const numeratorRef =
        typeof numerator === "string"
          ? `card.ability.extra.${numerator}`
          : numerator;
      const denominatorRef =
        typeof denominator === "string"
          ? `card.ability.extra.${denominator}`
          : denominator;

      const {
        statement: returnStatement,
        colour,
        preReturnCode,
      } = generateEffectReturnStatement([effect], triggerType);

      if (preReturnCode) {
        calculateFunction += `
            -- Pre-return code execution for random effect
            ${preReturnCode}
            `;
      }

      calculateFunction += `
        if pseudorandom('${effectKey}') < G.GAME.probabilities.normal * ${numeratorRef} / ${denominatorRef} then
            return {${returnStatement},
                colour = ${colour}
            }
        end`;
    });

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
