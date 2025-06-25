import JSZip from "jszip";
import { JokerData } from "../JokerCard";

export const processJokerImages = async (
  jokers: JokerData[],
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

    const jokersPerRow = 10;

    const totalPositions = jokers.reduce((total, joker) => {
      return total + (joker.overlayImagePreview ? 2 : 1);
    }, 0);

    const rows = Math.ceil(totalPositions / jokersPerRow);

    canvas.width = jokersPerRow * 71 * scale;
    canvas.height = rows * 95 * scale;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const soulPositions: Record<number, { x: number; y: number }> = {};
    let currentPosition = 0;

    const imagePromises = jokers.map((joker, index) => {
      const promises: Promise<void>[] = [];

      promises.push(
        new Promise<void>((resolve) => {
          const imageSrc =
            joker.imagePreview || "/images/placeholder-joker.png";
          const img = new Image();
          img.onload = () => {
            const col = currentPosition % jokersPerRow;
            const row = Math.floor(currentPosition / jokersPerRow);
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
            console.error(
              `Error loading main image at index ${index}, using placeholder`
            );
            if (imageSrc !== "/images/placeholder-joker.png") {
              img.src = "/images/placeholder-joker.png";
            } else {
              currentPosition++;
              resolve();
            }
          };

          img.src = imageSrc;
        })
      );

      if (joker.overlayImagePreview) {
        promises.push(
          new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => {
              const col = currentPosition % jokersPerRow;
              const row = Math.floor(currentPosition / jokersPerRow);
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
              console.error(`Error loading overlay image at index ${index}`);
              currentPosition++;
              resolve();
            };

            img.src =
              joker.overlayImagePreview || "/images/placeholder-joker.png";
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
    console.error("Error processing joker images:", error);
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
  jokers: JokerData[]
): Promise<Record<number, { x: number; y: number }>> => {
  try {
    const assetsFolder = zip.folder("assets");
    const assets1xFolder = assetsFolder!.folder("1x");
    const assets2xFolder = assetsFolder!.folder("2x");

    const atlas1xResult = await processJokerImages(jokers, 1);
    const atlas1xBlob = dataURLToBlob(atlas1xResult.atlasDataUrl);
    assets1xFolder!.file("CustomJokers.png", atlas1xBlob);

    const atlas2xResult = await processJokerImages(jokers, 2);
    const atlas2xBlob = dataURLToBlob(atlas2xResult.atlasDataUrl);
    assets2xFolder!.file("CustomJokers.png", atlas2xBlob);

    return atlas1xResult.soulPositions;
  } catch (error) {
    console.error("Error adding atlas to zip:", error);
    throw error;
  }
};
