import type { EffectReturn } from "./AddChipsEffect";

export const generateLevelUpHandReturn = (
  triggerType: string = "hand_played"
): EffectReturn => {
  if (triggerType === "hand_discarded") {
    // For hand discarded, we need to get the hand type from highlighted cards like Burnt Joker
    return {
      statement: `__PRE_RETURN_CODE__
                local text, poker_hands, text_disp, loc_disp_text = G.FUNCS.get_poker_hand_info(G.hand.highlighted)
                __PRE_RETURN_CODE_END__level_up = true,
                level_up_hand = text`,
      message: `localize('k_level_up_ex')`,
      colour: "G.C.RED",
    };
  } else {
    // For hand played, we can use context.scoring_name
    return {
      statement: `level_up = true,
                level_up_hand = context.scoring_name`,
      message: `localize('k_level_up_ex')`,
      colour: "G.C.RED",
    };
  }
};
