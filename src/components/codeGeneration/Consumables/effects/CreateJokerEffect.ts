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

  // Build SMODS.add_card parameters
  const cardParams = ["set = 'Joker'"];

  if (jokerType === "specific") {
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
  const lines: string[] = [
    "G.E_MANAGER:add_event(Event({",
    "    trigger = 'after',",
    "    delay = 0.4,",
    "    func = function()",
    "        play_sound('timpani')",
  ];

  // Card creation
  if (edition !== "none") {
    lines.push(
      `        local new_joker = SMODS.add_card({ ${cardParams.join(", ")} })`
    );
    lines.push("        if new_joker then");
    const editionLua = edition.startsWith("e_")
      ? edition.substring(2)
      : edition;
    lines.push(
      `            new_joker:set_edition({ ${editionLua} = true }, true)`
    );
    lines.push("        end");
  } else {
    lines.push(`        SMODS.add_card({ ${cardParams.join(", ")} })`);
  }

  lines.push(
    "        used_card:juice_up(0.3, 0.5)",
    "        return true",
    "    end",
    "}))",
    "delay(0.6)"
  );

  const createJokerCode = lines.join("\n              ");

  const result: EffectReturn = {
    statement: `__PRE_RETURN_CODE__
              ${createJokerCode}
              __PRE_RETURN_CODE_END__`,
    colour: "G.C.SECONDARY_SET.Tarot",
  };

  if (customMessage) {
    result.message = `"${customMessage}"`;
  }

  return result;
};
