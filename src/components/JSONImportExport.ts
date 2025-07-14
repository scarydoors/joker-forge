import { ModMetadata } from "./pages/ModMetadataPage";
import { JokerData } from "./JokerCard";
import { RarityData } from "./pages/RaritiesPage";

export interface ExportedMod {
  metadata: ModMetadata;
  jokers: JokerData[];
  customRarities: RarityData[];
  version: string;
  exportedAt: string;
}

export const exportModAsJSON = (
  metadata: ModMetadata,
  jokers: JokerData[],
  customRarities: RarityData[] = []
): void => {
  const exportData: ExportedMod = {
    metadata,
    jokers,
    customRarities,
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
  customRarities: RarityData[];
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

          resolve({
            metadata: importData.metadata,
            jokers: importData.jokers,
            customRarities: importData.customRarities || [],
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
