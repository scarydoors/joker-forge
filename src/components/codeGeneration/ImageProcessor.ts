import JSZip from "jszip";
import { JokerData, BoosterData, EnhancementData } from "../data/BalatroUtils";
import { ConsumableData } from "../data/BalatroUtils";

export const processImages = async (
  items: (JokerData | ConsumableData | BoosterData | EnhancementData)[],
  scale: number = 1
): Promise<{
  atlasDataUrl: string;
  soulPositions: Record<number, { x: number; y: number }>;
}> => {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }

    // Disable image smoothing for crisp pixel art
    ctx.imageSmoothingEnabled = false;

    const itemsPerRow = 10;

    const totalPositions = items.reduce((total, item) => {
      return (
        total +
        ("overlayImagePreview" in item && item.overlayImagePreview ? 2 : 1)
      );
    }, 0);

    const rows = Math.ceil(totalPositions / itemsPerRow);

    canvas.width = itemsPerRow * 71 * scale;
    canvas.height = rows * 95 * scale;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const soulPositions: Record<number, { x: number; y: number }> = {};
    let currentPosition = 0;

    const imagePromises = items.map((item, index) => {
      const promises: Promise<void>[] = [];

      promises.push(
        new Promise<void>((resolve) => {
          const imageSrc =
            item.imagePreview ||
            "/images/placeholderjokers/placeholder-joker-1.png";
          const img = new Image();
          img.onload = () => {
            const col = currentPosition % itemsPerRow;
            const row = Math.floor(currentPosition / itemsPerRow);
            const x = col * 71 * scale;
            const y = row * 95 * scale;

            ctx.drawImage(
              img,
              0,
              0,
              img.width,
              img.height,
              x,
              y,
              71 * scale,
              95 * scale
            );

            currentPosition++;
            resolve();
          };

          img.onerror = () => {
            if (
              imageSrc !== "/images/placeholderjokers/placeholder-joker-1.png"
            ) {
              img.src = "/images/placeholderjokers/placeholder-joker-1.png";
            } else {
              currentPosition++;
              resolve();
            }
          };

          img.src = imageSrc;
        })
      );

      if ("overlayImagePreview" in item && item.overlayImagePreview) {
        promises.push(
          new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => {
              const col = currentPosition % itemsPerRow;
              const row = Math.floor(currentPosition / itemsPerRow);
              const x = col * 71 * scale;
              const y = row * 95 * scale;

              soulPositions[index] = { x: col, y: row };

              ctx.drawImage(
                img,
                0,
                0,
                img.width,
                img.height,
                x,
                y,
                71 * scale,
                95 * scale
              );

              currentPosition++;
              resolve();
            };

            img.onerror = () => {
              currentPosition++;
              resolve();
            };

            img.src =
              ("overlayImagePreview" in item
                ? item.overlayImagePreview
                : null) || "/images/placeholderjokers/placeholder-joker-1.png";
          })
        );
      }

      return Promise.all(promises);
    });

    await Promise.all(imagePromises);

    return {
      atlasDataUrl: canvas.toDataURL("image/png"),
      soulPositions,
    };
  } catch (error) {
    console.error("Error processing images:", error);
    throw error;
  }
};

export const dataURLToBlob = (dataUrl: string): Blob => {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new Blob([u8arr], { type: mime });
};

export const addAtlasToZip = async (
  zip: JSZip,
  jokers: JokerData[],
  consumables: ConsumableData[],
  boosters: BoosterData[] = [],
  enhancements: EnhancementData[] = []
): Promise<Record<string, Record<number, { x: number; y: number }>>> => {
  try {
    const assetsFolder = zip.folder("assets");
    const assets1xFolder = assetsFolder!.folder("1x");
    const assets2xFolder = assetsFolder!.folder("2x");

    const soulPositions: Record<
      string,
      Record<number, { x: number; y: number }>
    > = {};

    if (jokers.length > 0) {
      const jokerAtlas1xResult = await processImages(jokers, 1);
      const jokerAtlas1xBlob = dataURLToBlob(jokerAtlas1xResult.atlasDataUrl);
      assets1xFolder!.file("CustomJokers.png", jokerAtlas1xBlob);

      const jokerAtlas2xResult = await processImages(jokers, 2);
      const jokerAtlas2xBlob = dataURLToBlob(jokerAtlas2xResult.atlasDataUrl);
      assets2xFolder!.file("CustomJokers.png", jokerAtlas2xBlob);

      soulPositions["jokers"] = jokerAtlas1xResult.soulPositions;
    }

    if (consumables.length > 0) {
      const consumableAtlas1xResult = await processImages(consumables, 1);
      const consumableAtlas1xBlob = dataURLToBlob(
        consumableAtlas1xResult.atlasDataUrl
      );
      assets1xFolder!.file("CustomConsumables.png", consumableAtlas1xBlob);

      const consumableAtlas2xResult = await processImages(consumables, 2);
      const consumableAtlas2xBlob = dataURLToBlob(
        consumableAtlas2xResult.atlasDataUrl
      );
      assets2xFolder!.file("CustomConsumables.png", consumableAtlas2xBlob);

      soulPositions["consumables"] = consumableAtlas1xResult.soulPositions;
    }

    if (boosters.length > 0) {
      const boosterAtlas1xResult = await processImages(boosters, 1);
      const boosterAtlas1xBlob = dataURLToBlob(
        boosterAtlas1xResult.atlasDataUrl
      );
      assets1xFolder!.file("CustomBoosters.png", boosterAtlas1xBlob);

      const boosterAtlas2xResult = await processImages(boosters, 2);
      const boosterAtlas2xBlob = dataURLToBlob(
        boosterAtlas2xResult.atlasDataUrl
      );
      assets2xFolder!.file("CustomBoosters.png", boosterAtlas2xBlob);

      soulPositions["boosters"] = boosterAtlas1xResult.soulPositions;
    }

    if (enhancements.length > 0) {
      const enhancementAtlas1xResult = await processImages(enhancements, 1);
      const enhancementAtlas1xBlob = dataURLToBlob(
        enhancementAtlas1xResult.atlasDataUrl
      );
      assets1xFolder!.file("CustomEnhancements.png", enhancementAtlas1xBlob);

      const enhancementAtlas2xResult = await processImages(enhancements, 2);
      const enhancementAtlas2xBlob = dataURLToBlob(
        enhancementAtlas2xResult.atlasDataUrl
      );
      assets2xFolder!.file("CustomEnhancements.png", enhancementAtlas2xBlob);

      soulPositions["enhancements"] = enhancementAtlas1xResult.soulPositions;
    }

    return soulPositions;
  } catch (error) {
    console.error("Error adding atlas to zip:", error);
    throw error;
  }
};
