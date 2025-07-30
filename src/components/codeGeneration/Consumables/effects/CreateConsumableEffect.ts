import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";
import { generateGameVariableCode } from "../gameVariableUtils";

export const generateCreateConsumableReturn = (
  effect: Effect
): EffectReturn => {
  const set = effect.params?.set || "random";
  const specificCard = effect.params?.specific_card || "random";
  const count = effect.params?.count || 1;
  const customMessage = effect.customMessage;

  const countCode = generateGameVariableCode(count);

  let createCode = "";

  if (set === "random") {
    createCode = `
            __PRE_RETURN_CODE__
            for i = 1, math.min(${countCode}, G.consumeables.config.card_limit - #G.consumeables.cards) do
                G.E_MANAGER:add_event(Event({
                    trigger = 'after',
                    delay = 0.4,
                    func = function()
                        if G.consumeables.config.card_limit > #G.consumeables.cards then
                            play_sound('timpani')
                            local sets = {'Tarot', 'Planet', 'Spectral'}
                            local random_set = pseudorandom_element(sets, 'random_consumable_set')
                            SMODS.add_card({ set = random_set })
                            used_card:juice_up(0.3, 0.5)
                        end
                        return true
                    end
                }))
            end
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
  } else if (specificCard === "random") {
    createCode = `
            __PRE_RETURN_CODE__
            for i = 1, math.min(${countCode}, G.consumeables.config.card_limit - #G.consumeables.cards) do
                G.E_MANAGER:add_event(Event({
                    trigger = 'after',
                    delay = 0.4,
                    func = function()
                        if G.consumeables.config.card_limit > #G.consumeables.cards then
                            play_sound('timpani')
                            SMODS.add_card({ set = '${set}' })
                            used_card:juice_up(0.3, 0.5)
                        end
                        return true
                    end
                }))
            end
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
  } else {
    createCode = `
            __PRE_RETURN_CODE__
            for i = 1, math.min(${countCode}, G.consumeables.config.card_limit - #G.consumeables.cards) do
                G.E_MANAGER:add_event(Event({
                    trigger = 'after',
                    delay = 0.4,
                    func = function()
                        if G.consumeables.config.card_limit > #G.consumeables.cards then
                            play_sound('timpani')
                            SMODS.add_card({ key = '${specificCard}' })
                            used_card:juice_up(0.3, 0.5)
                        end
                        return true
                    end
                }))
            end
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
  }

  const configVariables =
    typeof count === "string" && count.startsWith("GAMEVAR:")
      ? []
      : [`consumable_count = ${count}`];

  const result: EffectReturn = {
    statement: createCode,
    colour: "G.C.SECONDARY_SET.Tarot",
    configVariables,
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};
