import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";

export const generateLevelUpHandReturn = (effect: Effect): EffectReturn => {
  const handType = effect.params?.hand_type || "Pair";
  const levels = effect.params?.levels || 1;
  const customMessage = effect.customMessage;

  let levelUpCode = "";

  if (handType === "random") {
    levelUpCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    play_sound('timpani')
                    used_card:juice_up(0.3, 0.5)
                    return true
                end
            }))
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.2,
                func = function()
                    local hand_pool = {}
                    for hand_key, _ in pairs(G.GAME.hands) do
                        table.insert(hand_pool, hand_key)
                    end
                    local random_hand = pseudorandom_element(hand_pool, 'random_hand_levelup')
                    for i = 1, ${levels} do
                        level_up_hand(used_card, random_hand, true)
                    end
                    update_hand_text({sound = 'button', volume = 0.7, pitch = 0.8, delay = 0.3}, {handname=localize(random_hand, 'poker_hands'), chips = G.GAME.hands[random_hand].chips, mult = G.GAME.hands[random_hand].mult, level=G.GAME.hands[random_hand].level})
                    delay(1.3)
                    return true
                end
            }))
            __PRE_RETURN_CODE_END__`;
  } else {
    levelUpCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    play_sound('timpani')
                    used_card:juice_up(0.3, 0.5)
                    return true
                end
            }))
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.2,
                func = function()
                    for i = 1, ${levels} do
                        level_up_hand(used_card, "${handType}", true)
                    end
                    update_hand_text({sound = 'button', volume = 0.7, pitch = 0.8, delay = 0.3}, {handname=localize("${handType}", 'poker_hands'), chips = G.GAME.hands["${handType}"].chips, mult = G.GAME.hands["${handType}"].mult, level=G.GAME.hands["${handType}"].level})
                    delay(1.3)
                    return true
                end
            }))
            __PRE_RETURN_CODE_END__`;
  }

  const result: EffectReturn = {
    statement: levelUpCode,
    colour: "G.C.SECONDARY_SET.Planet",
    configVariables:
      handType !== "random" ? [`hand_type = "${handType}"`] : undefined,
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};
