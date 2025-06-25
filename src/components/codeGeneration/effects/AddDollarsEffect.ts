import type { EffectReturn } from "./AddChipsEffect";
import type { Effect } from "../../ruleBuilder/types";
import { getEffectVariableName } from "../index";

const EVAL_STATUS_TEXT_TRIGGERS = [
  "blind_selected",
  "blind_skipped",
  "boss_defeated",
  "booster_opened",
  "booster_skipped",
  "consumable_used",
  "hand_drawn",
  "first_hand_drawn",
  "shop_entered",
  "shop_exited",
  "card_discarded",
];

export const generateAddDollarsReturn = (
  triggerType: string,
  effect?: Effect
): EffectReturn => {
  const customMessage = effect?.customMessage;

  // Check if value is a variable reference (string) or a literal value
  const isVariableReference = typeof effect?.params?.value === "string";

  let valueReference = "";
  if (isVariableReference) {
    const variableName = effect?.params?.value as string;
    valueReference = `card.ability.extra.${variableName}`;
  } else {
    const configVarName = effect
      ? getEffectVariableName(effect.id, "dollars")
      : "dollars";
    valueReference = `card.ability.extra.${configVarName}`;
  }

  if (EVAL_STATUS_TEXT_TRIGGERS.includes(triggerType)) {
    const messageText = customMessage
      ? `"${customMessage}"`
      : `"$"..tostring(${valueReference})`;
    return {
      statement: `func = function()
                    card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${messageText}, colour = G.C.MONEY})
                    ease_dollars(${valueReference})
                    return true
                end`,
      colour: "G.C.MONEY",
    };
  } else {
    return {
      statement: `dollars = ${valueReference}`,
      message: customMessage ? `"${customMessage}"` : undefined,
    };
  }
};
