import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";

export const generateEditDollarsReturn = (effect: Effect): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const value = effect.params?.value || 5;
  const customMessage = effect.customMessage;

  let dollarsCode = "";

  switch (operation) {
    case "add": {
      const addMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${value}).." $"`;
      dollarsCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${addMessage}, colour = G.C.MONEY})
                    ease_dollars(${value}, true)
                    return true
                end
            }))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
      break;
    }
    case "subtract": {
      const subtractMessage = customMessage
        ? `"${customMessage}"`
        : `"-"..tostring(${value}).." $"`;
      dollarsCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${subtractMessage}, colour = G.C.RED})
                    ease_dollars(-math.min(G.GAME.dollars, ${value}), true)
                    return true
                end
            }))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
      break;
    }
    case "set": {
      const setMessage = customMessage
        ? `"${customMessage}"`
        : `"Set to $"..tostring(${value})`;
      dollarsCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    local current_dollars = G.GAME.dollars
                    local target_dollars = ${value}
                    local difference = target_dollars - current_dollars
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.MONEY})
                    ease_dollars(difference, true)
                    return true
                end
            }))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
      break;
    }
    default: {
      const defaultMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${value}).." $"`;
      dollarsCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    card_eval_status_text(used_card, 'extra', nil, nil, nil, {message = ${defaultMessage}, colour = G.C.MONEY})
                    ease_dollars(${value}, true)
                    return true
                end
            }))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
    }
  }

  return {
    statement: dollarsCode,
    colour: "G.C.MONEY",
    configVariables: [`dollars_value = ${value}`],
  };
};
