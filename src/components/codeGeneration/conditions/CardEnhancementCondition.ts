import type { Rule, Condition } from "../../ruleBuilder/types";

export const generateCardEnhancementConditionCode = (
  rules: Rule[]
): string | null => {
  // Filter rules related to card enhancements
  const enhancementRules = rules?.filter((rule) => {
    return rule.conditionGroups.some((group) =>
      group.conditions.some(
        (condition) => condition.type === "card_enhancement"
      )
    );
  });

  if (!enhancementRules || enhancementRules.length === 0) {
    return null;
  }

  // Find the first enhancement condition in any rule condition group
  let enhancementCondition: Condition | undefined;

  for (const rule of enhancementRules) {
    for (const group of rule.conditionGroups) {
      const condition = group.conditions.find(
        (c) => c.type === "card_enhancement"
      );
      if (condition) {
        enhancementCondition = condition;
        break;
      }
    }
    if (enhancementCondition) break;
  }

  if (!enhancementCondition) {
    return null;
  }

  // Extract enhancement params
  const params = enhancementCondition.params;
  const enhancementType = (params.enhancement as string) || "any";

  // Generate enhancement check code
  if (enhancementType === "any") {
    return `(function()
        local enhancements = SMODS.get_enhancements(context.other_card)
        for k, v in pairs(enhancements) do
            if v then
                return true
            end
        end
        return false
    end)()`;
  } else {
    return `SMODS.get_enhancements(context.other_card)["${enhancementType}"] == true`;
  }
};
