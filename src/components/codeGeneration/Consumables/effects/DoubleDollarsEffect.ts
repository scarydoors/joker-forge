import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";

export const generateDoubleDollarsReturn = (effect: Effect): EffectReturn => {
  const limit = effect.params?.limit || 20;
  const customMessage = effect.customMessage;

  const doubleDollarsCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    play_sound('timpani')
                    used_card:juice_up(0.3, 0.5)
                    local double_amount = math.min(G.GAME.dollars, card.ability.extra.double_limit)
                    ease_dollars(double_amount, true)
                    return true
                end
            }))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;

  const result: EffectReturn = {
    statement: doubleDollarsCode,
    colour: "G.C.MONEY",
    configVariables: [`double_limit = ${limit}`],
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};
