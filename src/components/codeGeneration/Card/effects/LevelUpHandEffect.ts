import type { Effect } from "../../../ruleBuilder/types";
import {
  generateGameVariableCode,
  parseGameVariable,
  parseRangeVariable,
} from "../../Jokers/gameVariableUtils";
import type { EffectReturn } from "../effectUtils";

interface ConfigExtraVariable {
  name: string;
  value: number;
}

export const generateLevelUpHandReturn = (
  effect: Effect,
  sameTypeCount: number = 0
): EffectReturn => {
  const customMessage = effect?.customMessage;
  const effectValue = effect.params?.value || 1;
  const parsed = parseGameVariable(effectValue);
  const rangeParsed = parseRangeVariable(effectValue);

  let valueCode: string;
  const configVariables: ConfigExtraVariable[] = [];

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
    if (effectValue.endsWith("_value")) {
      valueCode = effectValue;
    } else {
      valueCode = `card.ability.extra.${effectValue}`;
    }
  } else {
    valueCode = `card.ability.extra.${variableName}`;

    configVariables.push({
      name: variableName,
      value: Number(effectValue) || 1,
    });
  }

  const targetHandVar =
    sameTypeCount === 0 ? `target_hand` : `target_hand${sameTypeCount + 1}`;

  const handSelection = (effect?.params?.hand_selection as string) || "current";
  const specificHand = (effect?.params?.specific_hand as string) || "High Card";

  let handDeterminationCode = "";
  switch (handSelection) {
    case "specific":
      handDeterminationCode = `${targetHandVar} = "${specificHand}"`;
      break;
    case "random":
      handDeterminationCode = `
                local available_hands = {}
                for hand, value in pairs(G.GAME.hands) do
                  if value.visible and value.level >= 1 then
                    table.insert(available_hands, hand)
                  end
                end
                ${targetHandVar} = #available_hands > 0 and pseudorandom_element(available_hands, pseudoseed('level_up_hand_enhanced')) or "High Card"`;
      break;
    case "most":
      handDeterminationCode = `
                local temp_played = 0
                local temp_order = math.huge
                for hand, value in pairs(G.GAME.hands) do 
                  if value.played > temp_played and value.visible then
                    temp_played = value.played
                    temp_order = value.order
                    ${targetHandVar} = hand
                  elseif value.played == temp_played and value.visible then
                    if value.order < temp_order then
                      temp_order = value.order
                      ${targetHandVar} = hand
                    end
                  end
                end`;
      break;
    case "least":
      handDeterminationCode = `
                local temp_played = math.huge
                local temp_order = math.huge
                for hand, value in pairs(G.GAME.hands) do 
                  if value.played < temp_played and value.visible then
                    temp_played = value.played
                    temp_order = value.order
                    ${targetHandVar} = hand
                  elseif value.played == temp_played and value.visible then
                    if value.order < temp_order then
                      temp_order = value.order
                      ${targetHandVar} = hand
                    end
                  end
                end`;
      break;
    case "current":
      handDeterminationCode = `${targetHandVar} = context.scoring_name or "High Card"`;
      break;
  }

  return {
    statement: `__PRE_RETURN_CODE__
                local ${targetHandVar}
                ${handDeterminationCode}
                __PRE_RETURN_CODE_END__
                level_up = ${valueCode},
                level_up_hand = ${targetHandVar}`,
    message: customMessage ? `"${customMessage}"` : `localize('k_level_up_ex')`,
    colour: "G.C.RED",
    configVariables:
      configVariables.length > 0
        ? configVariables.map((cv) => `${cv.name} = ${cv.value}`)
        : undefined,
  };
};
