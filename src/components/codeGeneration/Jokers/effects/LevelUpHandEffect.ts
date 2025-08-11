import type { EffectReturn, ConfigExtraVariable } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";
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

  const targetHandVar = sameTypeCount === 0 ? `target_hand` : `target_hand${sameTypeCount + 1}`

  const handSelection = (effect?.params?.hand_selection as string) || "current";
  const specificHand = (effect?.params?.specific_hand as string) || "High Card";
  
  let handDeterminationCode = "";
  switch (handSelection) {
    case ("specific"):
      handDeterminationCode = `${targetHandVar} = "${specificHand}"`;
      break
    case ("random"):
      handDeterminationCode = `
        available_hands = {}
        for hand, value in pairs(G.GAME.hands) do
          if value.visible and value.level >= to_big(1) then
            table.insert(available_hands, hand)
          end
        end
        ${targetHandVar} = #available_hands > 0 and pseudorandom_element(available_hands, pseudoseed('level_up_hand')) or "High Card"
        `;
      break
    case ("most"):
      handDeterminationCode = `
        temp_played = 0
        temp_order = math.huge
        for hand, value in pairs(G.GAME.hands) do 
          if value.played > temp_played and value.visible then
            temp_played = value.played
            temp_order = value.order
            ${targetHandVar} = hand
          else if value.played == temp_played and value.visible then
            if value.order < temp_order then
              temp_order = value.order
              ${targetHandVar} = hand
            end
          end
          end
        end
      `;
      break
    case ("least"):
      handDeterminationCode = `
        temp_played = math.huge
        temp_order = math.huge
        for hand, value in pairs(G.GAME.hands) do 
          if value.played < temp_played and value.visible then
            temp_played = value.played
            temp_order = value.order
            ${targetHandVar} = hand
          else if value.played == temp_played and value.visible then
            if value.order < temp_order then
              temp_order = value.order
              ${targetHandVar} = hand
            end
          end
          end
        end
      `;
      break
    case ("current"):
      if (triggerType === "hand_discarded") {
        handDeterminationCode = `
          text, poker_hands, text_disp, loc_disp_text = G.FUNCS.get_poker_hand_info(G.hand.highlighted)
          ${targetHandVar} = text
        `;
      } else if (triggerType === "hand_played") {
        handDeterminationCode = `${targetHandVar} = context.scoring_name`;
      } else {
        handDeterminationCode = `${targetHandVar} = "High Card"`
      }
      break
  }
  
  return {
    statement: `
      __PRE_RETURN_CODE__
      ${handDeterminationCode}
      __PRE_RETURN_CODE_END__
      level_up = ${valueCode},
      level_up_hand = ${targetHandVar}`,
    message: customMessage ? `${customMessage}` : `localize('k_level_up_ex')`,
    colour: "G.C.RED",
    configVariables: configVariables.length > 0 ? configVariables : undefined
  }
}
