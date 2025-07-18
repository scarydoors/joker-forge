import type { Rule } from "../../../ruleBuilder/types";

export const generateConsumableHeldConditionCode = (
  rules: Rule[]
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const consumableType = (condition.params.consumable_type as string) || "any";
  const specificCard = (condition.params.specific_card as string) || "any";

  if (consumableType === "any") {
    return `#G.consumeables.cards > 0`;
  }

  // Handle vanilla sets
  if (consumableType === "Tarot") {
    if (specificCard === "any") {
      return `(function()
    for _, consumable_card in pairs(G.consumeables.cards or {}) do
        if consumable_card.ability.set == 'Tarot' then
            return true
        end
    end
    return false
end)()`;
    } else {
      const normalizedCardKey = specificCard.startsWith("c_")
        ? specificCard
        : `c_${specificCard}`;

      return `(function()
    for _, consumable_card in pairs(G.consumeables.cards or {}) do
        if consumable_card.config.center.key == "${normalizedCardKey}" then
            return true
        end
    end
    return false
end)()`;
    }
  }

  if (consumableType === "Planet") {
    if (specificCard === "any") {
      return `(function()
    for _, consumable_card in pairs(G.consumeables.cards or {}) do
        if consumable_card.ability.set == 'Planet' then
            return true
        end
    end
    return false
end)()`;
    } else {
      const normalizedCardKey = specificCard.startsWith("c_")
        ? specificCard
        : `c_${specificCard}`;

      return `(function()
    for _, consumable_card in pairs(G.consumeables.cards or {}) do
        if consumable_card.config.center.key == "${normalizedCardKey}" then
            return true
        end
    end
    return false
end)()`;
    }
  }

  if (consumableType === "Spectral") {
    if (specificCard === "any") {
      return `(function()
    for _, consumable_card in pairs(G.consumeables.cards or {}) do
        if consumable_card.ability.set == 'Spectral' then
            return true
        end
    end
    return false
end)()`;
    } else {
      const normalizedCardKey = specificCard.startsWith("c_")
        ? specificCard
        : `c_${specificCard}`;

      return `(function()
    for _, consumable_card in pairs(G.consumeables.cards or {}) do
        if consumable_card.config.center.key == "${normalizedCardKey}" then
            return true
        end
    end
    return false
end)()`;
    }
  }

  // Handle custom consumable sets
  const setKey = consumableType.includes("_")
    ? consumableType.split("_").slice(1).join("_")
    : consumableType;

  if (specificCard === "any") {
    return `(function()
    for _, consumable_card in pairs(G.consumeables.cards or {}) do
        if consumable_card.ability.set == '${setKey}' or consumable_card.ability.set == '${consumableType}' then
            return true
        end
    end
    return false
end)()`;
  } else {
    const normalizedCardKey = specificCard.startsWith("c_")
      ? specificCard
      : `c_${specificCard}`;

    return `(function()
    for _, consumable_card in pairs(G.consumeables.cards or {}) do
        if consumable_card.config.center.key == "${normalizedCardKey}" then
            return true
        end
    end
    return false
end)()`;
  }
};
