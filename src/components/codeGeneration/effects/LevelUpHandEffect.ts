import type { EffectReturn } from "./AddChipsEffect";
import type { Effect } from "../../ruleBuilder/types";
import { getEffectVariableName } from "../index";

export const generateLevelUpHandReturn = (
  triggerType: string = "hand_played",
  effect?: Effect
): EffectReturn => {
  const customMessage = effect?.customMessage;
  const configVarName = effect
    ? getEffectVariableName(effect.id, "levels")
    : "levels";

  const handSelection = (effect?.params?.hand_selection as string) || "current";
  const specificHand = (effect?.params?.specific_hand as string) || "High Card";

  let handDeterminationCode = "";

  if (handSelection === "specific") {
    handDeterminationCode = `local target_hand = "${specificHand}"`;
  } else if (handSelection === "random") {
    handDeterminationCode = `local available_hands = {}
                for k, v in pairs(G.GAME.hands) do
                    if v.visible and v.level >= 1 then
                        table.insert(available_hands, k)
                    end
                end
                local target_hand = #available_hands > 0 and pseudorandom_element(available_hands, pseudoseed('level_up_hand')) or "High Card"`;
  } else {
    if (triggerType === "hand_discarded") {
      return {
        statement: `__PRE_RETURN_CODE__
                local text, poker_hands, text_disp, loc_disp_text = G.FUNCS.get_poker_hand_info(G.hand.highlighted)
                local target_hand = text
                __PRE_RETURN_CODE_END__level_up = card.ability.extra.${configVarName},
                level_up_hand = target_hand`,
        message: customMessage
          ? `"${customMessage}"`
          : `localize('k_level_up_ex')`,
        colour: "G.C.RED",
      };
    } else {
      return {
        statement: `level_up = card.ability.extra.${configVarName},
                level_up_hand = context.scoring_name`,
        message: customMessage
          ? `"${customMessage}"`
          : `localize('k_level_up_ex')`,
        colour: "G.C.RED",
      };
    }
  }

  if (triggerType === "hand_discarded") {
    return {
      statement: `__PRE_RETURN_CODE__
                ${handDeterminationCode}
                __PRE_RETURN_CODE_END__level_up = card.ability.extra.${configVarName},
                level_up_hand = target_hand`,
      message: customMessage
        ? `"${customMessage}"`
        : `localize('k_level_up_ex')`,
      colour: "G.C.RED",
    };
  } else {
    return {
      statement: `__PRE_RETURN_CODE__
                ${handDeterminationCode}
                __PRE_RETURN_CODE_END__level_up = card.ability.extra.${configVarName},
                level_up_hand = target_hand`,
      message: customMessage
        ? `"${customMessage}"`
        : `localize('k_level_up_ex')`,
      colour: "G.C.RED",
    };
  }
};
