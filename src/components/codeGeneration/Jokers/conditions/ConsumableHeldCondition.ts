import type { Rule } from "../../../ruleBuilder/types";

export const generateConsumableHeldConditionCode = (
  rules: Rule[]
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const consumableType = (condition.params.consumable_type as string) || "any";
  const operator = (condition.params.operator as string) || "has";

  const hasCondition = operator === "has";

  if (consumableType === "any") {
    return hasCondition
      ? `#G.consumeables.cards > 0`
      : `#G.consumeables.cards == 0`;
  }

  if (consumableType === "tarot") {
    return `(function()
    for _, consumable_card in pairs(G.consumeables.cards or {}) do
        if consumable_card.ability.set == 'Tarot' then
            return ${hasCondition}
        end
    end
    return ${!hasCondition}
end)()`;
  }

  if (consumableType === "planet") {
    return `(function()
    for _, consumable_card in pairs(G.consumeables.cards or {}) do
        if consumable_card.ability.set == 'Planet' then
            return ${hasCondition}
        end
    end
    return ${!hasCondition}
end)()`;
  }

  if (consumableType === "spectral") {
    return `(function()
    for _, consumable_card in pairs(G.consumeables.cards or {}) do
        if consumable_card.ability.set == 'Spectral' then
            return ${hasCondition}
        end
    end
    return ${!hasCondition}
end)()`;
  }

  if (consumableType === "specific") {
    const specificCard = (condition.params.specific_card as string) || "c_fool";

    // Ensure the card key has the c_ prefix if not provided
    const normalizedCardKey = specificCard.startsWith("c_")
      ? specificCard
      : `c_${specificCard}`;

    return `(function()
    for _, consumable_card in pairs(G.consumeables.cards or {}) do
        if consumable_card.config.center.key == "${normalizedCardKey}" then
            return ${hasCondition}
        end
    end
    return ${!hasCondition}
end)()`;
  }

  return null;
};
