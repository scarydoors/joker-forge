import { ModMetadata } from "./pages/ModMetadataPage";
import { JokerData } from "./JokerCard";
import { ConsumableData } from "./ConsumableCard";
import { RarityData } from "./pages/RaritiesPage";
import { ConsumableSetData } from "./pages/ConsumablesPage";

export interface ExportedMod {
  metadata: ModMetadata;
  jokers: JokerData[];
  consumables: ConsumableData[];
  customRarities: RarityData[];
  consumableSets: ConsumableSetData[];
  version: string;
  exportedAt: string;
}

export const exportModAsJSON = (
  metadata: ModMetadata,
  jokers: JokerData[],
  customRarities: RarityData[] = [],
  consumables: ConsumableData[] = [],
  consumableSets: ConsumableSetData[] = []
): void => {
  const exportData: ExportedMod = {
    metadata,
    jokers,
    consumables,
    customRarities,
    consumableSets,
    version: "1.0.0",
    exportedAt: new Date().toISOString(),
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const filename = `${metadata.id || "custom-mod"}-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importModFromJSON = (): Promise<{
  metadata: ModMetadata;
  jokers: JokerData[];
  consumables: ConsumableData[];
  customRarities: RarityData[];
  consumableSets: ConsumableSetData[];
} | null> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonString = e.target?.result as string;
          const importData: ExportedMod = JSON.parse(jsonString);

          if (!importData.metadata || !importData.jokers) {
            throw new Error("Invalid mod file format");
          }

          if (!Array.isArray(importData.jokers)) {
            throw new Error("Invalid jokers data");
          }

          if (
            importData.consumables &&
            !Array.isArray(importData.consumables)
          ) {
            throw new Error("Invalid consumables data");
          }

          if (
            importData.consumableSets &&
            !Array.isArray(importData.consumableSets)
          ) {
            throw new Error("Invalid consumable sets data");
          }

          resolve({
            metadata: importData.metadata,
            jokers: importData.jokers,
            consumables: importData.consumables || [],
            customRarities: importData.customRarities || [],
            consumableSets: importData.consumableSets || [],
          });
        } catch (error) {
          console.error("Error parsing mod file:", error);
          reject(
            new Error(
              "Invalid mod file format. Please check the file and try again."
            )
          );
        }
      };

      reader.onerror = () => {
        console.error("Error reading file");
        reject(new Error("Failed to read the selected file."));
      };

      reader.readAsText(file);
    };

    input.oncancel = () => {
      resolve(null);
    };

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  });
};
