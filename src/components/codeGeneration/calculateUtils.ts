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
        ${generateReturnFromEffectUtils(joker)}
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

  // If no effects found in rules, add defaults based on joker properties
  if (effectTypes.length === 0) {
    if (joker.chipAddition > 0) effectTypes.push("add_chips");
    if (joker.multAddition > 0) effectTypes.push("add_mult");
    if (joker.xMult > 1) effectTypes.push("apply_x_mult");
  }

  // Get return statement from effectUtils
  const { statement: returnStatement, colour } = generateEffectReturnStatement(
    joker,
    effectTypes
  );

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
const generateReturnFromEffectUtils = (joker: JokerData): string => {
  const effectTypes: string[] = [];

  if (joker.chipAddition > 0) effectTypes.push("add_chips");
  if (joker.multAddition > 0) effectTypes.push("add_mult");
  if (joker.xMult > 1) effectTypes.push("apply_x_mult");

  const { statement, colour } = generateEffectReturnStatement(
    joker,
    effectTypes
  );

  return `return {${statement},
            colour = ${colour}
        }`;
};
