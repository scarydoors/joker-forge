import type { EffectReturn, ConfigExtraVariable } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";
import type { PassiveEffectResult } from "../effectUtils";
import {
  generateGameVariableCode,
  parseGameVariable,
  parseRangeVariable,
} from "../gameVariableUtils";

export const generateEditDiscardReturn = (
  effect: Effect,
  sameTypeCount: number = 0
): EffectReturn => {
  const operation = effect.params?.operation || "add";
  const duration = effect.params?.duration || "permanent";
  const effectValue = effect.params.value;
  const parsed = parseGameVariable(effectValue);
  const rangeParsed = parseRangeVariable(effectValue);

  let valueCode: string;
  const configVariables: ConfigExtraVariable[] = [];

  const variableName =
    sameTypeCount === 0 ? "discards" : `discards${sameTypeCount + 1}`;

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
      value: Number(effectValue),
    });
  }

  const customMessage = effect.customMessage;
  let statement = "";

  let editDiscardCode = "";

  switch (operation) {
    case "add": {
      if (duration === "permanent") {
        editDiscardCode = `
        G.GAME.round_resets.discards = G.GAME.round_resets.discards + ${valueCode}
        ease_discard(${valueCode})
        `;
      } else if (duration === "round") {
        editDiscardCode = `G.GAME.current_round.discards_left = G.GAME.current_round.discards_left + ${valueCode}`;
      }
      const addMessage = customMessage
        ? `"${customMessage}"`
        : `"+"..tostring(${valueCode}).." Discard"`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${addMessage}, colour = G.C.ORANGE})
                ${editDiscardCode}
                return true
            end`;
      break;
    }
    case "subtract": {
      if (duration === "permanent") {
        editDiscardCode = `
        G.GAME.round_resets.discards = G.GAME.round_resets.discards - ${valueCode}
        ease_discard(-${valueCode})
        `;
      } else if (duration === "round") {
        editDiscardCode = `G.GAME.current_round.discards_left = G.GAME.current_round.discards_left - ${valueCode}`;
      }
      const subtractMessage = customMessage
        ? `"${customMessage}"`
        : `"-"..tostring(${valueCode}).." Discard"`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${subtractMessage}, colour = G.C.RED})
                ${editDiscardCode}
                return true
            end`;
      break;
    }
    case "set": {
      if (duration === "permanent") {
        editDiscardCode = `
        G.GAME.round_resets.discards = ${valueCode}
        ease_discard(${valueCode} - G.GAME.current_round.discards_left)
        `;
      } else if (duration === "round") {
        editDiscardCode = `G.GAME.current_round.discards_left = ${valueCode}`;
      }
      const setMessage = customMessage
        ? `"${customMessage}"`
        : `"Set to "..tostring(${valueCode}).." Discards"`;
      statement = `func = function()
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${setMessage}, colour = G.C.BLUE})
                ${editDiscardCode}
                G.GAME.round_resets.hands = ${
                  duration === "permanent"
                    ? valueCode
                    : "G.GAME.round_resets.hands"
                }
                return true
            end`;
      break;
    }
  }

  return {
    statement,
    colour: "G.C.ORANGE",
    configVariables: configVariables.length > 0 ? configVariables : undefined,
  };
};

export const generatePassiveDiscard = (effect: Effect): PassiveEffectResult => {
  const operation = effect.params?.operation || "add";
  const effectValue = effect.params.value;
  const parsed = parseGameVariable(effectValue);
  const rangeParsed = parseRangeVariable(effectValue);

  let valueCode: string;
  let configVariables: string[] = [];

  if (parsed.isGameVariable) {
    valueCode = generateGameVariableCode(effectValue);
  } else if (rangeParsed.isRangeVariable) {
    const variableName = "discard_change";
    valueCode = `pseudorandom('discard_change', card.ability.extra.${variableName}_min, card.ability.extra.${variableName}_max)`;
    configVariables = [
      `${variableName}_min = ${rangeParsed.min}`,
      `${variableName}_max = ${rangeParsed.max}`,
    ];
  } else if (typeof effectValue === "string") {
    valueCode = `card.ability.extra.${effectValue}`;
  } else {
    const variableName = "discard_change";
    valueCode = `card.ability.extra.${variableName}`;
    configVariables = [`${variableName} = ${effectValue}`];
  }

  let addToDeck = "";
  let removeFromDeck = "";

  switch (operation) {
    case "add":
      addToDeck = `G.GAME.round_resets.discards = G.GAME.round_resets.discards + ${valueCode}`;
      removeFromDeck = `G.GAME.round_resets.discards = G.GAME.round_resets.discards - ${valueCode}`;
      break;
    case "subtract":
      addToDeck = `G.GAME.round_resets.discards = math.max(0, G.GAME.round_resets.discards - ${valueCode})`;
      removeFromDeck = `G.GAME.round_resets.discards = G.GAME.round_resets.discards + ${valueCode}`;
      break;
    case "set":
      addToDeck = `card.ability.extra.original_discards = G.GAME.round_resets.discards
        G.GAME.round_resets.discards = ${valueCode}`;
      removeFromDeck = `if card.ability.extra.original_discards then
            G.GAME.round_resets.discards = card.ability.extra.original_discards
        end`;
      break;
    default:
      addToDeck = `G.GAME.round_resets.discards = G.GAME.round_resets.discards + ${valueCode}`;
      removeFromDeck = `G.GAME.round_resets.discards = G.GAME.round_resets.discards - ${valueCode}`;
  }

  return {
    addToDeck,
    removeFromDeck,
    configVariables,
    locVars:
      parsed.isGameVariable || rangeParsed.isRangeVariable ? [] : [valueCode],
  };
};
