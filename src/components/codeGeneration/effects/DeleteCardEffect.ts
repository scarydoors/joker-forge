import type { EffectReturn } from "./AddChipsEffect";
import type { Effect } from "../../ruleBuilder/types";

export const generateDeleteCardReturn = (effect?: Effect): EffectReturn => {
  const customMessage = effect?.customMessage;

  return {
    statement: `__PRE_RETURN_CODE__
                if not contains(card.ability.extra.destructo, context.other_card) then
                    card.ability.extra.destructo[#card.ability.extra.destructo + 1] = context.other_card
                end
                __PRE_RETURN_CODE_END__`,
    message: customMessage ? `"${customMessage}"` : `"Destroyed!"`,
    colour: "G.C.RED",
  };
};
