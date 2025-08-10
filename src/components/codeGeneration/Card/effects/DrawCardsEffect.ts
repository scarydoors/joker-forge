import type { Effect } from "../../../ruleBuilder/types";
import {
  generateGameVariableCode,
  parseGameVariable,
  parseRangeVariable,
} from "../../Jokers/gameVariableUtils";
import type { EffectReturn, ConfigExtraVariable } from "../effectUtils";

export const generateDrawCardsReturn = (
  effect: Effect,
  sameTypeCount: number = 0
): EffectReturn => {
  const effectValue = effect.params?.value || 1;
  const parsed = parseGameVariable(effectValue);
  const rangeParsed = parseRangeVariable(effectValue);

  let valueCode: string;
  const configVariables: ConfigExtraVariable[] = [];

  const variableName =
    sameTypeCount === 0 ? "card_draw" : `card_draw${sameTypeCount + 1}`;

  if (parsed.isGameVariable) {
    valueCode = generateGameVariableCode(effectValue as string);
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

  const customMessage = effect.customMessage;

  const result: EffectReturn = {
    statement: `__PRE_RETURN_CODE__
  if G.GAME.blind.in_blind then
    SMODS.draw_cards(${valueCode})
  end__PRE_RETURN_CODE_END__`,
    message: customMessage
      ? `"${customMessage}"`
      : `"+"..tostring(${valueCode}).." Cards Drawn"`,
    colour: "G.C.BLUE",
    configVariables:
      configVariables.length > 0
        ? configVariables.map((cv) => `${cv.name} = ${cv.value}`)
        : undefined,
  };

  return result;
};
