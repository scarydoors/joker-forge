import type { EffectReturn, ConfigExtraVariable } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";
import {
  generateGameVariableCode,
  parseGameVariable,
  parseRangeVariable,
} from "../gameVariableUtils";

export const generateFixProbabilityReturn = (
  effect: Effect,
  sameTypeCount: number = 0
): EffectReturn => {
  const part = effect.params?.part || "numerator";
  const effectValue = effect.params.value;
  const parsed = parseGameVariable(effectValue);
  const rangeParsed = parseRangeVariable(effectValue);

  let valueCode: string;
  const configVariables: ConfigExtraVariable[] = [];

  const variableName =
    sameTypeCount === 0 ? "set_probability" : `set_probability${sameTypeCount + 1}`;

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
    console.log("please help")
    valueCode = `card.ability.extra.${variableName}`;

    configVariables.push({
      name: variableName,
      value: Number(effectValue) || 1,
    });
  }
  console.log("lll")
  console.log(valueCode)

  const customMessage = effect.customMessage;
  let statement = `
  __PRE_RETURN_CODE__
  `;

  switch (part) {
    case "numerator": {
      const numeratorMessage = customMessage
        ? `"${customMessage}"`
        : null;
        
      statement += `${numeratorMessage ? 
        `card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${numeratorMessage}, colour = G.C.GREEN})`
        : ``}
        numerator = ${valueCode}`;
      break;
    }
    case "denominator": {
      const denominatorMessage = customMessage
        ? `"${customMessage}"`
        : null;

      statement += `${denominatorMessage ? 
        `card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${denominatorMessage}, colour = G.C.GREEN})`
        : ``}
        denominator = ${valueCode}`;
      break;
    }
    case "both": {
      const bothMessage = customMessage
        ? `"${customMessage}"`
        : null;

      statement += `${bothMessage ? 
        `card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${bothMessage}, colour = G.C.GREEN})`
        : ``}
        numerator = ${valueCode}
        denominator = ${valueCode}`;
      break;
    }
    default: {
      const numeratorMessage = customMessage
        ? `"${customMessage}"`
        : null;
        
      statement += `${numeratorMessage ? 
        `card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${numeratorMessage}, colour = G.C.GREEN})`
        : ``}
        numerator = ${valueCode}`;
    }
  }

  statement += `
  __PRE_RETURN_CODE_END__`
  return {
    statement,
    colour: "G.C.GREEN",
    configVariables: configVariables.length > 0 ? configVariables : undefined,
  };
};