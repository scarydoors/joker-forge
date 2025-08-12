import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";
import {
  generateConfigVariables
} from "../gameVariableUtils";

export const generateSetSellValueReturn = (
  effect: Effect,
  triggerType: string,
  sameTypeCount: number = 0
): EffectReturn => {
  const target = (effect.params?.target as string) || "self";
  const operation = (effect.params?.operation as string) || "add";

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
  let messageText = "";

  if (target === "self") {
    switch (operation) {
      case "add":
        sellValueCode = `
            card.ability.extra_value = (card.ability.extra_value or 0) + ${valueCode}
            card:set_cost()`;
        messageText = customMessage
          ? `"${customMessage}"`
          : `"+"..tostring(${valueCode}).." Sell Value"`;
        break;
      case "subtract":
        sellValueCode = `
            card.ability.extra_value = math.max(0, (card.ability.extra_value or 0) - ${valueCode})
            card:set_cost()`;
        messageText = customMessage
          ? `"${customMessage}"`
          : `"-"..tostring(${valueCode}).." Sell Value"`;
        break;
      case "set":
        sellValueCode = `
            card.ability.extra_value = ${valueCode}
            card:set_cost()`;
        messageText = customMessage
          ? `"${customMessage}"`
          : `"Sell Value: $"..tostring(${valueCode})`;
        break;
      default:
        sellValueCode = `
            card.ability.extra_value = (card.ability.extra_value or 0) + ${valueCode}
            card:set_cost()`;
        messageText = customMessage
          ? `"${customMessage}"`
          : `"+"..tostring(${valueCode}).." Sell Value"`;
    }
  } else if (target === "all_jokers") {
    switch (operation) {
      case "add":
        sellValueCode = `
            for i, other_card in ipairs(G.jokers.cards) do
                if other_card.set_cost then
                    other_card.ability.extra_value = (other_card.ability.extra_value or 0) + ${valueCode}
                    other_card:set_cost()
                end
            end`;
        messageText = customMessage
          ? `"${customMessage}"`
          : `"All Jokers +"..tostring(${valueCode}).." Sell Value"`;
        break;
      case "subtract":
        sellValueCode = `
            for i, other_card in ipairs(G.jokers.cards) do
                if other_card.set_cost then
                    other_card.ability.extra_value = math.max(0, (other_card.ability.extra_value or 0) - ${valueCode})
                    other_card:set_cost()
                end
            end`;
        messageText = customMessage
          ? `"${customMessage}"`
          : `"All Jokers -"..tostring(${valueCode}).." Sell Value"`;
        break;
      case "set":
        sellValueCode = `
            for i, other_card in ipairs(G.jokers.cards) do
                if other_card.set_cost then
                    other_card.ability.extra_value = ${valueCode}
                    other_card:set_cost()
                end
            end`;
        messageText = customMessage
          ? `"${customMessage}"`
          : `"All Jokers Sell Value: $"..tostring(${valueCode})`;
        break;
      default:
        sellValueCode = `
            for i, other_card in ipairs(G.jokers.cards) do
                if other_card.set_cost then
                    other_card.ability.extra_value = (other_card.ability.extra_value or 0) + ${valueCode}
                    other_card:set_cost()
                end
            end`;
        messageText = customMessage
          ? `"${customMessage}"`
          : `"All Jokers +"..tostring(${valueCode}).." Sell Value"`;
    }
  } else if (target === "all") {
    switch (operation) {
      case "add":
        sellValueCode = `
            for _, area in ipairs({ G.jokers, G.consumeables }) do
                for i, other_card in ipairs(area.cards) do
                    if other_card.set_cost then
                        other_card.ability.extra_value = (other_card.ability.extra_value or 0) + ${valueCode}
                        other_card:set_cost()
                    end
                end
            end`;
        messageText = customMessage
          ? `"${customMessage}"`
          : `"All Cards +"..tostring(${valueCode}).." Sell Value"`;
        break;
      case "subtract":
        sellValueCode = `
            for _, area in ipairs({ G.jokers, G.consumeables }) do
                for i, other_card in ipairs(area.cards) do
                    if other_card.set_cost then
                        other_card.ability.extra_value = math.max(0, (other_card.ability.extra_value or 0) - ${valueCode})
                        other_card:set_cost()
                    end
                end
            end`;
        messageText = customMessage
          ? `"${customMessage}"`
          : `"All Cards -"..tostring(${valueCode}).." Sell Value"`;
        break;
      case "set":
        sellValueCode = `
            for _, area in ipairs({ G.jokers, G.consumeables }) do
                for i, other_card in ipairs(area.cards) do
                    if other_card.set_cost then
                        other_card.ability.extra_value = ${valueCode}
                        other_card:set_cost()
                    end
                end
            end`;
        messageText = customMessage
          ? `"${customMessage}"`
          : `"All Cards Sell Value: $"..tostring(${valueCode})`;
        break;
      default:
        sellValueCode = `
            for _, area in ipairs({ G.jokers, G.consumeables }) do
                for i, other_card in ipairs(area.cards) do
                    if other_card.set_cost then
                        other_card.ability.extra_value = (other_card.ability.extra_value or 0) + ${valueCode}
                        other_card:set_cost()
                    end
                end
            end`;
        messageText = customMessage
          ? `"${customMessage}"`
          : `"All Cards +"..tostring(${valueCode}).." Sell Value"`;
    }
  }

  const result: EffectReturn = {
    statement: isScoring
      ? `__PRE_RETURN_CODE__${sellValueCode}
                __PRE_RETURN_CODE_END__`
      : `func = function()${sellValueCode}
                    return true
                end`,
    message: messageText,
    colour: "G.C.MONEY",
    configVariables: configVariables.length > 0 ? configVariables : undefined,
  };

  return result;
};
