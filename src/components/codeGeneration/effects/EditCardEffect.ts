import type { EffectReturn } from "./AddChipsEffect";
import type { Effect } from "../../ruleBuilder/types";

export const generateEditCardReturn = (
  effect: Effect,
  triggerType: string
): EffectReturn => {
  const newRank = (effect.params?.new_rank as string) || "none";
  const newSuit = (effect.params?.new_suit as string) || "none";
  const newEnhancement = (effect.params?.new_enhancement as string) || "none";
  const newSeal = (effect.params?.new_seal as string) || "none";
  const newEdition = (effect.params?.new_edition as string) || "none";

  // Generate the modification code
  let modificationCode = "";

  // Handle rank and suit changes using SMODS.change_base
  if (newRank !== "none" || newSuit !== "none") {
    const suitParam = newSuit !== "none" ? `"${newSuit}"` : "nil";
    const rankParam = newRank !== "none" ? `"${newRank}"` : "nil";
    modificationCode += `
                -- Change card suit and/or rank
                assert(SMODS.change_base(context.other_card, ${suitParam}, ${rankParam}))`;
  }

  // Handle enhancement changes
  if (newEnhancement === "remove") {
    modificationCode += `
                -- Remove enhancement
                context.other_card:set_ability(G.P_CENTERS.c_base)`;
  } else if (newEnhancement !== "none") {
    modificationCode += `
                -- Set new enhancement
                context.other_card:set_ability(G.P_CENTERS.${newEnhancement})`;
  }

  // Handle seal changes
  if (newSeal === "remove") {
    modificationCode += `
                -- Remove seal
                context.other_card:set_seal(nil)`;
  } else if (newSeal !== "none") {
    modificationCode += `
                -- Set new seal
                context.other_card:set_seal("${newSeal}", true)`;
  }

  // Handle edition changes
  if (newEdition === "remove") {
    modificationCode += `
                -- Remove edition
                context.other_card:set_edition(nil)`;
  } else if (newEdition !== "none") {
    modificationCode += `
                -- Set new edition
                context.other_card:set_edition("${newEdition}", true)`;
  }

  // Define scoring triggers that need different handling
  const scoringTriggers = ["card_scored"];
  const isScoring = scoringTriggers.includes(triggerType);

  if (isScoring) {
    return {
      statement: `__PRE_RETURN_CODE__${modificationCode}
                __PRE_RETURN_CODE_END__`,
      message: `"Card Modified!"`,
      colour: "G.C.BLUE",
    };
  } else {
    return {
      statement: `func = function()${modificationCode}
                    end`,
      message: `"Card Modified!"`,
      colour: "G.C.BLUE",
    };
  }
};
