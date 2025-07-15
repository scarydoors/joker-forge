import { JokerData } from "../JokerCard";
import JSZip from "jszip";
import { addAtlasToZip } from "./ImageProcessor";
import { generateTriggerContext } from "./triggerUtils";
import { generateConditionChain } from "./conditionUtils";
import {
  generateEffectReturnStatement,
  processPassiveEffects,
  ConfigExtraVariable,
} from "./effectUtils";
import {
  extractVariablesFromRules,
  generateVariableConfig,
  getAllVariables,
  extractGameVariablesFromRules,
} from "./variableUtils";
import type { Rule } from "../ruleBuilder/types";
import type { PassiveEffectResult } from "./effectUtils";
import { generateDiscountItemsHook } from "./effects/DiscountItemsEffect";
import { generateReduceFlushStraightRequirementsHook } from "./effects/ReduceFlushStraightRequirementsEffect";
import { generateShortcutHook } from "./effects/ShortcutEffect";
import { generateShowmanHook } from "./effects/ShowmanEffect";
import { generateCombineRanksHook } from "./effects/CombineRanksEffect";
import { generateCombineSuitsHook } from "./effects/CombineSuitsEffect";
import {
  getRankId,
  getSuitByValue,
  getRankByValue,
} from "../data/BalatroUtils";
import { slugify } from "../EditJokerInfo";
import { RarityData } from "../pages/RaritiesPage";

export interface ModMetadata {
  id: string;
  name: string;
  author: string[];
  description: string;
  prefix: string;
  main_file: string;
  version: string;
  priority: number;
  badge_colour: string;
  badge_text_colour: string;
  display_name: string;
  dependencies: string[];
  conflicts: string[];
  provides: string[];
  dump_loc?: boolean;
}

interface CalculateFunctionResult {
  code: string;
  configVariables: ConfigExtraVariable[];
}

const ensureJokerKeys = (jokers: JokerData[]): JokerData[] => {
  return jokers.map((joker) => ({
    ...joker,
    jokerKey: joker.jokerKey || slugify(joker.name),
  }));
};

const convertRandomGroupsForCodegen = (
  randomGroups: import("../ruleBuilder/types").RandomGroup[]
) => {
  return randomGroups.map((group) => ({
    ...group,
    chance_numerator:
      typeof group.chance_numerator === "string" ? 1 : group.chance_numerator,
    chance_denominator:
      typeof group.chance_denominator === "string"
        ? 1
        : group.chance_denominator,
  }));
};

const generateCustomRaritiesCode = (customRarities: RarityData[]): string => {
  if (customRarities.length === 0) {
    return "";
  }

  let output = "";

  customRarities.forEach((rarity) => {
    const hexColor = rarity.badge_colour.startsWith("#")
      ? rarity.badge_colour
      : `#${rarity.badge_colour}`;

    output += `SMODS.Rarity {
    key = "${rarity.key}",
    pools = {
        ["Joker"] = true
    },
    default_weight = ${rarity.default_weight},
    badge_colour = HEX('${hexColor.substring(1)}'),
    loc_txt = {
        name = "${rarity.name}"
    },
    get_weight = function(self, weight, object_type)
        return weight
    end,
}

`;
  });

  return output.trim();
};

const generateSingleJokerCode = (
  joker: JokerData,
  atlasKey: string,
  currentPosition: number
): { code: string; nextPosition: number } => {
  const passiveEffects = processPassiveEffects(joker);
  const nonPassiveRules =
    joker.rules?.filter((rule) => rule.trigger !== "passive") || [];

  let calculateResult: CalculateFunctionResult | null = null;
  if (nonPassiveRules.length > 0) {
    calculateResult = generateCalculateFunction(nonPassiveRules, joker);
  }

  const configItems: string[] = [];
  const variableNameCounts = new Map<string, number>();

  const resolveVariableName = (baseName: string): string => {
    const count = variableNameCounts.get(baseName) || 0;
    variableNameCounts.set(baseName, count + 1);
    return count === 0 ? baseName : `${baseName}${count + 1}`;
  };

  passiveEffects.forEach((effect) => {
    if (effect.configVariables) {
      effect.configVariables.forEach((configVar) => {
        if (configVar.trim()) {
          configItems.push(configVar);
        }
      });
    }
  });

  if (joker.userVariables && joker.userVariables.length > 0) {
    joker.userVariables.forEach((variable) => {
      if (variable.type === "number" || !variable.type) {
        configItems.push(`${variable.name} = ${variable.initialValue || 0}`);
      }
    });
  }

  const gameVariables = extractGameVariablesFromRules(joker.rules || []);
  gameVariables.forEach((gameVar) => {
    const varName = gameVar.name.replace(/\s+/g, "").toLowerCase();
    configItems.push(`${varName} = ${gameVar.startsFrom}`);
  });

  if (calculateResult?.configVariables) {
    calculateResult.configVariables.forEach((configVar) => {
      const finalName = resolveVariableName(configVar.name);
      const valueStr =
        typeof configVar.value === "string"
          ? `"${configVar.value}"`
          : configVar.value;
      configItems.push(`${finalName} = ${valueStr}`);
    });
  }

  if (joker.rules && joker.rules.length > 0) {
    const nonPassiveRules = joker.rules.filter(
      (rule) => rule.trigger !== "passive"
    );
    const variables = extractVariablesFromRules(nonPassiveRules);

    const userVariableNames = new Set(
      joker.userVariables?.map((v) => v.name) || []
    );
    const autoVariables = variables.filter(
      (v) => !userVariableNames.has(v.name)
    );

    if (autoVariables.length > 0) {
      const variableConfig = generateVariableConfig(autoVariables);
      if (variableConfig) {
        configItems.push(variableConfig);
      }
    }
  }

  const effectsConfig = configItems.join(",\n            ");

  const jokersPerRow = 10;
  const col = currentPosition % jokersPerRow;
  const row = Math.floor(currentPosition / jokersPerRow);

  let nextPosition = currentPosition + 1;

  let jokerCode = `SMODS.Joker{ --${joker.name}
    name = "${joker.name}",
    key = "${joker.jokerKey}",
    config = {
        extra = {`;

  if (effectsConfig.trim()) {
    jokerCode += `
            ${effectsConfig}`;
  }

  jokerCode += `
        }
    },
    loc_txt = {
        ['name'] = '${joker.name}',
        ['text'] = ${formatJokerDescription(joker)}
    },
    pos = {
        x = ${col},
        y = ${row}
    },
    cost = ${joker.cost !== undefined ? joker.cost : 4},
    rarity = ${
      typeof joker.rarity === "string" ? `"${joker.rarity}"` : joker.rarity
    },
    blueprint_compat = ${
      joker.blueprint_compat !== undefined ? joker.blueprint_compat : true
    },
    eternal_compat = ${
      joker.eternal_compat !== undefined ? joker.eternal_compat : true
    },
    unlocked = ${joker.unlocked !== undefined ? joker.unlocked : true},
    discovered = ${joker.discovered !== undefined ? joker.discovered : true},
    atlas = '${atlasKey}'`;

  if (joker.overlayImagePreview) {
    const soulCol = nextPosition % jokersPerRow;
    const soulRow = Math.floor(nextPosition / jokersPerRow);

    jokerCode += `,
    soul_pos = {
        x = ${soulCol},
        y = ${soulRow}
    }`;

    nextPosition++;
  }

  if (
    (joker.rarity !== 4 && joker.appears_in_shop === false) ||
    (joker.rarity === 4 && joker.appears_in_shop === true)
  ) {
    jokerCode += `,

    in_pool = function(self, args)
        return ${
          joker.rarity === 4 && joker.appears_in_shop === true
            ? "true"
            : "false"
        }
    end`;
  }

  const locVarsCode = generateLocVarsFunction(
    joker,
    passiveEffects,
    calculateResult?.configVariables || []
  );
  jokerCode += `,\n\n    ${locVarsCode}`;

  const setStickerCode = generateSetAbilityFunction(joker);
  if (setStickerCode) {
    jokerCode += `,\n\n    ${setStickerCode}`;
  }

  if (calculateResult) {
    jokerCode += `,\n\n    ${calculateResult.code}`;
  }

  const addToDeckCode = passiveEffects
    .filter((effect) => effect.addToDeck)
    .map((effect) => effect.addToDeck)
    .join("\n        ");

  const removeFromDeckCode = passiveEffects
    .filter((effect) => effect.removeFromDeck)
    .map((effect) => effect.removeFromDeck)
    .join("\n        ");

  const calculateFunctions = passiveEffects
    .filter((effect) => effect.calculateFunction)
    .map((effect) => effect.calculateFunction);

  if (addToDeckCode) {
    jokerCode += `,\n\n    add_to_deck = function(self, card, from_debuff)
        ${addToDeckCode}
    end`;
  }

  if (removeFromDeckCode) {
    jokerCode += `,\n\n    remove_from_deck = function(self, card, from_debuff)
        ${removeFromDeckCode}
    end`;
  }

  calculateFunctions.forEach((calculateFunction) => {
    jokerCode += `,\n\n    ${calculateFunction}`;
  });

  jokerCode += `\n}`;

  return {
    code: jokerCode,
    nextPosition,
  };
};

const generateLuaCode = (
  jokers: JokerData[],
  options: {
    modPrefix?: string;
    atlasKey?: string;
    customRarities?: RarityData[];
  } = {}
): string => {
  const { atlasKey = "CustomJokers", customRarities = [] } = options;

  let output = `SMODS.Atlas({
    key = "${atlasKey}", 
    path = "${atlasKey}.png", 
    px = 71,
    py = 95, 
    atlas_table = "ASSET_ATLAS"
}):register()

local NFS = require("nativefs")
to_big = to_big or function(a) return a end

local function load_jokers_folder()
    local mod_path = SMODS.current_mod.path
    local jokers_path = mod_path .. "/jokers"
    local files = NFS.getDirectoryItemsInfo(jokers_path)
    for i = 1, #files do
        local file_name = files[i].name
        if file_name:sub(-4) == ".lua" then
            assert(SMODS.load_file("jokers/" .. file_name))()
        end
    end
end`;

  if (customRarities.length > 0) {
    output += `

local function load_rarities_file()
    local mod_path = SMODS.current_mod.path
    assert(SMODS.load_file("rarities.lua"))()
end

load_rarities_file()`;
  }

  output += `

load_jokers_folder()
`;

  const modPrefix = options.modPrefix;
  if (modPrefix) {
    const hookCode = generateHooks(jokers, modPrefix);
    if (hookCode.trim()) {
      output += "\n" + hookCode;
    }
  }

  return output.trim();
};

export const exportJokersAsMod = async (
  jokers: JokerData[],
  metadata: ModMetadata,
  customRarities: RarityData[] = []
): Promise<boolean> => {
  try {
    const zip = new JSZip();
    const atlasKey = "CustomJokers";

    const jokersWithKeys = ensureJokerKeys(jokers);

    const mainLuaCode = generateLuaCode(jokersWithKeys, {
      modPrefix: metadata.prefix,
      atlasKey: atlasKey,
      customRarities: customRarities,
    });

    zip.file(metadata.main_file, mainLuaCode);

    if (customRarities.length > 0) {
      const raritiesCode = generateCustomRaritiesCode(customRarities);
      zip.file("rarities.lua", raritiesCode);
    }

    const jokersFolder = zip.folder("jokers");
    let currentPosition = 0;

    jokersWithKeys.forEach((joker) => {
      const result = generateSingleJokerCode(joker, atlasKey, currentPosition);
      jokersFolder!.file(`${joker.jokerKey}.lua`, result.code);
      currentPosition = result.nextPosition;
    });

    zip.file(`${metadata.id}.json`, generateModJson(metadata));

    await addAtlasToZip(zip, jokersWithKeys);

    console.log(jokersWithKeys);

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${metadata.id}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Failed to generate mod:", error);
    return false;
  }
};

export const exportSingleJoker = (joker: JokerData): void => {
  try {
    const jokerWithKey = joker.jokerKey
      ? joker
      : { ...joker, jokerKey: slugify(joker.name) };

    const result = generateSingleJokerCode(jokerWithKey, "Joker", 0);
    let jokerCode = result.code;

    const hookCode = generateHooks([jokerWithKey], "modprefix");
    if (hookCode.trim()) {
      jokerCode = `${jokerCode} 
      ${hookCode}`;
    }

    const blob = new Blob([jokerCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${jokerWithKey.jokerKey}.lua`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to export joker:", error);
    throw error;
  }
};

const generateSetAbilityFunction = (joker: JokerData): string | null => {
  const forcedStickers: string[] = [];
  const suitVariables = (joker.userVariables || []).filter(
    (v) => v.type === "suit"
  );
  const rankVariables = (joker.userVariables || []).filter(
    (v) => v.type === "rank"
  );
  const pokerHandVariables = (joker.userVariables || []).filter(
    (v) => v.type === "pokerhand"
  );

  if (joker.force_eternal) {
    forcedStickers.push("card:set_eternal(true)");
  }

  if (joker.force_perishable) {
    forcedStickers.push("card:add_sticker('perishable', true)");
  }

  if (joker.force_rental) {
    forcedStickers.push("card:add_sticker('rental', true)");
  }

  const variableInits: string[] = [];

  suitVariables.forEach((variable) => {
    const defaultSuit =
      variable.initialSuit || getSuitByValue("Spades")?.value || "Spades";
    variableInits.push(
      `G.GAME.current_round.${variable.name}_card = { suit = '${defaultSuit}' }`
    );
  });

  rankVariables.forEach((variable) => {
    const defaultRank =
      variable.initialRank || getRankByValue("A")?.label || "Ace";
    const defaultId = getRankId(defaultRank);
    variableInits.push(
      `G.GAME.current_round.${variable.name}_card = { rank = '${defaultRank}', id = ${defaultId} }`
    );
  });

  pokerHandVariables.forEach((variable) => {
    const defaultPokerHand = variable.initialPokerHand || "High Card";
    variableInits.push(
      `G.GAME.current_round.${variable.name}_hand = '${defaultPokerHand}'`
    );
  });

  if (forcedStickers.length === 0 && variableInits.length === 0) {
    return null;
  }

  const allCode = [...forcedStickers, ...variableInits];

  return `set_ability = function(self, card, initial)
        ${allCode.join("\n        ")}
    end`;
};

const generateCalculateFunction = (
  rules: Rule[],
  joker: JokerData
): CalculateFunctionResult => {
  const rulesByTrigger: Record<string, Rule[]> = {};
  rules.forEach((rule) => {
    if (!rulesByTrigger[rule.trigger]) {
      rulesByTrigger[rule.trigger] = [];
    }
    rulesByTrigger[rule.trigger].push(rule);
  });

  const allConfigVariables: ConfigExtraVariable[] = [];
  const globalEffectCounts = new Map<string, number>();

  let calculateFunction = `calculate = function(self, card, context)`;

  Object.entries(rulesByTrigger).forEach(([triggerType, triggerRules]) => {
    const sortedRules = [...triggerRules].sort((a, b) => {
      const aHasConditions = generateConditionChain(a, joker).length > 0;
      const bHasConditions = generateConditionChain(b, joker).length > 0;

      if (aHasConditions && !bHasConditions) return -1;
      if (!aHasConditions && bHasConditions) return 1;
      return 0;
    });

    const hasRetriggerEffects = sortedRules.some((rule) =>
      [
        ...(rule.effects || []),
        ...(rule.randomGroups?.flatMap((g) => g.effects) || []),
      ].some((effect) => effect.type === "retrigger_cards")
    );

    const hasDeleteEffects =
      triggerType !== "card_discarded" &&
      sortedRules.some((rule) =>
        [
          ...(rule.effects || []),
          ...(rule.randomGroups?.flatMap((g) => g.effects) || []),
        ].some((effect) => effect.type === "delete_triggered_card")
      );

    if (hasDeleteEffects) {
      calculateFunction += `
        if context.destroy_card and context.destroy_card.should_destroy and not context.blueprint then
            return { remove = true }
        end`;
    }

    if (hasRetriggerEffects) {
      const retriggerContextCheck =
        triggerType === "card_held_in_hand" ||
        triggerType === "card_held_in_hand_end_of_round"
          ? "context.repetition and context.cardarea == G.hand and (next(context.card_effects[1]) or #context.card_effects > 1)"
          : "context.repetition and context.cardarea == G.play";

      calculateFunction += `
        if ${retriggerContextCheck} then`;

      let hasAnyConditions = false;

      sortedRules.forEach((rule) => {
        const regularRetriggerEffects = (rule.effects || []).filter(
          (e) => e.type === "retrigger_cards"
        );
        const randomRetriggerEffects = (rule.randomGroups || []).filter(
          (group) => group.effects.some((e) => e.type === "retrigger_cards")
        );

        if (
          regularRetriggerEffects.length === 0 &&
          randomRetriggerEffects.length === 0
        )
          return;

        const conditionCode = generateConditionChain(rule, joker);

        if (conditionCode) {
          const conditional = hasAnyConditions ? "elseif" : "if";
          calculateFunction += `
            ${conditional} ${conditionCode} then`;
          hasAnyConditions = true;
        } else {
          if (hasAnyConditions) {
            calculateFunction += `
            else`;
          }
        }

        const effectResult = generateEffectReturnStatement(
          regularRetriggerEffects,
          convertRandomGroupsForCodegen(randomRetriggerEffects),
          triggerType,
          rule.id,
          globalEffectCounts
        );

        if (effectResult.configVariables) {
          allConfigVariables.push(...effectResult.configVariables);
        }

        if (effectResult.preReturnCode) {
          calculateFunction += `
                ${effectResult.preReturnCode}`;
        }

        if (effectResult.statement) {
          calculateFunction += `
                ${effectResult.statement}`;
        }
      });

      if (hasAnyConditions) {
        calculateFunction += `
            end`;
      }

      calculateFunction += `
        end`;

      const hasNonRetriggerEffects = sortedRules.some((rule) => {
        const regularNonRetriggerEffects = (rule.effects || []).filter(
          (e) => e.type !== "retrigger_cards"
        );
        const randomNonRetriggerGroups = (rule.randomGroups || [])
          .map((group) => ({
            ...group,
            effects: group.effects.filter((e) => e.type !== "retrigger_cards"),
          }))
          .filter((group) => group.effects.length > 0);

        return (
          regularNonRetriggerEffects.length > 0 ||
          randomNonRetriggerGroups.length > 0
        );
      });

      if (hasNonRetriggerEffects) {
        const nonRetriggerContextCheck =
          triggerType === "card_held_in_hand" ||
          triggerType === "card_held_in_hand_end_of_round"
            ? "context.individual and context.cardarea == G.hand and not context.end_of_round and not context.blueprint"
            : triggerType === "card_discarded"
            ? "context.discard and not context.blueprint"
            : "context.individual and context.cardarea == G.play and not context.blueprint";

        calculateFunction += `
        if ${nonRetriggerContextCheck} then`;

        if (hasDeleteEffects) {
          calculateFunction += `
            context.other_card.should_destroy = false`;
        }

        hasAnyConditions = false;

        const rulesWithConditions = sortedRules.filter(
          (rule) => generateConditionChain(rule, joker).length > 0
        );
        const rulesWithoutConditions = sortedRules.filter(
          (rule) => generateConditionChain(rule, joker).length === 0
        );

        rulesWithConditions.forEach((rule) => {
          const regularNonRetriggerEffects = (rule.effects || []).filter(
            (e) => e.type !== "retrigger_cards"
          );
          const randomNonRetriggerGroups = (rule.randomGroups || [])
            .map((group) => ({
              ...group,
              effects: group.effects.filter(
                (e) => e.type !== "retrigger_cards"
              ),
            }))
            .filter((group) => group.effects.length > 0);

          if (
            regularNonRetriggerEffects.length === 0 &&
            randomNonRetriggerGroups.length === 0
          )
            return;

          const conditionCode = generateConditionChain(rule, joker);

          const conditional = hasAnyConditions ? "elseif" : "if";
          calculateFunction += `
            ${conditional} ${conditionCode} then`;
          hasAnyConditions = true;

          const hasDeleteInRegularEffects = (rule.effects || []).some(
            (effect) => effect.type === "delete_triggered_card"
          );

          if (hasDeleteInRegularEffects) {
            calculateFunction += `
                context.other_card.should_destroy = true`;
          }

          const effectResult = generateEffectReturnStatement(
            regularNonRetriggerEffects,
            convertRandomGroupsForCodegen(randomNonRetriggerGroups),
            triggerType,
            rule.id,
            globalEffectCounts
          );

          if (effectResult.configVariables) {
            allConfigVariables.push(...effectResult.configVariables);
          }

          if (effectResult.preReturnCode) {
            calculateFunction += `
                ${effectResult.preReturnCode}`;
          }

          if (effectResult.statement) {
            calculateFunction += `
                ${effectResult.statement}`;
          }
        });

        if (rulesWithoutConditions.length > 0) {
          const rulesWithRandomGroups = rulesWithoutConditions.filter(
            (rule) => (rule.randomGroups || []).length > 0
          );
          const rulesWithoutRandomGroups = rulesWithoutConditions.filter(
            (rule) =>
              (rule.randomGroups || []).length === 0 &&
              (rule.effects || []).length > 0
          );

          rulesWithRandomGroups.forEach((rule) => {
            const regularNonRetriggerEffects = (rule.effects || []).filter(
              (e) => e.type !== "retrigger_cards"
            );
            const randomNonRetriggerGroups = (rule.randomGroups || [])
              .map((group) => ({
                ...group,
                effects: group.effects.filter(
                  (e) => e.type !== "retrigger_cards"
                ),
              }))
              .filter((group) => group.effects.length > 0);

            if (
              regularNonRetriggerEffects.length === 0 &&
              randomNonRetriggerGroups.length === 0
            )
              return;

            const conditional = hasAnyConditions ? "elseif" : "if";
            calculateFunction += `
            ${conditional} true then`;
            hasAnyConditions = true;

            const hasDeleteInRegularEffects = (rule.effects || []).some(
              (effect) => effect.type === "delete_triggered_card"
            );

            if (hasDeleteInRegularEffects) {
              calculateFunction += `
                context.other_card.should_destroy = true`;
            }

            const effectResult = generateEffectReturnStatement(
              regularNonRetriggerEffects,
              convertRandomGroupsForCodegen(randomNonRetriggerGroups),
              triggerType,
              rule.id,
              globalEffectCounts
            );

            if (effectResult.configVariables) {
              allConfigVariables.push(...effectResult.configVariables);
            }

            if (effectResult.preReturnCode) {
              calculateFunction += `
                ${effectResult.preReturnCode}`;
            }

            if (effectResult.statement) {
              calculateFunction += `
                ${effectResult.statement}`;
            }
          });

          if (rulesWithoutRandomGroups.length > 0) {
            if (hasAnyConditions) {
              calculateFunction += `
            else`;
            }

            rulesWithoutRandomGroups.forEach((rule) => {
              const regularNonRetriggerEffects = (rule.effects || []).filter(
                (e) => e.type !== "retrigger_cards"
              );

              if (regularNonRetriggerEffects.length === 0) return;

              const hasDeleteInRegularEffects = (rule.effects || []).some(
                (effect) => effect.type === "delete_triggered_card"
              );

              if (hasDeleteInRegularEffects) {
                calculateFunction += `
                context.other_card.should_destroy = true`;
              }

              const effectResult = generateEffectReturnStatement(
                regularNonRetriggerEffects,
                [],
                triggerType,
                rule.id,
                globalEffectCounts
              );

              if (effectResult.configVariables) {
                allConfigVariables.push(...effectResult.configVariables);
              }

              if (effectResult.preReturnCode) {
                calculateFunction += `
                ${effectResult.preReturnCode}`;
              }

              if (effectResult.statement) {
                calculateFunction += `
                ${effectResult.statement}`;
              }
            });
          }
        }

        if (hasAnyConditions) {
          calculateFunction += `
            end`;
        }

        calculateFunction += `
        end`;
      }
    } else if (hasDeleteEffects) {
      const individualContextCheck =
        triggerType === "card_held_in_hand" ||
        triggerType === "card_held_in_hand_end_of_round"
          ? "context.individual and context.cardarea == G.hand and not context.end_of_round and not context.blueprint"
          : triggerType === "card_discarded"
          ? "context.discard and not context.blueprint"
          : "context.individual and context.cardarea == G.play and not context.blueprint";

      calculateFunction += `
        if ${individualContextCheck} then
            context.other_card.should_destroy = false`;

      let hasAnyConditions = false;

      const rulesWithConditions = sortedRules.filter(
        (rule) => generateConditionChain(rule, joker).length > 0
      );
      const rulesWithoutConditions = sortedRules.filter(
        (rule) => generateConditionChain(rule, joker).length === 0
      );

      rulesWithConditions.forEach((rule) => {
        const regularDeleteEffects = (rule.effects || []).filter(
          (e) => e.type === "delete_triggered_card"
        );
        const randomDeleteGroups = (rule.randomGroups || []).filter((group) =>
          group.effects.some((e) => e.type === "delete_triggered_card")
        );

        const regularNonDeleteEffects = (rule.effects || []).filter(
          (e) => e.type !== "delete_triggered_card"
        );
        const randomNonDeleteGroups = (rule.randomGroups || [])
          .map((group) => ({
            ...group,
            effects: group.effects.filter(
              (e) => e.type !== "delete_triggered_card"
            ),
          }))
          .filter((group) => group.effects.length > 0);

        if (
          regularDeleteEffects.length === 0 &&
          randomDeleteGroups.length === 0 &&
          regularNonDeleteEffects.length === 0 &&
          randomNonDeleteGroups.length === 0
        )
          return;

        const conditionCode = generateConditionChain(rule, joker);

        const conditional = hasAnyConditions ? "elseif" : "if";
        calculateFunction += `
            ${conditional} ${conditionCode} then`;
        hasAnyConditions = true;

        if (regularDeleteEffects.length > 0) {
          calculateFunction += `
                context.other_card.should_destroy = true`;
        }

        const allEffects = [
          ...regularNonDeleteEffects,
          ...regularDeleteEffects,
        ];
        const allGroups = [...randomNonDeleteGroups, ...randomDeleteGroups];

        if (allEffects.length > 0 || allGroups.length > 0) {
          const effectResult = generateEffectReturnStatement(
            allEffects,
            convertRandomGroupsForCodegen(allGroups),
            triggerType,
            rule.id,
            globalEffectCounts
          );

          if (effectResult.configVariables) {
            allConfigVariables.push(...effectResult.configVariables);
          }

          if (effectResult.preReturnCode) {
            calculateFunction += `
                ${effectResult.preReturnCode}`;
          }

          if (effectResult.statement) {
            calculateFunction += `
                ${effectResult.statement}`;
          }
        }
      });

      if (rulesWithoutConditions.length > 0) {
        const rulesWithRandomGroups = rulesWithoutConditions.filter(
          (rule) => (rule.randomGroups || []).length > 0
        );
        const rulesWithoutRandomGroups = rulesWithoutConditions.filter(
          (rule) =>
            (rule.randomGroups || []).length === 0 &&
            (rule.effects || []).length > 0
        );

        rulesWithRandomGroups.forEach((rule) => {
          const regularDeleteEffects = (rule.effects || []).filter(
            (e) => e.type === "delete_triggered_card"
          );
          const randomDeleteGroups = (rule.randomGroups || []).filter((group) =>
            group.effects.some((e) => e.type === "delete_triggered_card")
          );

          const regularNonDeleteEffects = (rule.effects || []).filter(
            (e) => e.type !== "delete_triggered_card"
          );
          const randomNonDeleteGroups = (rule.randomGroups || [])
            .map((group) => ({
              ...group,
              effects: group.effects.filter(
                (e) => e.type !== "delete_triggered_card"
              ),
            }))
            .filter((group) => group.effects.length > 0);

          if (
            regularDeleteEffects.length === 0 &&
            randomDeleteGroups.length === 0 &&
            regularNonDeleteEffects.length === 0 &&
            randomNonDeleteGroups.length === 0
          )
            return;

          const conditional = hasAnyConditions ? "elseif" : "if";
          calculateFunction += `
            ${conditional} true then`;
          hasAnyConditions = true;

          if (regularDeleteEffects.length > 0) {
            calculateFunction += `
                context.other_card.should_destroy = true`;
          }

          const allEffects = [
            ...regularNonDeleteEffects,
            ...regularDeleteEffects,
          ];
          const allGroups = [...randomNonDeleteGroups, ...randomDeleteGroups];

          if (allEffects.length > 0 || allGroups.length > 0) {
            const effectResult = generateEffectReturnStatement(
              allEffects,
              convertRandomGroupsForCodegen(allGroups),
              triggerType,
              rule.id,
              globalEffectCounts
            );

            if (effectResult.configVariables) {
              allConfigVariables.push(...effectResult.configVariables);
            }

            if (effectResult.preReturnCode) {
              calculateFunction += `
                ${effectResult.preReturnCode}`;
            }

            if (effectResult.statement) {
              calculateFunction += `
                ${effectResult.statement}`;
            }
          }
        });

        if (rulesWithoutRandomGroups.length > 0) {
          if (hasAnyConditions) {
            calculateFunction += `
            else`;
          }

          rulesWithoutRandomGroups.forEach((rule) => {
            const regularDeleteEffects = (rule.effects || []).filter(
              (e) => e.type === "delete_triggered_card"
            );
            const regularNonDeleteEffects = (rule.effects || []).filter(
              (e) => e.type !== "delete_triggered_card"
            );

            if (
              regularDeleteEffects.length === 0 &&
              regularNonDeleteEffects.length === 0
            )
              return;

            if (regularDeleteEffects.length > 0) {
              calculateFunction += `
                context.other_card.should_destroy = true`;
            }

            const allEffects = [
              ...regularNonDeleteEffects,
              ...regularDeleteEffects,
            ];

            if (allEffects.length > 0) {
              const effectResult = generateEffectReturnStatement(
                allEffects,
                [],
                triggerType,
                rule.id,
                globalEffectCounts
              );

              if (effectResult.configVariables) {
                allConfigVariables.push(...effectResult.configVariables);
              }

              if (effectResult.preReturnCode) {
                calculateFunction += `
                ${effectResult.preReturnCode}`;
              }

              if (effectResult.statement) {
                calculateFunction += `
                ${effectResult.statement}`;
              }
            }
          });
        }
      }

      if (hasAnyConditions) {
        calculateFunction += `
            end`;
      }

      calculateFunction += `
        end`;
    } else {
      const triggerContext = generateTriggerContext(triggerType, sortedRules);

      calculateFunction += `
        if ${triggerContext.check} then`;

      let hasAnyConditions = false;

      const rulesWithConditions = sortedRules.filter(
        (rule) => generateConditionChain(rule, joker).length > 0
      );
      const rulesWithoutConditions = sortedRules.filter(
        (rule) => generateConditionChain(rule, joker).length === 0
      );

      rulesWithConditions.forEach((rule) => {
        const conditionCode = generateConditionChain(rule, joker);

        const conditional = hasAnyConditions ? "elseif" : "if";
        calculateFunction += `
            ${conditional} ${conditionCode} then`;
        hasAnyConditions = true;

        const effectResult = generateEffectReturnStatement(
          rule.effects || [],
          convertRandomGroupsForCodegen(rule.randomGroups || []),
          triggerType,
          rule.id,
          globalEffectCounts
        );

        if (effectResult.configVariables) {
          allConfigVariables.push(...effectResult.configVariables);
        }

        if (effectResult.preReturnCode) {
          calculateFunction += `
                ${effectResult.preReturnCode}`;
        }

        if (effectResult.statement) {
          calculateFunction += `
                ${effectResult.statement}`;
        }
      });

      if (rulesWithoutConditions.length > 0) {
        const rulesWithRandomGroups = rulesWithoutConditions.filter(
          (rule) => (rule.randomGroups || []).length > 0
        );
        const rulesWithoutRandomGroups = rulesWithoutConditions.filter(
          (rule) =>
            (rule.randomGroups || []).length === 0 &&
            (rule.effects || []).length > 0
        );

        rulesWithRandomGroups.forEach((rule) => {
          const conditional = hasAnyConditions ? "elseif" : "if";
          calculateFunction += `
            ${conditional} true then`;
          hasAnyConditions = true;

          const effectResult = generateEffectReturnStatement(
            rule.effects || [],
            convertRandomGroupsForCodegen(rule.randomGroups || []),
            triggerType,
            rule.id,
            globalEffectCounts
          );

          if (effectResult.configVariables) {
            allConfigVariables.push(...effectResult.configVariables);
          }

          if (effectResult.preReturnCode) {
            calculateFunction += `
                ${effectResult.preReturnCode}`;
          }

          if (effectResult.statement) {
            calculateFunction += `
                ${effectResult.statement}`;
          }
        });

        if (rulesWithoutRandomGroups.length > 0) {
          if (hasAnyConditions) {
            calculateFunction += `
            else`;
          }

          rulesWithoutRandomGroups.forEach((rule) => {
            const effectResult = generateEffectReturnStatement(
              rule.effects || [],
              [],
              triggerType,
              rule.id,
              globalEffectCounts
            );

            if (effectResult.configVariables) {
              allConfigVariables.push(...effectResult.configVariables);
            }

            if (effectResult.preReturnCode) {
              calculateFunction += `
                ${effectResult.preReturnCode}`;
            }

            if (effectResult.statement) {
              calculateFunction += `
                ${effectResult.statement}`;
            }
          });
        }
      }

      if (hasAnyConditions) {
        calculateFunction += `
            end`;
      }

      calculateFunction += `
        end`;
    }
  });

  calculateFunction += `
    end`;

  return {
    code: calculateFunction,
    configVariables: allConfigVariables,
  };
};

const generateLocVarsFunction = (
  joker: JokerData,
  passiveEffects: PassiveEffectResult[],
  collectedConfigVariables: ConfigExtraVariable[]
): string => {
  const descriptionHasVariables = joker.description.includes("#");
  if (!descriptionHasVariables) {
    return `loc_vars = function(self, info_queue, card)
        return {vars = {}}
    end`;
  }

  const variablePlaceholders = joker.description.match(/#(\d+)#/g) || [];
  const maxVariableIndex = Math.max(
    ...variablePlaceholders.map((placeholder) =>
      parseInt(placeholder.replace(/#/g, ""))
    ),
    0
  );

  if (maxVariableIndex === 0) {
    return `loc_vars = function(self, info_queue, card)
        return {vars = {}}
    end`;
  }

  const allVariables = getAllVariables(joker);
  const gameVariables = extractGameVariablesFromRules(joker.rules || []);
  const suitVariables = (joker.userVariables || []).filter(
    (v) => v.type === "suit"
  );
  const rankVariables = (joker.userVariables || []).filter(
    (v) => v.type === "rank"
  );
  const pokerHandVariables = (joker.userVariables || []).filter(
    (v) => v.type === "pokerhand"
  );

  const hasRandomGroups =
    joker.rules?.some(
      (rule) => rule.randomGroups && rule.randomGroups.length > 0
    ) || false;

  const variableMapping: string[] = [];
  const colorVariables: string[] = [];

  const wrapGameVariableCode = (code: string): string => {
    if (code.includes("G.jokers.cards")) {
      return code.replace(
        "G.jokers.cards",
        "(G.jokers and G.jokers.cards or {})"
      );
    }
    if (code.includes("#G.jokers.cards")) {
      return code.replace(
        "#G.jokers.cards",
        "(G.jokers and G.jokers.cards and #G.jokers.cards or 0)"
      );
    }
    if (code.includes("#G.hand.cards")) {
      return code.replace(
        "#G.hand.cards",
        "(G.hand and G.hand.cards and #G.hand.cards or 0)"
      );
    }
    if (code.includes("#G.deck.cards")) {
      return code.replace(
        "#G.deck.cards",
        "(G.deck and G.deck.cards and #G.deck.cards or 0)"
      );
    }
    if (code.includes("#G.consumeables.cards")) {
      return code.replace(
        "#G.consumeables.cards",
        "(G.consumeables and G.consumeables.cards and #G.consumeables.cards or 0)"
      );
    }
    if (
      code.includes("G.GAME") ||
      code.includes("G.jokers") ||
      code.includes("G.hand") ||
      code.includes("G.deck") ||
      code.includes("G.consumeables")
    ) {
      return `(${code} or 0)`;
    }
    return code;
  };

  if (hasRandomGroups) {
    const nonPassiveRules =
      joker.rules?.filter((rule) => rule.trigger !== "passive") || [];
    const randomGroups = nonPassiveRules.flatMap(
      (rule) => rule.randomGroups || []
    );
    const denominators = [
      ...new Set(randomGroups.map((group) => group.chance_denominator)),
    ];

    variableMapping.push("G.GAME.probabilities.normal");

    if (denominators.length === 1) {
      variableMapping.push("card.ability.extra.odds");
    } else {
      denominators.forEach((_, index) => {
        if (index === 0) {
          variableMapping.push("card.ability.extra.odds");
        } else {
          variableMapping.push(`card.ability.extra.odds${index + 1}`);
        }
      });
    }

    const remainingVars = allVariables.filter(
      (v) =>
        v.name !== "numerator" &&
        v.name !== "denominator" &&
        !v.name.startsWith("numerator") &&
        !v.name.startsWith("denominator") &&
        v.type !== "suit" &&
        v.type !== "rank" &&
        v.type !== "pokerhand"
    );
    const remainingGameVars = gameVariables.filter(
      (gv) =>
        !gv.name.toLowerCase().includes("numerator") &&
        !gv.name.toLowerCase().includes("denominator")
    );

    let currentIndex = denominators.length + 1;

    for (const variable of remainingVars) {
      if (currentIndex >= maxVariableIndex) break;
      variableMapping.push(`card.ability.extra.${variable.name}`);
      currentIndex++;
    }

    for (const gameVar of remainingGameVars) {
      if (currentIndex >= maxVariableIndex) break;
      const varName = gameVar.name.replace(/\s+/g, "").toLowerCase();
      let gameVarCode: string;

      if (gameVar.multiplier === 1 && gameVar.startsFrom === 0) {
        gameVarCode = wrapGameVariableCode(gameVar.code);
      } else if (gameVar.startsFrom === 0) {
        gameVarCode = `(${wrapGameVariableCode(gameVar.code)}) * ${
          gameVar.multiplier
        }`;
      } else if (gameVar.multiplier === 1) {
        gameVarCode = `card.ability.extra.${varName} + (${wrapGameVariableCode(
          gameVar.code
        )})`;
      } else {
        gameVarCode = `card.ability.extra.${varName} + (${wrapGameVariableCode(
          gameVar.code
        )}) * ${gameVar.multiplier}`;
      }

      variableMapping.push(gameVarCode);
      currentIndex++;
    }

    for (const suitVar of suitVariables) {
      if (currentIndex >= maxVariableIndex) break;
      const defaultSuit = getSuitByValue("Spades")?.value || "Spades";
      variableMapping.push(
        `localize((G.GAME.current_round.${suitVar.name}_card or {}).suit or '${defaultSuit}', 'suits_singular')`
      );
      colorVariables.push(
        `G.C.SUITS[(G.GAME.current_round.${suitVar.name}_card or {}).suit or '${defaultSuit}']`
      );
      currentIndex++;
    }

    for (const rankVar of rankVariables) {
      if (currentIndex >= maxVariableIndex) break;
      const defaultRank = getRankByValue("A")?.label || "Ace";
      variableMapping.push(
        `localize((G.GAME.current_round.${rankVar.name}_card or {}).rank or '${defaultRank}', 'ranks')`
      );
      currentIndex++;
    }

    for (const pokerHandVar of pokerHandVariables) {
      if (currentIndex >= maxVariableIndex) break;
      variableMapping.push(
        `localize((G.GAME.current_round.${pokerHandVar.name}_hand or 'High Card'), 'poker_hands')`
      );
      currentIndex++;
    }
  } else {
    let currentIndex = 0;

    for (const variable of allVariables) {
      if (currentIndex >= maxVariableIndex) break;

      if (
        !variable.id.startsWith("auto_gamevar_") &&
        variable.type !== "suit" &&
        variable.type !== "rank" &&
        variable.type !== "pokerhand"
      ) {
        variableMapping.push(`card.ability.extra.${variable.name}`);
        currentIndex++;
      }
    }

    for (const suitVar of suitVariables) {
      if (currentIndex >= maxVariableIndex) break;
      const defaultSuit = getSuitByValue("Spades")?.value || "Spades";
      variableMapping.push(
        `localize((G.GAME.current_round.${suitVar.name}_card or {}).suit or '${defaultSuit}', 'suits_singular')`
      );
      colorVariables.push(
        `G.C.SUITS[(G.GAME.current_round.${suitVar.name}_card or {}).suit or '${defaultSuit}']`
      );
      currentIndex++;
    }

    for (const rankVar of rankVariables) {
      if (currentIndex >= maxVariableIndex) break;
      const defaultRank = getRankByValue("A")?.label || "Ace";
      variableMapping.push(
        `localize((G.GAME.current_round.${rankVar.name}_card or {}).rank or '${defaultRank}', 'ranks')`
      );
      currentIndex++;
    }

    for (const pokerHandVar of pokerHandVariables) {
      if (currentIndex >= maxVariableIndex) break;
      variableMapping.push(
        `localize((G.GAME.current_round.${pokerHandVar.name}_hand or 'High Card'), 'poker_hands')`
      );
      currentIndex++;
    }

    for (const gameVar of gameVariables) {
      if (currentIndex >= maxVariableIndex) break;
      const varName = gameVar.name.replace(/\s+/g, "").toLowerCase();
      let gameVarCode: string;

      if (gameVar.multiplier === 1 && gameVar.startsFrom === 0) {
        gameVarCode = wrapGameVariableCode(gameVar.code);
      } else if (gameVar.startsFrom === 0) {
        gameVarCode = `(${wrapGameVariableCode(gameVar.code)}) * ${
          gameVar.multiplier
        }`;
      } else if (gameVar.multiplier === 1) {
        gameVarCode = `card.ability.extra.${varName} + (${wrapGameVariableCode(
          gameVar.code
        )})`;
      } else {
        gameVarCode = `card.ability.extra.${varName} + (${wrapGameVariableCode(
          gameVar.code
        )}) * ${gameVar.multiplier}`;
      }

      variableMapping.push(gameVarCode);
      currentIndex++;
    }
  }

  collectedConfigVariables.forEach((configVar) => {
    if (variableMapping.length < maxVariableIndex) {
      variableMapping.push(`card.ability.extra.${configVar.name}`);
    }
  });

  passiveEffects.forEach((effect) => {
    if (effect.locVars) {
      effect.locVars.forEach((locVar) => {
        if (
          !variableMapping.includes(locVar) &&
          variableMapping.length < maxVariableIndex
        ) {
          const wrappedLocVar = wrapGameVariableCode(locVar);
          variableMapping.push(wrappedLocVar);
        }
      });
    }
  });

  const finalVars = variableMapping.slice(0, maxVariableIndex);

  let locVarsReturn = `{vars = {${finalVars.join(", ")}}}`;

  if (colorVariables.length > 0) {
    locVarsReturn = `{vars = {${finalVars.join(
      ", "
    )}}, colours = {${colorVariables.join(", ")}}}`;
  }

  return `loc_vars = function(self, info_queue, card)
        return ${locVarsReturn}
    end`;
};

const formatJokerDescription = (joker: JokerData): string => {
  const formatted = joker.description.replace(/<br\s*\/?>/gi, "[s]");

  const lines = formatted
    .split("[s]")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    lines.push(formatted.trim());
  }

  return `{\n${lines
    .map((line, i) => `            [${i + 1}] = '${line.replace(/'/g, "\\'")}'`)
    .join(",\n")}\n        }`;
};

export const getEffectVariableName = (fallback: string): string => {
  return fallback;
};

const generateHooks = (jokers: JokerData[], modPrefix: string): string => {
  let allHooks = "";

  const hooksByType: Record<
    string,
    Array<{ jokerKey: string; params: unknown }>
  > = {};

  jokers.forEach((joker) => {
    const passiveEffects = processPassiveEffects(joker);

    passiveEffects.forEach((effect) => {
      if (effect.needsHook) {
        const hookType = effect.needsHook.hookType;
        if (!hooksByType[hookType]) {
          hooksByType[hookType] = [];
        }
        hooksByType[hookType].push({
          jokerKey: joker.jokerKey!,
          params: effect.needsHook.effectParams,
        });
      }
    });
  });

  if (hooksByType.discount_items) {
    allHooks += generateDiscountItemsHook(
      hooksByType.discount_items as Array<{
        jokerKey: string;
        params: {
          discountType: string;
          discountMethod: string;
          discountAmount: number;
        };
      }>,
      modPrefix
    );
  }

  if (hooksByType.reduce_flush_straight_requirements) {
    allHooks += generateReduceFlushStraightRequirementsHook(
      hooksByType.reduce_flush_straight_requirements as Array<{
        jokerKey: string;
        params: {
          reductionValue: number;
        };
      }>,
      modPrefix
    );
  }

  if (hooksByType.shortcut) {
    allHooks += generateShortcutHook(
      hooksByType.shortcut as Array<{
        jokerKey: string;
        params: Record<string, unknown>;
      }>,
      modPrefix
    );
  }

  if (hooksByType.showman) {
    allHooks += generateShowmanHook(
      hooksByType.showman as Array<{
        jokerKey: string;
        params: Record<string, unknown>;
      }>,
      modPrefix
    );
  }

  if (hooksByType.combine_ranks) {
    allHooks += generateCombineRanksHook(
      hooksByType.combine_ranks as Array<{
        jokerKey: string;
        params: {
          sourceRankType: string;
          sourceRanks: string[];
          targetRank: string;
        };
      }>,
      modPrefix
    );
  }

  if (hooksByType.combine_suits) {
    allHooks += generateCombineSuitsHook(
      hooksByType.combine_suits as Array<{
        jokerKey: string;
        params: {
          suit1: string;
          suit2: string;
        };
      }>,
      modPrefix
    );
  }

  return allHooks;
};

const generateModJson = (metadata: ModMetadata): string => {
  const modJson: Record<string, unknown> = {
    id: metadata.id,
    name: metadata.name,
    author: metadata.author,
    description: metadata.description,
    prefix: metadata.prefix,
    main_file: metadata.main_file,
    version: metadata.version,
    priority: metadata.priority,
    badge_colour: metadata.badge_colour,
    badge_text_colour: metadata.badge_text_colour,
  };

  if (metadata.display_name && metadata.display_name !== metadata.name) {
    modJson.display_name = metadata.display_name;
  }

  if (metadata.dependencies && metadata.dependencies.length > 0) {
    modJson.dependencies = metadata.dependencies;
  }

  if (metadata.conflicts && metadata.conflicts.length > 0) {
    modJson.conflicts = metadata.conflicts;
  }

  if (metadata.provides && metadata.provides.length > 0) {
    modJson.provides = metadata.provides;
  }

  if (metadata.dump_loc) {
    modJson.dump_loc = metadata.dump_loc;
  }

  return JSON.stringify(modJson, null, 2);
};
