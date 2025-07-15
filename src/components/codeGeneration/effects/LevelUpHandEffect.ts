import type { EffectReturn, ConfigExtraVariable } from "../effectUtils";
import type { Effect } from "../../ruleBuilder/types";
import {
  generateGameVariableCode,
  parseGameVariable,
  parseRangeVariable,
} from "../gameVariableUtils";

export const generateLevelUpHandReturn = (
  triggerType: string = "hand_played",
  effect?: Effect,
  sameTypeCount: number = 0
): EffectReturn => {
  const customMessage = effect?.customMessage;
  let valueCode: string;
  const configVariables: ConfigExtraVariable[] = [];

  if (effect) {
    const effectValue = effect.params.value;
    const parsed = parseGameVariable(effectValue);
    const rangeParsed = parseRangeVariable(effectValue);

    const variableName =
      sameTypeCount === 0 ? "levels" : `levels${sameTypeCount + 1}`;

    if (parsed.isGameVariable) {
      valueCode = generateGameVariableCode(effectValue);
    } else if (rangeParsed.isRangeVariable) {
      const seedName = `${variableName}_${effect.id.substring(0, 8)}`;
      valueCode = `pseudorandom('${seedName}', card.ability.extra.${variableName}_min, card.ability.extra.${variableName}_max)`;

      configVariables.push(
        { name: `${variableName}_min`, value: rangeParsed.min || 1 },
        { name: `${variableName}_max`, value: rangeParsed.max || 5 }
      );
    } else if (typeof effectValue === "string") {
      valueCode = `card.ability.extra.${effectValue}`;
    } else {
      valueCode = `card.ability.extra.${variableName}`;

      configVariables.push({
        name: variableName,
        value: Number(effectValue) || 1,
      });
    }
  } else {
    valueCode = "card.ability.extra.levels";
  }

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
                __PRE_RETURN_CODE_END__level_up = ${valueCode},
                level_up_hand = target_hand`,
        message: customMessage
          ? `"${customMessage}"`
          : `localize('k_level_up_ex')`,
        colour: "G.C.RED",
        configVariables:
          configVariables.length > 0 ? configVariables : undefined,
      };
    } else {
      return {
        statement: `level_up = ${valueCode},
                level_up_hand = context.scoring_name`,
        message: customMessage
          ? `"${customMessage}"`
          : `localize('k_level_up_ex')`,
        colour: "G.C.RED",
        configVariables:
          configVariables.length > 0 ? configVariables : undefined,
      };
    }
  }

  if (triggerType === "hand_discarded") {
    return {
      statement: `__PRE_RETURN_CODE__
                ${handDeterminationCode}
                __PRE_RETURN_CODE_END__level_up = ${valueCode},
                level_up_hand = target_hand`,
      message: customMessage
        ? `"${customMessage}"`
        : `localize('k_level_up_ex')`,
      colour: "G.C.RED",
      configVariables: configVariables.length > 0 ? configVariables : undefined,
    };
  } else {
    return {
      statement: `__PRE_RETURN_CODE__
                ${handDeterminationCode}
                __PRE_RETURN_CODE_END__level_up = ${valueCode},
                level_up_hand = target_hand`,
      message: customMessage
        ? `"${customMessage}"`
        : `localize('k_level_up_ex')`,
      colour: "G.C.RED",
      configVariables: configVariables.length > 0 ? configVariables : undefined,
    };
  }
};
