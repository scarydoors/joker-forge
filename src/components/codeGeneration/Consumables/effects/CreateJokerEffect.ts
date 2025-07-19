import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";

export const generateCreateJokerReturn = (effect: Effect): EffectReturn => {
  const jokerType = (effect.params?.joker_type as string) || "random";
  const rarity = (effect.params?.rarity as string) || "random";
  const jokerKey = (effect.params?.joker_key as string) || "j_joker";
  const edition = (effect.params?.edition as string) || "none";
  const customMessage = effect.customMessage;

  let createJokerCode = "";

  // Build SMODS.add_card parameters
  let addCardParams = "{ set = 'Joker'";

  if (jokerType === "specific") {
    addCardParams += `, key = '${jokerKey}'`;
  } else if (rarity !== "random") {
    // Map lowercase rarity values to capitalized ones that SMODS expects
    const rarityMap: Record<string, string> = {
      common: "Common",
      uncommon: "Uncommon",
      rare: "Rare",
      legendary: "Legendary",
    };
    const mappedRarity = rarityMap[rarity] || rarity;
    addCardParams += `, rarity = '${mappedRarity}'`;
  }

  addCardParams += " }";

  if (edition !== "none") {
    const editionLua = edition.startsWith("e_")
      ? edition.substring(2)
      : edition;
    createJokerCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    play_sound('timpani')
                    local new_joker = SMODS.add_card(${addCardParams})
                    if new_joker then
                        new_joker:set_edition({ ${editionLua} = true }, true)
                    end
                    used_card:juice_up(0.3, 0.5)
                    return true
                end
            }))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
  } else {
    createJokerCode = `
            __PRE_RETURN_CODE__
            G.E_MANAGER:add_event(Event({
                trigger = 'after',
                delay = 0.4,
                func = function()
                    play_sound('timpani')
                    SMODS.add_card(${addCardParams})
                    used_card:juice_up(0.3, 0.5)
                    return true
                end
            }))
            delay(0.6)
            __PRE_RETURN_CODE_END__`;
  }

  const result: EffectReturn = {
    statement: createJokerCode,
    colour: "G.C.SECONDARY_SET.Tarot",
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};
