import JSZip from "jszip";
import {
  JokerData,
  BoosterData,
  RarityData,
  ConsumableData,
  EnhancementData,
} from "../data/BalatroUtils";
import { addAtlasToZip } from "./ImageProcessor";
import { generateJokersCode, generateCustomRaritiesCode } from "./Jokers/index";
import { generateConsumablesCode } from "./Consumables/index";
import { generateBoostersCode } from "./boosters";
import { ConsumableSetData } from "../data/BalatroUtils";
import { modToJson } from "../JSONImportExport";
import { generateEnhancementsCode } from "./Card/index";
import { ModMetadata } from "../pages/ModMetadataPage";

const sortForExport = <T extends { id: string; name: string }>(
  items: T[]
): T[] => {
  return [...items].sort((a, b) => {
    const nameComparison = a.name.localeCompare(b.name);
    if (nameComparison !== 0) return nameComparison;
    return a.id.localeCompare(b.id);
  });
};

export const exportModCode = async (
  jokers: JokerData[],
  consumables: ConsumableData[],
  metadata: ModMetadata,
  customRarities: RarityData[] = [],
  consumableSets: ConsumableSetData[] = [],
  boosters: BoosterData[] = [],
  enhancements: EnhancementData[] = []
): Promise<boolean> => {
  try {
    console.log("Generating mod code...");
    console.log("Jokers:", jokers);
    console.log("Consumables:", consumables);
    console.log("Boosters:", boosters);
    console.log("Metadata:", metadata);
    console.log("Rarities:", customRarities);
    console.log("Consumable Sets:", consumableSets);
    console.log("Enhancements:", enhancements);

    const zip = new JSZip();

    const sortedJokers = sortForExport(jokers);
    const sortedConsumables = sortForExport(consumables);
    const sortedBoosters = sortForExport(boosters);
    const sortedEnhancements = sortForExport(enhancements);

    const hasModIcon = !!(metadata.hasUserUploadedIcon || metadata.iconImage);

    const mainLuaCode = generateMainLuaCode(
      sortedJokers,
      sortedConsumables,
      customRarities,
      sortedBoosters,
      sortedEnhancements,
      hasModIcon
    );
    zip.file(metadata.main_file, mainLuaCode);

    const ret = modToJson(
      metadata,
      sortedJokers,
      customRarities,
      sortedConsumables,
      consumableSets,
      sortedBoosters,
      sortedEnhancements
    );
    zip.file(ret.filename, ret.jsonString);

    if (customRarities.length > 0) {
      const raritiesCode = generateCustomRaritiesCode(customRarities);
      zip.file("rarities.lua", raritiesCode);
    }

    console.log("mod metadata: ", metadata.prefix);

    if (sortedJokers.length > 0) {
      const { jokersCode } = generateJokersCode(
        sortedJokers,
        "CustomJokers",
        metadata.prefix
      );

      const jokersFolder = zip.folder("jokers");
      Object.entries(jokersCode).forEach(([filename, code]) => {
        jokersFolder!.file(filename, code);
      });
    }

    if (sortedConsumables.length > 0 || consumableSets.length > 0) {
      const { consumablesCode } = generateConsumablesCode(sortedConsumables, {
        modPrefix: metadata.prefix,
        atlasKey: "CustomConsumables",
        consumableSets: consumableSets,
      });

      const consumablesFolder = zip.folder("consumables");
      Object.entries(consumablesCode).forEach(([filename, code]) => {
        consumablesFolder!.file(filename, code);
      });
    }

    if (sortedBoosters.length > 0) {
      const { boostersCode } = generateBoostersCode(
        sortedBoosters,
        metadata.prefix
      );
      zip.file("boosters.lua", boostersCode);
    }

    if (sortedEnhancements.length > 0) {
      const { enhancementsCode } = generateEnhancementsCode(
        sortedEnhancements,
        {
          modPrefix: metadata.prefix,
          atlasKey: "CustomEnhancements",
        }
      );

      const enhancementsFolder = zip.folder("enhancements");
      Object.entries(enhancementsCode).forEach(([filename, code]) => {
        enhancementsFolder!.file(filename, code);
      });
    }

    zip.file(`${metadata.id}.json`, generateModJson(metadata));

    let modIconData: string | undefined;
    if (metadata.hasUserUploadedIcon && metadata.iconImage) {
      modIconData = metadata.iconImage;
    } else if (!metadata.hasUserUploadedIcon) {
      try {
        const response = await fetch("/images/modicon.png");
        const blob = await response.blob();
        modIconData = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch {
        console.log("Default mod icon not available");
        modIconData = undefined;
      }
    }

    await addAtlasToZip(
      zip,
      sortedJokers,
      sortedConsumables,
      sortedBoosters,
      sortedEnhancements,
      modIconData
    );

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

const generateMainLuaCode = (
  jokers: JokerData[],
  consumables: ConsumableData[],
  customRarities: RarityData[],
  boosters: BoosterData[],
  enhancements: EnhancementData[],
  hasModIcon: boolean
): string => {
  let output = "";

  if (hasModIcon) {
    output += `SMODS.Atlas({
    key = "modicon", 
    path = "ModIcon.png", 
    px = 34,
    py = 34,
    atlas_table = "ASSET_ATLAS"
}):register()

`;
  }

  if (jokers.length > 0) {
    output += `SMODS.Atlas({
    key = "CustomJokers", 
    path = "CustomJokers.png", 
    px = 71,
    py = 95, 
    atlas_table = "ASSET_ATLAS"
}):register()

`;
  }

  if (consumables.length > 0) {
    output += `SMODS.Atlas({
    key = "CustomConsumables", 
    path = "CustomConsumables.png", 
    px = 71,
    py = 95, 
    atlas_table = "ASSET_ATLAS"
}):register()

`;
  }

  if (boosters.length > 0) {
    output += `SMODS.Atlas({
    key = "CustomBoosters", 
    path = "CustomBoosters.png", 
    px = 71,
    py = 95, 
    atlas_table = "ASSET_ATLAS"
}):register()

`;
  }

  if (enhancements.length > 0) {
    output += `SMODS.Atlas({
    key = "CustomEnhancements", 
    path = "CustomEnhancements.png", 
    px = 71,
    py = 95, 
    atlas_table = "ASSET_ATLAS"
}):register()

`;
  }

  output += `local NFS = require("nativefs")
to_big = to_big or function(a) return a end
lenient_bignum = lenient_bignum or function(a) return a end

`;

  if (jokers.length > 0) {
    output += `local function load_jokers_folder()
    local mod_path = SMODS.current_mod.path
    local jokers_path = mod_path .. "/jokers"
    local files = NFS.getDirectoryItemsInfo(jokers_path)
    for i = 1, #files do
        local file_name = files[i].name
        if file_name:sub(-4) == ".lua" then
            assert(SMODS.load_file("jokers/" .. file_name))()
        end
    end
end

`;
  }

  if (consumables.length > 0) {
    output += `local function load_consumables_folder()
    local mod_path = SMODS.current_mod.path
    local consumables_path = mod_path .. "/consumables"
    local files = NFS.getDirectoryItemsInfo(consumables_path)
    for i = 1, #files do
        local file_name = files[i].name
        if file_name:sub(-4) == ".lua" then
            assert(SMODS.load_file("consumables/" .. file_name))()
        end
    end
end

`;
  }

  if (customRarities.length > 0) {
    output += `local function load_rarities_file()
    local mod_path = SMODS.current_mod.path
    assert(SMODS.load_file("rarities.lua"))()
end

load_rarities_file()
`;
  }

  if (boosters.length > 0) {
    output += `local function load_boosters_file()
    local mod_path = SMODS.current_mod.path
    assert(SMODS.load_file("boosters.lua"))()
end

load_boosters_file()
`;
  }

  if (enhancements.length > 0) {
    output += `local function load_enhancements_folder()
    local mod_path = SMODS.current_mod.path
    local enhancements_path = mod_path .. "/enhancements"
    local files = NFS.getDirectoryItemsInfo(enhancements_path)
    for i = 1, #files do
        local file_name = files[i].name
        if file_name:sub(-4) == ".lua" then
            assert(SMODS.load_file("enhancements/" .. file_name))()
        end
    end
end

`;
  }

  if (jokers.length > 0) {
    output += `load_jokers_folder()
`;
  }

  if (consumables.length > 0) {
    output += `load_consumables_folder()
`;
  }

  if (enhancements.length > 0) {
    output += `load_enhancements_folder()
`;
  }

  return output.trim();
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
