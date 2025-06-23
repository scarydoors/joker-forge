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
  const customMessage = effect.customMessage;

  let modificationCode = "";

  if (newRank !== "none" || newSuit !== "none") {
    const suitParam = newSuit !== "none" ? `"${newSuit}"` : "nil";
    const rankParam = newRank !== "none" ? `"${newRank}"` : "nil";
    modificationCode += `
                assert(SMODS.change_base(context.other_card, ${suitParam}, ${rankParam}))`;
  }

  if (newEnhancement === "remove") {
    modificationCode += `
                context.other_card:set_ability(G.P_CENTERS.c_base)`;
  } else if (newEnhancement !== "none") {
    modificationCode += `
                context.other_card:set_ability(G.P_CENTERS.${newEnhancement})`;
  }

  if (newSeal === "remove") {
    modificationCode += `
                context.other_card:set_seal(nil)`;
  } else if (newSeal !== "none") {
    modificationCode += `
                context.other_card:set_seal("${newSeal}", true)`;
  }

  if (newEdition === "remove") {
    modificationCode += `
                context.other_card:set_edition(nil)`;
  } else if (newEdition !== "none") {
    modificationCode += `
                context.other_card:set_edition("${newEdition}", true)`;
  }

  const scoringTriggers = ["card_scored"];
  const isScoring = scoringTriggers.includes(triggerType);

  if (isScoring) {
    return {
      statement: `__PRE_RETURN_CODE__${modificationCode}
                __PRE_RETURN_CODE_END__`,
      message: customMessage ? `"${customMessage}"` : `"Card Modified!"`,
      colour: "G.C.BLUE",
    };
  } else {
    return {
      statement: `func = function()${modificationCode}
                    end`,
      message: customMessage ? `"${customMessage}"` : `"Card Modified!"`,
      colour: "G.C.BLUE",
    };
  }
};
