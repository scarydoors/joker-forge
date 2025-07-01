import type { EffectReturn } from "./AddChipsEffect";
import type { Effect } from "../../ruleBuilder/types";

export const generateDeleteCardReturn = (effect?: Effect): EffectReturn => {
  const customMessage = effect?.customMessage;

  return {
    statement: "",
    message: customMessage ? `"${customMessage}"` : `"Destroyed!"`,
    colour: "G.C.RED",
  };
};
