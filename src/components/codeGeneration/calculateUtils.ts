import type { Rule } from "../ruleBuilder/types";
import { generateEffectReturnStatement } from "./effectUtils";

interface RuleConditionData {
  conditionCodes: string[];
  rule: Rule;
}

export const generateCalculateFunction = (
  rules: Rule[],
  ruleConditionData: Record<string, RuleConditionData>
): string => {
  const nonPassiveRules = rules.filter((rule) => rule.trigger !== "passive");

  if (!nonPassiveRules || nonPassiveRules.length === 0) {
    return "";
  }

  const rulesByTrigger: { [trigger: string]: Rule[] } = {};
  nonPassiveRules.forEach((rule) => {
    if (!rulesByTrigger[rule.trigger]) {
      rulesByTrigger[rule.trigger] = [];
    }
    rulesByTrigger[rule.trigger].push(rule);
  });

  let calculateFunction = `calculate = function(self, card, context)`;

  Object.entries(rulesByTrigger).forEach(([triggerType, triggerRules]) => {
    let contextCheck = "";
    let description = "";

    if (triggerType === "card_scored") {
      const hasRetriggerEffects = triggerRules.some((rule) =>
        rule.effects.some((effect) => effect.type === "retrigger_cards")
      );

      if (hasRetriggerEffects) {
        contextCheck = "context.repetition and context.cardarea == G.play";
        description = "-- Card repetition context for retriggering";
      } else {
        contextCheck = "context.individual and context.cardarea == G.play";
        description = "-- Individual card scoring";
      }
    } else if (triggerType === "card_held_in_hand") {
      const hasRetriggerEffects = triggerRules.some((rule) =>
        rule.effects.some((effect) => effect.type === "retrigger_cards")
      );

      if (hasRetriggerEffects) {
        contextCheck =
          "context.repetition and context.cardarea == G.hand and (next(context.card_effects[1]) or #context.card_effects > 1)";
        description = "-- Card repetition context for held cards";
      } else {
        contextCheck =
          "context.individual and context.cardarea == G.hand and not context.end_of_round";
        description = "-- Individual card held in hand";
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
    } else if (triggerType === "shop_reroll") {
      contextCheck = "context.reroll_shop and not context.blueprint";
      description = "-- When shop is rerolled";
    } else if (triggerType === "round_end") {
      contextCheck =
        "context.end_of_round and context.game_over == false and context.main_eval and not context.blueprint";
      description = "-- At the end of the round";
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

    const rulesWithoutConditions = triggerRules.filter((rule) => {
      const conditionCodes = ruleConditionData[rule.id]?.conditionCodes || [];
      return conditionCodes.length === 0;
    });

    const rulesWithConditions = triggerRules.filter((rule) => {
      const conditionCodes = ruleConditionData[rule.id]?.conditionCodes || [];
      return conditionCodes.length > 0;
    });

    let hasGeneratedAnyLogic = false;

    rulesWithConditions.forEach((rule, index) => {
      const effects = rule.effects || [];
      const conditionCodes = ruleConditionData[rule.id]?.conditionCodes || [];

      let conditionChecks = "";
      if (conditionCodes.length === 1) {
        conditionChecks = `(${conditionCodes[0]})`;
      } else if (conditionCodes.length > 1) {
        const allConditions = rule.conditionGroups.flatMap(
          (group) => group.conditions
        );
        conditionChecks = conditionCodes
          .map((code, codeIndex) => {
            if (codeIndex === conditionCodes.length - 1) {
              return `(${code})`;
            }
            const condition = allConditions[codeIndex];
            const operator = condition?.operator || "and";
            return `(${code}) ${operator}`;
          })
          .join(" ");
      }

      const randomChanceEffects = effects.filter(
        (effect) => effect.params.has_random_chance === "true"
      );
      const normalEffects = effects.filter(
        (effect) => effect.params.has_random_chance !== "true"
      );

      if (normalEffects.length > 0 || randomChanceEffects.length > 0) {
        const conditional = hasGeneratedAnyLogic ? "elseif" : "if";
        calculateFunction += `
            ${conditional} ${conditionChecks} then`;

        if (normalEffects.length > 0) {
          const { statement: returnStatement, preReturnCode } =
            generateEffectReturnStatement(normalEffects, triggerType, rule.id);

          if (preReturnCode) {
            calculateFunction += `
                ${preReturnCode}`;
          }

          calculateFunction += `
                ${returnStatement}`;
        }

        randomChanceEffects.forEach((effect, effectIndex) => {
          const numerator = effect.params.chance_numerator || 1;
          const denominator = effect.params.chance_denominator || 4;
          const effectKey = `effect_${index}_${effectIndex}_${effect.type}`;

          const numeratorRef =
            typeof numerator === "string"
              ? `card.ability.extra.${numerator}`
              : numerator;
          const denominatorRef =
            typeof denominator === "string"
              ? `card.ability.extra.${denominator}`
              : denominator;

          const { statement: returnStatement, preReturnCode } =
            generateEffectReturnStatement([effect], triggerType, rule.id);

          if (preReturnCode) {
            calculateFunction += `
                ${preReturnCode}`;
          }

          calculateFunction += `
                if pseudorandom('${effectKey}') < G.GAME.probabilities.normal * ${numeratorRef} / ${denominatorRef} then
                    ${returnStatement}
                end`;
        });

        hasGeneratedAnyLogic = true;
      }
    });

    if (rulesWithoutConditions.length > 0) {
      if (hasGeneratedAnyLogic) {
        calculateFunction += `
            else`;
      }

      rulesWithoutConditions.forEach((rule, ruleIndex) => {
        const effects = rule.effects || [];

        const randomChanceEffects = effects.filter(
          (effect) => effect.params.has_random_chance === "true"
        );
        const normalEffects = effects.filter(
          (effect) => effect.params.has_random_chance !== "true"
        );

        if (normalEffects.length > 0) {
          const { statement: returnStatement, preReturnCode } =
            generateEffectReturnStatement(normalEffects, triggerType, rule.id);

          if (preReturnCode) {
            calculateFunction += `
                ${preReturnCode}`;
          }

          calculateFunction += `
                ${returnStatement}`;
        }

        randomChanceEffects.forEach((effect, effectIndex) => {
          const numerator = effect.params.chance_numerator || 1;
          const denominator = effect.params.chance_denominator || 4;
          const effectKey = `effect_unconditional_${ruleIndex}_${effectIndex}_${effect.type}`;

          const numeratorRef =
            typeof numerator === "string"
              ? `card.ability.extra.${numerator}`
              : numerator;
          const denominatorRef =
            typeof denominator === "string"
              ? `card.ability.extra.${denominator}`
              : denominator;

          const { statement: returnStatement, preReturnCode } =
            generateEffectReturnStatement([effect], triggerType, rule.id);

          if (preReturnCode) {
            calculateFunction += `
                ${preReturnCode}`;
          }

          calculateFunction += `
                if pseudorandom('${effectKey}') < G.GAME.probabilities.normal * ${numeratorRef} / ${denominatorRef} then
                    ${returnStatement}
                end`;
        });
      });

      if (hasGeneratedAnyLogic) {
        calculateFunction += `
            end`;
      }
    }

    // Only add one end for the entire conditional chain
    if (hasGeneratedAnyLogic) {
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
