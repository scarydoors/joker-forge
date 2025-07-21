import type { Effect } from "../../../ruleBuilder/types";
import type { EffectReturn } from "../effectUtils";

export const generateCreateJokerReturn = (
  effect: Effect,
  modprefix: string
): EffectReturn => {
  const jokerType = (effect.params?.joker_type as string) || "random";
  const rarity = (effect.params?.rarity as string) || "random";
  const jokerKey = (effect.params?.joker_key as string) || "j_joker";
  const edition = (effect.params?.edition as string) || "none";
  const customMessage = effect.customMessage;

  let createJokerCode = "";

  if (jokerType === "specific") {
    const editionCode =
      edition !== "none"
        ? `\n                      new_joker:set_edition({ ${
            edition.startsWith("e_") ? edition.substring(2) : edition
          } = true }, true)`
        : "";

    createJokerCode = `
              __PRE_RETURN_CODE__
              G.E_MANAGER:add_event(Event({
                  trigger = 'after',
                  delay = 0.4,
                  func = function()
                      play_sound('timpani')
                      local new_joker = create_card('Joker', G.jokers, nil, nil, nil, nil, '${jokerKey}')${editionCode}
                      new_joker:add_to_deck()
                      G.jokers:emplace(new_joker)
                      used_card:juice_up(0.3, 0.5)
                      return true
                  end
              }))
              delay(0.6)
              __PRE_RETURN_CODE_END__`;
  } else if (rarity === "random") {
    const editionCode =
      edition !== "none"
        ? `\n                      new_joker:set_edition({ ${
            edition.startsWith("e_") ? edition.substring(2) : edition
          } = true }, true)`
        : "";

    createJokerCode = `
              __PRE_RETURN_CODE__
              G.E_MANAGER:add_event(Event({
                  trigger = 'after',
                  delay = 0.4,
                  func = function()
                      play_sound('timpani')
                      local new_joker = create_card('Joker', G.jokers, nil, nil, nil, nil, nil, 'joker_create_random')${editionCode}
                      new_joker:add_to_deck()
                      G.jokers:emplace(new_joker)
                      used_card:juice_up(0.3, 0.5)
                      return true
                  end
              }))
              delay(0.6)
              __PRE_RETURN_CODE_END__`;
  } else {
    const normalizedRarity = rarity.toLowerCase();
    const rarityMap: Record<string, string> = {
      common: "Common",
      uncommon: "Uncommon",
      rare: "Rare",
      legendary: "Legendary",
    };
    const isVanillaRarity = Object.keys(rarityMap).includes(normalizedRarity);
    let finalRarity = "";

    if (isVanillaRarity) {
      finalRarity = rarityMap[normalizedRarity];
    } else {
      finalRarity = modprefix ? `${modprefix}_${rarity}` : rarity;
    }

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
                      local new_joker = SMODS.add_card({ set = 'Joker', rarity = '${finalRarity}' })
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
                      SMODS.add_card({ set = 'Joker', rarity = '${finalRarity}' })
                      used_card:juice_up(0.3, 0.5)
                      return true
                  end
              }))
              delay(0.6)
              __PRE_RETURN_CODE_END__`;
    }
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
