import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";

export const generateCreateJokerReturn = (
  effect: Effect,
  triggerType: string,
  modprefix: string
): EffectReturn => {
  const jokerType = (effect.params?.joker_type as string) || "random";
  const rarity = (effect.params?.rarity as string) || "random";
  const jokerKey = (effect.params?.joker_key as string) || "";
  const edition = (effect.params?.edition as string) || "none";
  const customMessage = effect.customMessage;

  const scoringTriggers = ["hand_played", "card_scored"];
  const isScoring = scoringTriggers.includes(triggerType);
  const isNegative = edition === "e_negative";

  // Build SMODS.add_card parameters
  const cardParams = ["set = 'Joker'"];

  if (jokerType === "specific" && jokerKey) {
    cardParams.push(`key = '${jokerKey}'`);
  } else if (rarity !== "random") {
    const rarityMap: Record<string, string> = {
      common: "Common",
      uncommon: "Uncommon",
      rare: "Rare",
      legendary: "Legendary",
    };
    const isVanillaRarity = Object.keys(rarityMap).includes(
      rarity.toLowerCase()
    );
    const finalRarity = isVanillaRarity
      ? rarityMap[rarity.toLowerCase()]
      : modprefix
      ? `${modprefix}_${rarity}`
      : rarity;
    cardParams.push(`rarity = '${finalRarity}'`);
  }

  // Build the creation code

  // Slot limit check (skip for negative edition)
  let slotLimitCode: string;
  if (!isNegative) {
    slotLimitCode = `local created_joker = false
    if #G.jokers.cards + G.GAME.joker_buffer < G.jokers.config.card_limit then
        created_joker = true
        G.GAME.joker_buffer = G.GAME.joker_buffer + 1`;
  } else {
    slotLimitCode = "local created_joker = true";
  }

  const cardCreationCode = `local joker_card = SMODS.add_card({ ${cardParams.join(
              ", "
            )} })`
  const editionCode = edition !== "none" ? `
              if joker_card then
                  joker_card:set_edition("${edition}", true)
              end` : ``;

  if (isScoring) {
    return {
      statement: `__PRE_RETURN_CODE__
                  ${slotLimitCode}
                  G.E_MANAGER:add_event(Event({
                      func = function()
                          ${cardCreationCode}${editionCode}
                          ${!isNegative ? "G.GAME.joker_buffer = 0" : ""}
                          return true
                      end
                  }))
                  ${!isNegative ? "end" : ""}
                __PRE_RETURN_CODE_END__`,
      message: customMessage
        ? `"${customMessage}"`
        : `created_joker and localize('k_plus_joker') or nil`,
      colour: "G.C.BLUE",
    };
  } else {
    return {
      statement: `func = function()
            ${slotLimitCode}
            G.E_MANAGER:add_event(Event({
                func = function()
                    ${cardCreationCode}${editionCode}
                    ${!isNegative ? "G.GAME.joker_buffer = 0" : ""}
                    return true
                end
            }))
            ${!isNegative ? "end" : ""}
            if created_joker then
                card_eval_status_text(context.blueprint_card or card, 'extra', nil, nil, nil, {message = ${
                  customMessage
                    ? `"${customMessage}"`
                    : `localize('k_plus_joker')`
                }, colour = G.C.BLUE})
            end
            return true
        end`,
      colour: "G.C.BLUE",
    };
  }
};
