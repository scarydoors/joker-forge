import type { EffectReturn } from "./AddChipsEffect";
import type { Effect } from "../../ruleBuilder/types";
import { getEffectVariableName } from "../index";
import {
  generateGameVariableCode,
  parseGameVariable,
  parseRangeVariable,
} from "../gameVariableUtils";

export const generateAddSellValueReturn = (
  effect: Effect,
  triggerType: string
): EffectReturn => {
  const target = (effect.params?.target as string) || "self";
  const effectValue = effect.params.value;
  const parsed = parseGameVariable(effectValue);
  const rangeParsed = parseRangeVariable(effectValue);

  let valueCode: string;

  if (parsed.isGameVariable) {
    valueCode = generateGameVariableCode(effectValue);
  } else if (rangeParsed.isRangeVariable) {
    const variableName = getEffectVariableName(effect.id, "sell_value");
    const seedName = `${variableName}_${effect.id.substring(0, 8)}`;
    valueCode = `pseudorandom('${seedName}', card.ability.extra.${variableName}_min, card.ability.extra.${variableName}_max)`;
  } else if (typeof effectValue === "string") {
    if (effectValue.endsWith("_value")) {
      valueCode = effectValue;
    } else {
      valueCode = `card.ability.extra.${effectValue}`;
    }
  } else {
    const variableName = getEffectVariableName(effect.id, "sell_value");
    valueCode = `card.ability.extra.${variableName}`;
  }

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

  if (isScoring) {
    return {
      statement: `__PRE_RETURN_CODE__${sellValueCode}
                __PRE_RETURN_CODE_END__`,
      message: customMessage ? `"${customMessage}"` : `localize('k_val_up')`,
      colour: "G.C.MONEY",
    };
  } else {
    return {
      statement: `func = function()${sellValueCode}
                    return true
                end`,
      message: customMessage ? `"${customMessage}"` : `localize('k_val_up')`,
      colour: "G.C.MONEY",
    };
  }
};
