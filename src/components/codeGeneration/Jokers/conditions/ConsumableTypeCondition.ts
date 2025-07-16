import type { Rule } from "../../../ruleBuilder/types";

const TAROT_CARD_KEYS: Record<string, string> = {
  the_fool: "c_fool",
  the_magician: "c_magician",
  the_high_priestess: "c_high_priestess",
  the_empress: "c_empress",
  the_emperor: "c_emperor",
  the_hierophant: "c_hierophant",
  the_lovers: "c_lovers",
  the_chariot: "c_chariot",
  justice: "c_justice",
  the_hermit: "c_hermit",
  the_wheel_of_fortune: "c_wheel_of_fortune",
  strength: "c_strength",
  the_hanged_man: "c_hanged_man",
  death: "c_death",
  temperance: "c_temperance",
  the_devil: "c_devil",
  the_tower: "c_tower",
  the_star: "c_star",
  the_moon: "c_moon",
  the_sun: "c_sun",
  judgement: "c_judgement",
  the_world: "c_world",
};

const PLANET_CARD_KEYS: Record<string, string> = {
  pluto: "c_pluto",
  mercury: "c_mercury",
  uranus: "c_uranus",
  venus: "c_venus",
  saturn: "c_saturn",
  jupiter: "c_jupiter",
  earth: "c_earth",
  mars: "c_mars",
  neptune: "c_neptune",
  planet_x: "c_planet_x",
  ceres: "c_ceres",
  eris: "c_eris",
};

const SPECTRAL_CARD_KEYS: Record<string, string> = {
  familiar: "c_familiar",
  grim: "c_grim",
  incantation: "c_incantation",
  talisman: "c_talisman",
  aura: "c_aura",
  wraith: "c_wraith",
  sigil: "c_sigil",
  ouija: "c_ouija",
  ectoplasm: "c_ectoplasm",
  immolate: "c_immolate",
  ankh: "c_ankh",
  deja_vu: "c_deja_vu",
  hex: "c_hex",
  trance: "c_trance",
  medium: "c_medium",
  cryptid: "c_cryptid",
  the_soul: "c_soul",
  black_hole: "c_black_hole",
};

export const generateConsumableTypeConditionCode = (
  rules: Rule[]
): string | null => {
  const condition = rules[0].conditionGroups[0].conditions[0];
  const triggerType = rules[0].trigger || "consumable_used";
  const consumableType = (condition.params.consumable_type as string) || "any";

  // Determine the card reference based on trigger type
  const cardRef =
    triggerType === "card_bought" ? "context.card" : "context.consumeable";

  if (consumableType === "any") {
    return `${cardRef} and (${cardRef}.ability.set == 'Tarot' or ${cardRef}.ability.set == 'Planet' or ${cardRef}.ability.set == 'Spectral')`;
  }

  let specificCard = "any";
  if (consumableType === "tarot") {
    specificCard = (condition.params.tarot_card as string) || "any";
  } else if (consumableType === "planet") {
    specificCard = (condition.params.planet_card as string) || "any";
  } else if (consumableType === "spectral") {
    specificCard = (condition.params.spectral_card as string) || "any";
  }

  const setName =
    consumableType === "tarot"
      ? "Tarot"
      : consumableType === "planet"
      ? "Planet"
      : consumableType === "spectral"
      ? "Spectral"
      : "Tarot";

  if (specificCard === "any") {
    return `${cardRef} and ${cardRef}.ability.set == '${setName}'`;
  } else {
    let cardKey = "";

    if (consumableType === "tarot") {
      cardKey = TAROT_CARD_KEYS[specificCard] || "c_fool";
    } else if (consumableType === "planet") {
      cardKey = PLANET_CARD_KEYS[specificCard] || "c_pluto";
    } else if (consumableType === "spectral") {
      cardKey = SPECTRAL_CARD_KEYS[specificCard] || "c_familiar";
    }

    return `${cardRef} and ${cardRef}.ability.set == '${setName}' and ${cardRef}.config.center.key == '${cardKey}'`;
  }
};
