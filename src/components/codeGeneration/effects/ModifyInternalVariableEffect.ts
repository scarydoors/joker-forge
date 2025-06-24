import type { EffectReturn } from "./AddChipsEffect";
import type { Effect } from "../../ruleBuilder/types";

export const generateModifyInternalVariableReturn = (
  effect: Effect,
  triggerType: string
): EffectReturn => {
  const variableName = (effect.params?.variable_name as string) || "var1";
  const operation = (effect.params?.operation as string) || "increment";
  const value = (effect.params?.value as number | string) || 1;
  const customMessage = effect.customMessage;

  const scoringTriggers = ["hand_played", "card_scored"];
  const isScoring = scoringTriggers.includes(triggerType);

  let operationCode = "";
  let messageText = "";
  let messageColor = "G.C.WHITE";

  // Handle value - if it's a string, treat it as a variable reference
  const valueRef =
    typeof value === "string"
      ? `card.ability.extra.${value}`
      : value.toString();

  switch (operation) {
    case "set":
      operationCode = `card.ability.extra.${variableName} = ${valueRef}`;
      messageText = customMessage
        ? `"${customMessage}"`
        : `"Set to "..tostring(${valueRef}).."!"`;
      messageColor = "G.C.BLUE";
      break;
    case "increment":
      operationCode = `card.ability.extra.${variableName} = (card.ability.extra.${variableName} or 0) + ${valueRef}`;
      messageText = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueRef})`;
      messageColor = "G.C.GREEN";
      break;
    case "decrement":
      operationCode = `card.ability.extra.${variableName} = math.max(0, (card.ability.extra.${variableName} or 0) - ${valueRef})`;
      messageText = customMessage
        ? `"${customMessage}"`
        : `"-"..tostring(${valueRef})`;
      messageColor = "G.C.RED";
      break;
    case "multiply":
      operationCode = `card.ability.extra.${variableName} = (card.ability.extra.${variableName} or 0) * ${valueRef}`;
      messageText = customMessage
        ? `"${customMessage}"`
        : `"x"..tostring(${valueRef})`;
      messageColor = "G.C.MULT";
      break;
    case "divide":
      operationCode = `card.ability.extra.${variableName} = (card.ability.extra.${variableName} or 0) / ${valueRef}`;
      messageText = customMessage
        ? `"${customMessage}"`
        : `"÷"..tostring(${valueRef})`;
      messageColor = "G.C.MULT";
      break;
    case "reset":
      operationCode = `card.ability.extra.${variableName} = 0`;
      messageText = customMessage ? `"${customMessage}"` : `"Reset!"`;
      messageColor = "G.C.WHITE";
      break;
    default:
      operationCode = `card.ability.extra.${variableName} = (card.ability.extra.${variableName} or 0) + ${valueRef}`;
      messageText = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueRef})`;
      messageColor = "G.C.GREEN";
  }

  if (isScoring) {
    return {
      statement: `__PRE_RETURN_CODE__
                ${operationCode}
                __PRE_RETURN_CODE_END__`,
      message: messageText,
      colour: messageColor,
    };
  } else {
    return {
      statement: `func = function()
                    ${operationCode}
                    return true
                end`,
      message: messageText,
      colour: messageColor,
    };
  }
};
