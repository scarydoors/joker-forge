import type { Rule } from "../../ruleBuilder/types";

export const generateCardEnhancementConditionCode = (
  rules: Rule[]
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const enhancementType = (condition.params.enhancement as string) || "any";

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
