import type { EffectReturn } from "./AddChipsEffect";
import type { Effect } from "../../ruleBuilder/types";

export const generateLevelUpHandReturn = (
  triggerType: string = "hand_played",
  effect?: Effect
): EffectReturn => {
  const customMessage = effect?.customMessage;

  if (triggerType === "hand_discarded") {
    return {
      statement: `__PRE_RETURN_CODE__
                local text, poker_hands, text_disp, loc_disp_text = G.FUNCS.get_poker_hand_info(G.hand.highlighted)
                __PRE_RETURN_CODE_END__level_up = true,
                level_up_hand = text`,
      message: customMessage
        ? `"${customMessage}"`
        : `localize('k_level_up_ex')`,
      colour: "G.C.RED",
    };
  } else {
    return {
      statement: `level_up = true,
                level_up_hand = context.scoring_name`,
      message: customMessage
        ? `"${customMessage}"`
        : `localize('k_level_up_ex')`,
      colour: "G.C.RED",
    };
  }
};
