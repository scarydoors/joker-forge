import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";

export const generateEditHandsReturn = (effect: Effect): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const duration = effect.params?.duration || "permanent"
  const value = effect.params?.value || 1;
  const customMessage = effect.customMessage;

  let handsCode = "";
  let editHandCode = "";

  switch (operation) {
    case "add": {
      if (duration === "permanent") {
        editHandCode = `
        G.GAME.round_resets.hands = G.GAME.round_resets.hands + ${value}
        ease_hands_played(${value})
        `;
      } else if (duration === "round") {
        editHandCode = `G.GAME.current_round.hands_left = G.GAME.current_round.hands_left + ${value}`;
      }
      const addMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${value}).." Hand"`;
      handsCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${addMessage}, colour = G.C.GREEN})
                    ${editHandCode}
                    return true
                end
            }))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
      break;
    }
    case "subtract": {
      if (duration === "permanent") {
        editHandCode = `
        G.GAME.round_resets.hands = G.GAME.round_resets.hands - ${value}
        ease_hands_played(-${value})
        `;
      } else if (duration === "round") {
        editHandCode = `G.GAME.current_round.hands_left = G.GAME.current_round.hands_left - ${value}`;
      }
      const subtractMessage = customMessage
        ? `"${customMessage}"`
        : `"-"..tostring(${value}).." Hand"`;
      handsCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${subtractMessage}, colour = G.C.RED})
                    ${editHandCode}
                    return true
                end
            }))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
      break;
    }
    case "set": {
      if (duration === "permanent") {
        editHandCode = `
        G.GAME.round_resets.hands = ${value}
        ease_hands_played(${value} - G.GAME.current_round.hands_left)
        `;
      } else if (duration === "round") {
        editHandCode = `G.GAME.current_round.hands_left = ${value}`;
      }
      const setMessage = customMessage
        ? `"${customMessage}"`
        : `"Set to "..tostring(${value}).." Hands"`;
      handsCode = `
            __PRE_RETURN_CODE__
            local mod = ${value} - G.GAME.round_resets.hands
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.BLUE})
                    ${editHandCode}
                    return true
                end
            }))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
      break;
    }
  }

  return {
    statement: handsCode,
    colour: "G.C.GREEN",
    configVariables: [`hands_value = ${value}`],
  };
};
