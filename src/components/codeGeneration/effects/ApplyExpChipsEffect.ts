import type { EffectReturn } from "./AddChipsEffect";
import type { Effect } from "../../ruleBuilder/types";
import { getEffectVariableName } from "../index";
import {
  generateGameVariableCode,
  parseGameVariable,
} from "../gameVariableUtils";

export const generateApplyExpChipsReturn = (
  triggerType: string,
  effect: Effect
): EffectReturn => {
  const effectValue = effect.params.value;
  const parsed = parseGameVariable(effectValue);

  let valueCode: string;

  if (parsed.isGameVariable) {
    valueCode = generateGameVariableCode(effectValue);
  } else if (typeof effectValue === "string") {
    valueCode = `card.ability.extra.${effectValue}`;
  } else {
    const variableName = getEffectVariableName(effect.id, "echips");
    valueCode = `card.ability.extra.${variableName}`;
  }

  const customMessage = effect.customMessage;
  const messageCode = customMessage
    ? `"${customMessage}"`
    : `"^" .. ${valueCode} .. " Chips!"`;

  switch (triggerType) {
    case "card_scored":
    case "card_held_in_hand":
      return {
        statement: `e_chips = ${valueCode}`,
        message: messageCode,
        colour: "G.C.DARK_EDITION",
      };

    case "hand_played":
    default:
      return {
        statement: `e_chips = ${valueCode}`,
        message: messageCode,
        colour: "G.C.DARK_EDITION",
      };
  }
};
