import { ConsumableData } from "../../data/BalatroUtils";
import { ConsumableSetData } from "../../data/BalatroUtils";
import { generateConditionChain } from "./conditionUtils";
import { generateEffectReturnStatement } from "./effectUtils";
import { slugify } from "../../EditConsumableInfo";
import type { Rule } from "../../ruleBuilder/types";

interface ConsumableGenerationOptions {
  modPrefix?: string;
  atlasKey?: string;
  consumableSets?: ConsumableSetData[];
}

const ensureConsumableKeys = (
  consumables: ConsumableData[]
): ConsumableData[] => {
  return consumables.map((consumable) => ({
    ...consumable,
    consumableKey: consumable.consumableKey || slugify(consumable.name),
  }));
};

export const generateConsumablesCode = (
  consumables: ConsumableData[],
  options: ConsumableGenerationOptions = {}
): { consumablesCode: Record<string, string> } => {
  const { atlasKey = "CustomConsumables", consumableSets = [] } = options;

  const modPrefix = options.modPrefix || "";
  const consumablesWithKeys = ensureConsumableKeys(consumables);
  const consumablesCode: Record<string, string> = {};
  let currentPosition = 0;

  // Generate consumable sets first if any exist
  if (consumableSets.length > 0) {
    const setsCode = generateConsumableSetsCode(
      consumableSets,
      consumablesWithKeys,
      modPrefix
    );
    if (setsCode.trim()) {
      consumablesCode["sets.lua"] = setsCode;
    }
  }

  // Generate individual consumables
  consumablesWithKeys.forEach((consumable) => {
    const result = generateSingleConsumableCode(
      consumable,
      atlasKey,
      currentPosition,
      modPrefix
    );
    consumablesCode[`${consumable.consumableKey}.lua`] = result.code;
    currentPosition = result.nextPosition;
  });

  return { consumablesCode };
};

const generateConsumableSetsCode = (
  consumableSets: ConsumableSetData[],
  consumables: ConsumableData[],
  modPrefix: string = ""
): string => {
  let setsCode = "";

  consumableSets.forEach((set, index) => {
    if (index > 0) {
      setsCode += "\n\n";
    }

    // Find all consumables that belong to this set
    const setConsumables = consumables.filter(
      (consumable) => consumable.set === set.key
    );

    // Generate the cards array
    let cardsArray = "";
    if (setConsumables.length > 0) {
      const cardEntries = setConsumables.map((consumable) => {
        const prefix = modPrefix ? `${modPrefix}_` : "";
        return `        ['c_${prefix}${consumable.consumableKey}'] = true`;
      });
      cardsArray = `    cards = {
${cardEntries.join(",\n")}
    },`;
    } else {
      cardsArray = `    cards = {},`;
    }

    setsCode += `SMODS.ConsumableType {
    key = '${set.key}',`;

    if (set.shader) {
      setsCode += `
    shader = '${set.shader}',`;
    }

    // Ensure colors have # prefix
    const primaryColor = set.primary_colour.startsWith("#")
      ? set.primary_colour.substring(1)
      : set.primary_colour;
    const secondaryColor = set.secondary_colour.startsWith("#")
      ? set.secondary_colour.substring(1)
      : set.secondary_colour;

    setsCode += `
    primary_colour = HEX('${primaryColor}'),
    secondary_colour = HEX('${secondaryColor}'),
    collection_rows = { ${set.collection_rows[0]}, ${set.collection_rows[1]} },`;

    if (set.default_card) {
      setsCode += `
    default = '${set.default_card}',`;
    }

    if (set.shop_rate !== undefined) {
      setsCode += `
    shop_rate = ${set.shop_rate},`;
    }

    setsCode += `
${cardsArray}
    loc_txt = {
        name = "${set.name}",
        collection = "${set.collection_name || set.name + " Cards"}",
    }
}`;
  });

  return setsCode;
};

const generateSingleConsumableCode = (
  consumable: ConsumableData,
  atlasKey: string,
  currentPosition: number,
  modPrefix: string
): { code: string; nextPosition: number } => {
  const activeRules =
    consumable.rules?.filter((rule) => rule.trigger !== "passive") || [];

  // Collect config variables from all effects
  const configItems: string[] = [];
  activeRules.forEach((rule) => {
    const effectResult = generateEffectReturnStatement(
      rule.effects || [],
      [],
      ""
    );
    if (effectResult.configVariables) {
      configItems.push(...effectResult.configVariables);
    }
  });

  const effectsConfig = configItems.join(",\n        ");

  const consumablesPerRow = 10;
  const col = currentPosition % consumablesPerRow;
  const row = Math.floor(currentPosition / consumablesPerRow);

  const nextPosition = currentPosition + 1;

  let consumableCode = `SMODS.Consumable {
    key = '${consumable.consumableKey}',
    set = '${consumable.set}',
    pos = { x = ${col}, y = ${row} },`;

  if (effectsConfig.trim()) {
    consumableCode += `
    config = { extra = {
        ${effectsConfig}
    } },`;
  }

  consumableCode += `
    loc_txt = {
        name = '${consumable.name}',
        text = ${formatConsumableDescription(consumable)}
    },`;

  if (consumable.cost !== undefined) {
    consumableCode += `
    cost = ${consumable.cost},`;
  }

  if (consumable.unlocked !== undefined) {
    consumableCode += `
    unlocked = ${consumable.unlocked},`;
  }

  if (consumable.discovered !== undefined) {
    consumableCode += `
    discovered = ${consumable.discovered},`;
  }

  if (consumable.hidden !== undefined) {
    consumableCode += `
    hidden = ${consumable.hidden},`;
  }

  if (consumable.can_repeat_soul !== undefined) {
    consumableCode += `
    can_repeat_soul = ${consumable.can_repeat_soul},`;
  }

  consumableCode += `
    atlas = '${atlasKey}',`;

  const locVarsCode = generateLocVarsFunction(consumable);
  if (locVarsCode) {
    consumableCode += `
    ${locVarsCode},`;
  }

  const useCode = generateUseFunction(activeRules, modPrefix);
  if (useCode) {
    consumableCode += `
    ${useCode},`;
  }

  const canUseCode = generateCanUseFunction(activeRules, modPrefix);
  if (canUseCode) {
    consumableCode += `
    ${canUseCode},`;
  }

  consumableCode = consumableCode.replace(/,$/, "");
  consumableCode += `
}`;

  return {
    code: consumableCode,
    nextPosition,
  };
};

const generateUseFunction = (rules: Rule[], modPrefix: string): string => {
  if (rules.length === 0) {
    return `use = function(self, card, area, copier)
        
    end`;
  }

  let useFunction = `use = function(self, card, area, copier)
        local used_card = copier or card`;

  rules.forEach((rule) => {
    const conditionCode = generateConditionChain(rule);

    let ruleCode = "";
    if (conditionCode) {
      ruleCode += `
        if ${conditionCode} then`;
    }

    const effectResult = generateEffectReturnStatement(
      rule.effects || [],
      [],
      modPrefix
    );

    if (effectResult.preReturnCode) {
      ruleCode += `
            ${effectResult.preReturnCode}`;
    }

    if (effectResult.statement) {
      ruleCode += `
            ${effectResult.statement}`;
    }

    if (conditionCode) {
      ruleCode += `
        end`;
    }

    useFunction += ruleCode;
  });

  useFunction += `
    end`;

  return useFunction;
};

const generateCanUseFunction = (rules: Rule[], modPrefix: string): string => {
  if (rules.length === 0) {
    return `can_use = function(self, card)
        return true
    end`;
  }

  const ruleConditions: string[] = [];
  const customCanUseConditions: string[] = [];

  rules.forEach((rule) => {
    const conditionCode = generateConditionChain(rule);
    if (conditionCode) {
      ruleConditions.push(`(${conditionCode})`);
    }

    const effectResult = generateEffectReturnStatement(
      rule.effects || [],
      [],
      modPrefix
    );
    if (effectResult.customCanUse) {
      customCanUseConditions.push(`(${effectResult.customCanUse})`);
    }
  });

  const allConditions = [...ruleConditions, ...customCanUseConditions];

  if (allConditions.length === 0) {
    return `can_use = function(self, card)
        return true
    end`;
  }

  const combinedCondition = allConditions.join(" and ");

  return `can_use = function(self, card)
        return ${combinedCondition}
    end`;
};

const generateLocVarsFunction = (consumable: ConsumableData): string => {
  const descriptionHasVariables = consumable.description.includes("#");
  if (!descriptionHasVariables) {
    return `loc_vars = function(self, info_queue, card)
        return {vars = {}}
    end`;
  }

  const variablePlaceholders = consumable.description.match(/#(\d+)#/g) || [];
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

  const variableMapping: string[] = [];

  return `loc_vars = function(self, info_queue, card)
        return {vars = {${variableMapping.join(", ")}}}
    end`;
};

const formatConsumableDescription = (consumable: ConsumableData): string => {
  const formatted = consumable.description.replace(/<br\s*\/?>/gi, "[s]");

  const escaped = formatted.replace(/\n/g, "[s]") 
  const lines = escaped
    .split("[s]")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    lines.push(escaped.trim());
  }

  return `{
${lines
  .map((line, i) => `        [${i + 1}] = '${line.replace(/\\/g, "\\\\").replace(/"/g,"\\\"").replace(/'/g, "\\'")}'`)
  .join(",\n")}
    }`;
};
