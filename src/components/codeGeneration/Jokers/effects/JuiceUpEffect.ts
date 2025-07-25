import type { EffectReturn, ConfigExtraVariable } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";
import {
  generateGameVariableCode,
  parseGameVariable,
  parseRangeVariable,
} from "../gameVariableUtils";

export const generateJuiceUpReturn = (
  effect: Effect,
  sameTypeCount: number = 0,
  effectType: string,
): EffectReturn => {
  const mode = effect.params?.mode || "onetime";

  const effectScale = effect.params.scale;
  const scaleParsed = parseGameVariable(effectScale);
  const scaleRangeParsed = parseRangeVariable(effectScale);

  const configVariables: ConfigExtraVariable[] = [];
  let scaleValueCode: string;

  const scaleVariableName =
    sameTypeCount === 0 ? "scale" : `scale${sameTypeCount + 1}`;

  if (scaleParsed.isGameVariable) {
    scaleValueCode = generateGameVariableCode(effectScale);
  } else if (scaleRangeParsed.isRangeVariable) {
    const seedName = `${scaleVariableName}_${effect.id.substring(0, 8)}`;
    scaleValueCode = `pseudorandom('${seedName}', card.ability.extra.${scaleVariableName}_min, card.ability.extra.${scaleVariableName}_max)`;

    configVariables.push(
      { name: `${scaleVariableName}_min`, value: scaleRangeParsed.min || 1 },
      { name: `${scaleVariableName}_max`, value: scaleRangeParsed.max || 5 }
    );
  } else if (typeof effectScale === "string") {
    scaleValueCode = `card.ability.extra.${effectScale}`;
  } else {
    scaleValueCode = `card.ability.extra.${scaleVariableName}`;

    configVariables.push({
      name: scaleVariableName,
      value: Number(effectScale) || 1,
    });
  }


  let rotationValueCode: string;
  const effectRotation = effect.params.rotation;
  const rotationParsed = parseGameVariable(effectRotation);
  const rotationRangeParsed = parseRangeVariable(effectRotation);

  const rotationVariableName =
    sameTypeCount === 0 ? "rotation" : `rotation${sameTypeCount + 1}`;

  if (rotationParsed.isGameVariable) {
    rotationValueCode = generateGameVariableCode(effectRotation);
  } else if (rotationRangeParsed.isRangeVariable) {
    const seedName = `${scaleVariableName}_${effect.id.substring(0, 8)}`;
    rotationValueCode = `pseudorandom('${seedName}', card.ability.extra.${rotationVariableName}_min, card.ability.extra.${rotationVariableName}_max)`;

    configVariables.push(
      { name: `${rotationVariableName}_min`, value: rotationRangeParsed.min || 1 },
      { name: `${rotationVariableName}_max`, value: rotationRangeParsed.max || 5 }
    );
  } else if (typeof effectRotation === "string") {
    rotationValueCode = `card.ability.extra.${effectRotation}`;
  } else {
    rotationValueCode = `card.ability.extra.${rotationVariableName}`;

    configVariables.push({
      name: rotationVariableName,
      value: Number(effectRotation) ?? 1,
    });
  }

  let cardType: string;
  if (effectType == "card") {
    cardType = "target_card"
  } else {
    cardType = "card"
  }

  let statement = `__PRE_RETURN_CODE__
      local target_card = context.other_card`;

  if (mode === "constant") {
      statement += `
      local function juice_card_until_(card, eval_func, first, delay) -- balatro function doesn't allow for custom scale and rotation
          G.E_MANAGER:add_event(Event({
              trigger = 'after',delay = delay or 0.1, blocking = false, blockable = false, timer = 'REAL',
              func = (function() if eval_func(card) then if not first or first then ${cardType}:juice_up(${scaleValueCode}, ${rotationValueCode}) end;juice_card_until_(card, eval_func, nil, 0.8) end return true end)
          }))
      end`
  }
  
  statement += `
  __PRE_RETURN_CODE_END__`

  switch (mode) {
    case "constant":
      statement += `func = function()
                        local eval = function() return not G.RESET_JIGGLES end
                        juice_card_until_(card, eval, true)
                        return true
                    end`;
      break;
    case "onetime":
      statement += `func = function()
                      ${cardType}:juice_up(${scaleValueCode}, ${rotationValueCode})
                      return true
                    end`;
      break;
  }

  return {
    statement,
    colour: "G.C.WHITE",
    configVariables
  }
}
