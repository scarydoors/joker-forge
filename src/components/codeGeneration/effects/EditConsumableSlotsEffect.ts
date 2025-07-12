import type { EffectReturn, ConfigExtraVariable } from "../effectUtils";
import type { Effect } from "../../ruleBuilder/types";
import type { PassiveEffectResult } from "../effectUtils";
import {
  generateGameVariableCode,
  parseGameVariable,
  parseRangeVariable,
} from "../gameVariableUtils";

export const generateEditConsumableSlotsReturn = (
  effect: Effect,
  variableNameMap?: Map<string, string>
): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const effectValue = effect.params.value || 1;
  const parsed = parseGameVariable(effectValue);
  const rangeParsed = parseRangeVariable(effectValue);

  let valueCode: string;
  const configVariables: ConfigExtraVariable[] = [];

  if (parsed.isGameVariable) {
    valueCode = generateGameVariableCode(effectValue);
  } else if (rangeParsed.isRangeVariable) {
    const variableName = "consumable_slots";
    const actualVariableName =
      variableNameMap?.get(variableName) || variableName;
    const seedName = `${actualVariableName}_${effect.id.substring(0, 8)}`;
    valueCode = `pseudorandom('${seedName}', card.ability.extra.${actualVariableName}_min, card.ability.extra.${actualVariableName}_max)`;

    configVariables.push(
      { name: `${actualVariableName}_min`, value: rangeParsed.min || 1 },
      { name: `${actualVariableName}_max`, value: rangeParsed.max || 5 }
    );
  } else if (typeof effectValue === "string") {
    const actualVariableName = variableNameMap?.get(effectValue) || effectValue;
    valueCode = `card.ability.extra.${actualVariableName}`;
  } else {
    const variableName = "consumable_slots";
    const actualVariableName =
      variableNameMap?.get(variableName) || variableName;
    valueCode = `card.ability.extra.${actualVariableName}`;

    configVariables.push({
      name: actualVariableName,
      value: Number(effectValue) || 1,
    });
  }

  const customMessage = effect.customMessage;
  let statement = "";

  switch (operation) {
    case "add": {
      const addMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueCode}).." Consumable Slot"`;
      statement = `func = function()
                G.E_MANAGER:add_event(Event({func = function()
                    G.consumeables.config.card_limit = G.consumeables.config.card_limit + ${valueCode}
                    return true
                end }))
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${addMessage}, colour = G.C.GREEN})
                return true
            end`;
      break;
    }
    case "subtract": {
      const subtractMessage = customMessage
        ? `"${customMessage}"`
        : `"-"..tostring(${valueCode}).." Consumable Slot"`;
      statement = `func = function()
                G.E_MANAGER:add_event(Event({func = function()
                    G.consumeables.config.card_limit = math.max(0, G.consumeables.config.card_limit - ${valueCode})
                    return true
                end }))
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${subtractMessage}, colour = G.C.RED})
                return true
            end`;
      break;
    }
    case "set": {
      const setMessage = customMessage
        ? `"${customMessage}"`
        : `"Set to "..tostring(${valueCode}).." Consumable Slots"`;
      statement = `func = function()
                G.E_MANAGER:add_event(Event({func = function()
                    G.consumeables.config.card_limit = ${valueCode}
                    return true
                end }))
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.BLUE})
                return true
            end`;
      break;
    }
    default: {
      const defaultMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueCode}).." Consumable Slot"`;
      statement = `func = function()
                G.E_MANAGER:add_event(Event({func = function()
                    G.consumeables.config.card_limit = G.consumeables.config.card_limit + ${valueCode}
                    return true
                end }))
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${defaultMessage}, colour = G.C.GREEN})
                return true
            end`;
    }
  }

  return {
    statement,
    colour: "G.C.GREEN",
    configVariables: configVariables.length > 0 ? configVariables : undefined,
  };
};

export const generatePassiveConsumableSlots = (
  effect: Effect
): PassiveEffectResult => {
  const operation = effect.params?.operation || "add";
  const effectValue = effect.params.value;
  const parsed = parseGameVariable(effectValue);
  const rangeParsed = parseRangeVariable(effectValue);

  let valueCode: string;
  let configVariables: string[] = [];

  if (parsed.isGameVariable) {
    valueCode = generateGameVariableCode(effectValue);
  } else if (rangeParsed.isRangeVariable) {
    const variableName = "slot_change";
    valueCode = `pseudorandom('slot_change', card.ability.extra.${variableName}_min, card.ability.extra.${variableName}_max)`;
    configVariables = [
      `${variableName}_min = ${rangeParsed.min}`,
      `${variableName}_max = ${rangeParsed.max}`,
    ];
  } else if (typeof effectValue === "string") {
    valueCode = `card.ability.extra.${effectValue}`;
  } else {
    const variableName = "slot_change";
    valueCode = `card.ability.extra.${variableName}`;
    configVariables = [`${variableName} = ${effectValue}`];
  }

  let addToDeck = "";
  let removeFromDeck = "";

  switch (operation) {
    case "add":
      addToDeck = `G.E_MANAGER:add_event(Event({func = function()
            G.consumeables.config.card_limit = G.consumeables.config.card_limit + ${valueCode}
            return true
        end }))`;
      removeFromDeck = `G.E_MANAGER:add_event(Event({func = function()
            G.consumeables.config.card_limit = G.consumeables.config.card_limit - ${valueCode}
            return true
        end }))`;
      break;
    case "subtract":
      addToDeck = `G.E_MANAGER:add_event(Event({func = function()
            G.consumeables.config.card_limit = math.max(0, G.consumeables.config.card_limit - ${valueCode})
            return true
        end }))`;
      removeFromDeck = `G.E_MANAGER:add_event(Event({func = function()
            G.consumeables.config.card_limit = G.consumeables.config.card_limit + ${valueCode}
            return true
        end }))`;
      break;
    case "set":
      addToDeck = `original_slots = G.consumeables.config.card_limit
        G.E_MANAGER:add_event(Event({func = function()
            G.consumeables.config.card_limit = ${valueCode}
            return true
        end }))`;
      removeFromDeck = `if original_slots then
            G.E_MANAGER:add_event(Event({func = function()
                G.consumeables.config.card_limit = original_slots
                return true
            end }))
        end`;
      break;
    default:
      addToDeck = `G.E_MANAGER:add_event(Event({func = function()
            G.consumeables.config.card_limit = G.consumeables.config.card_limit + ${valueCode}
            return true
        end }))`;
      removeFromDeck = `G.E_MANAGER:add_event(Event({func = function()
            G.consumeables.config.card_limit = G.consumeables.config.card_limit - ${valueCode}
            return true
        end }))`;
  }

  return {
    addToDeck,
    removeFromDeck,
    configVariables,
    locVars:
      parsed.isGameVariable || rangeParsed.isRangeVariable ? [] : [valueCode],
  };
};
