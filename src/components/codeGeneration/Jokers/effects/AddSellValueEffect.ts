import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";
import {
  generateConfigVariables,
} from "../gameVariableUtils";

export const generateAddSellValueReturn = (
  effect: Effect,
  triggerType: string,
  sameTypeCount: number = 0
): EffectReturn => {
  const target = (effect.params?.target as string) || "self";

  const variableName =
    sameTypeCount === 0 ? "sell_value" : `sell_value${sameTypeCount + 1}`;

  const { valueCode, configVariables } = generateConfigVariables(
    effect.params?.value,
    effect.id,
    variableName
  )

  const customMessage = effect.customMessage;

  const scoringTriggers = ["hand_played", "card_scored"];
  const isScoring = scoringTriggers.includes(triggerType);

  let sellValueCode = "";

  if (target === "self") {
    sellValueCode = `
            card.ability.extra_value = (card.ability.extra_value or 0) + ${valueCode}
            card:set_cost()`;
  } else if (target === "all_jokers") {
    sellValueCode = `
            for i, other_card in ipairs(G.jokers.cards) do
                if other_card.set_cost then
                    other_card.ability.extra_value = (other_card.ability.extra_value) + ${valueCode}
                    other_card:set_cost()
                end
            end`;
  } else if (target === "all") {
    sellValueCode = `
            for _, area in ipairs({ G.jokers, G.consumeables }) do
                for i, other_card in ipairs(area.cards) do
                    if other_card.set_cost then
                        other_card.ability.extra_value = (other_card.ability.extra_value) + ${valueCode}
                        other_card:set_cost()
                    end
                end
            end`;
  }

  const result: EffectReturn = {
    statement: isScoring
      ? `__PRE_RETURN_CODE__${sellValueCode}
                __PRE_RETURN_CODE_END__`
      : `func = function()${sellValueCode}
                    return true
                end`,
    message: customMessage ? `"${customMessage}"` : `localize('k_val_up')`,
    colour: "G.C.MONEY",
    configVariables: configVariables.length > 0 ? configVariables : undefined,
  };

  return result;
};
