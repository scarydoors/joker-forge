import JSZip from "jszip";
import { JokerData } from "../JokerCard";
import { ConsumableData } from "../data/BalatroUtils";
import { RarityData } from "../pages/RaritiesPage";
import { addAtlasToZip } from "./ImageProcessor";
import { generateJokersCode, generateCustomRaritiesCode } from "./Jokers/index";
import { generateConsumablesCode } from "./Consumables/index";
import { ConsumableSetData } from "../data/BalatroUtils";
import { modToJson } from "../JSONImportExport";

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

export const exportModCode = async (
  jokers: JokerData[],
  consumables: ConsumableData[],
  metadata: ModMetadata,
  customRarities: RarityData[] = [],
  consumableSets: ConsumableSetData[] = []
): Promise<boolean> => {
  try {
    console.log("Generating mod code...");
    console.log("Jokers:", jokers);
    console.log("Consumables:", consumables);
    console.log("Metadata:", metadata);
    console.log("Rarities:", customRarities);
    console.log("Consumable Sets:", consumableSets);
    const zip = new JSZip();

    const mainLuaCode = generateMainLuaCode(
      jokers,
      consumables,
      customRarities
    );
    zip.file(metadata.main_file, mainLuaCode);

    const ret = modToJson(
      metadata,
      jokers,
      customRarities,
      consumables,
      consumableSets
    )
    zip.file(ret.filename, ret.jsonString)

    if (customRarities.length > 0) {
      const raritiesCode = generateCustomRaritiesCode(customRarities);
      zip.file("rarities.lua", raritiesCode);
    }

    if (jokers.length > 0) {
      const { jokersCode } = generateJokersCode(jokers, {
        modPrefix: metadata.prefix,
        atlasKey: "CustomJokers",
      });

      const jokersFolder = zip.folder("jokers");
      Object.entries(jokersCode).forEach(([filename, code]) => {
        jokersFolder!.file(filename, code);
      });
    }

    if (consumables.length > 0 || consumableSets.length > 0) {
      const { consumablesCode } = generateConsumablesCode(consumables, {
        modPrefix: metadata.prefix,
        atlasKey: "CustomConsumables",
        consumableSets: consumableSets,
      });

      const consumablesFolder = zip.folder("consumables");
      Object.entries(consumablesCode).forEach(([filename, code]) => {
        consumablesFolder!.file(filename, code);
      });
    }

    zip.file(`${metadata.id}.json`, generateModJson(metadata));

    await addAtlasToZip(zip, jokers, consumables);

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
  customRarities: RarityData[]
): string => {
  let output = "";

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

  output += `local NFS = require("nativefs")
to_big = to_big or function(a) return a end

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

  if (jokers.length > 0) {
    output += `load_jokers_folder()
`;
  }

  if (consumables.length > 0) {
    output += `load_consumables_folder()
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
