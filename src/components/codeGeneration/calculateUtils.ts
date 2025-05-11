import { JokerData } from "../JokerCard";
import type { Rule } from "../ruleBuilder/types";
import { generateEffectReturnStatement } from "./effectUtils";

// Function to generate the main calculate function combining all conditions
export const generateCalculateFunction = (
  joker: JokerData,
  rules: Rule[],
  conditionFunctions: string[]
): string => {
  if (!rules || rules.length === 0) {
    // If no rules, generate a simple calculate function with no conditions
    return `calculate = function(self, card, context)
    if context.joker_main then
        -- Simple effect with no conditions
        ${generateReturnFromEffectUtils()}
    end
end`;
  }

  // Get all effect types from rules
  const effectTypes: string[] = [];
  rules.forEach((rule) => {
    rule.effects.forEach((effect) => {
      if (!effectTypes.includes(effect.type)) {
        effectTypes.push(effect.type);
      }
    });
  });

  // Get return statement from effectUtils
  const { statement: returnStatement, colour } =
    generateEffectReturnStatement(effectTypes);

  // Build the condition checking part
  let conditionChecks = "";

  if (conditionFunctions.length === 0) {
    // No condition functions, always trigger
    conditionChecks = "true";
  } else if (conditionFunctions.length === 1) {
    // One condition function, just call it
    conditionChecks = `${conditionFunctions[0]}(context)`;
  } else {
    // Multiple condition functions, combine with AND
    conditionChecks = conditionFunctions
      .map((fn) => `${fn}(context)`)
      .join(" and ");
  }

  // Generate final calculate function
  return `calculate = function(self, card, context)
    -- Main scoring time for jokers
    if context.cardarea == G.jokers and context.joker_main then
        -- Check all conditions
        if ${conditionChecks} then
            return {${returnStatement},
                colour = ${colour}
            }
        end
    end
end`;
};

// Helper function that uses effectUtils to get a return statement
const generateReturnFromEffectUtils = (): string => {
  // Just return a simple activation message if no effects
  const { statement, colour } = generateEffectReturnStatement([]);

  return `return {${statement},
            colour = ${colour}
        }`;
};
