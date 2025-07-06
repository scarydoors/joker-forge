import type { EffectReturn } from "./AddChipsEffect";
import type { Effect } from "../../ruleBuilder/types";

const TAG_TYPES: Record<string, string> = {
  uncommon: "tag_uncommon",
  rare: "tag_rare",
  negative: "tag_negative",
  foil: "tag_foil",
  holo: "tag_holo",
  polychrome: "tag_polychrome",
  investment: "tag_investment",
  voucher: "tag_voucher",
  boss: "tag_boss",
  standard: "tag_standard",
  charm: "tag_charm",
  meteor: "tag_meteor",
  buffoon: "tag_buffoon",
  handy: "tag_handy",
  garbage: "tag_garbage",
  ethereal: "tag_ethereal",
  coupon: "tag_coupon",
  double: "tag_double",
  juggle: "tag_juggle",
  d_six: "tag_d_six",
  top_up: "tag_top_up",
  speed: "tag_speed",
  orbital: "tag_orbital",
  economy: "tag_economy",
};

export const generateCreateTagReturn = (
  effect: Effect,
  triggerType: string
): EffectReturn => {
  const tagType = (effect.params?.tag_type as string) || "random";
  const specificTag = (effect.params?.specific_tag as string) || "double";
  const customMessage = effect.customMessage;

  const scoringTriggers = ["hand_played", "card_scored"];
  const isScoring = scoringTriggers.includes(triggerType);

  let tagCreationCode = "";

  if (tagType === "random") {
    tagCreationCode = `
            G.E_MANAGER:add_event(Event({
                func = function()
                    local selected_tag = pseudorandom_element(G.P_TAGS, pseudoseed("create_tag")).key
                    local tag = Tag(selected_tag)
                    tag:set_ability()
                    add_tag(tag)
                    play_sound('holo1', 1.2 + math.random() * 0.1, 0.4)
                    return true
                end
            }))`;
  } else {
    const tagKey = TAG_TYPES[specificTag] || "tag_double";
    tagCreationCode = `
            G.E_MANAGER:add_event(Event({
                func = function()
                    local tag = Tag("${tagKey}")
                    tag:set_ability()
                    add_tag(tag)
                    play_sound('holo1', 1.2 + math.random() * 0.1, 0.4)
                    return true
                end
            }))`;
  }

  if (isScoring) {
    return {
      statement: `__PRE_RETURN_CODE__${tagCreationCode}
                __PRE_RETURN_CODE_END__`,
      message: customMessage ? `"${customMessage}"` : `"Created Tag!"`,
      colour: "G.C.GREEN",
    };
  } else {
    return {
      statement: `func = function()${tagCreationCode}
                    return true
                end`,
      message: customMessage ? `"${customMessage}"` : `"Created Tag!"`,
      colour: "G.C.GREEN",
    };
  }
};
