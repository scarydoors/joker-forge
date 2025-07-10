import type { EffectReturn } from "./AddChipsEffect";
import type { Effect } from "../../ruleBuilder/types";

export const generateDeleteCardReturn = (
  effect?: Effect,
  triggerType?: string
): EffectReturn => {
  const customMessage = effect?.customMessage;

  if (triggerType === "card_discarded") {
    return {
      statement: `remove = true,
                  message = ${
                    customMessage ? `"${customMessage}"` : `"Destroyed!"`
                  }`,
      message: "",
      colour: "",
    };
  }

  return {
    statement: "",
    message: customMessage ? `"${customMessage}"` : `"Destroyed!"`,
    colour: "G.C.RED",
  };
};
