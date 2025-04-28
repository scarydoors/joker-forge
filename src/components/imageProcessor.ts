import JSZip from "jszip";
import { JokerData } from "./JokerCard";

/**
 * Process uploaded joker images for the mod
 * Creates properly sized images for the atlas
 * @param images - Array of image data URLs
 * @param scale - Scale factor (1 for 1x, 2 for 2x)
 * @returns - Promise that resolves with processed image for the atlas
 */
export const processJokerImages = async (
  images: string[],
  scale: number = 1
): Promise<string> => {
  try {
    // Create a canvas for the atlas
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }

    // Calculate the atlas size based on number of jokers
    // Each joker is 71x95 pixels in the 1x atlas
    const jokersPerRow = 10;
    const rows = Math.ceil(images.length / jokersPerRow);

    canvas.width = jokersPerRow * 71 * scale;
    canvas.height = rows * 95 * scale;

    // Fill with transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Load and draw each image
    const imagePromises = images.map((src, index) => {
      return new Promise<void>((resolve) => {
        // Use default placeholder if no image provided
        const imageSrc = src || "/images/placeholder-joker.png";

        const img = new Image();
        img.onload = () => {
          // Calculate position in the atlas
          const col = index % jokersPerRow;
          const row = Math.floor(index / jokersPerRow);
          const x = col * 71 * scale;
          const y = row * 95 * scale;

          // Draw at appropriate size based on scale
          ctx.drawImage(
            img,
            0,
            0,
            img.width,
            img.height, // Source rectangle
            x,
            y,
            71 * scale,
            95 * scale // Destination rectangle
          );

          resolve();
        };

        img.onerror = () => {
          console.error(
            `Error loading image at index ${index}, using placeholder`
          );
          // Try loading placeholder on error
          if (imageSrc !== "/images/placeholder-joker.png") {
            img.src = "/images/placeholder-joker.png";
          } else {
            // If placeholder also fails, just resolve with empty spot
            resolve();
          }
        };

        img.src = imageSrc;
      });
    });

    // Wait for all images to be drawn
    await Promise.all(imagePromises);

    // Convert canvas to data URL
    return canvas.toDataURL("image/png");
  } catch (error) {
    console.error("Error processing joker images:", error);
    throw error;
  }
};

/**
 * Convert a data URL to a Blob for file saving
 * @param dataUrl - Data URL string
 * @returns - Blob object
 */
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

/**
 * Add the atlas image to a JSZip archive with proper structure
 * @param zip - JSZip instance
 * @param jokers - Array of joker objects with imagePreview properties
 * @returns - Promise that resolves when the atlas is added
 */
export const addAtlasToZip = async (
  zip: JSZip,
  jokers: JokerData[]
): Promise<void> => {
  try {
    // Get preview images
    const images = jokers.map((joker) => joker.imagePreview);

    // Create the directory structure
    const assetsFolder = zip.folder("assets");
    const assets1xFolder = assetsFolder!.folder("1x");
    const assets2xFolder = assetsFolder!.folder("2x");

    // Process images and create 1x atlas
    const atlas1xDataUrl = await processJokerImages(images, 1);
    const atlas1xBlob = dataURLToBlob(atlas1xDataUrl);
    assets1xFolder!.file("CustomJokers.png", atlas1xBlob);

    // Process images and create 2x atlas
    const atlas2xDataUrl = await processJokerImages(images, 2);
    const atlas2xBlob = dataURLToBlob(atlas2xDataUrl);
    assets2xFolder!.file("CustomJokers.png", atlas2xBlob);
  } catch (error) {
    console.error("Error adding atlas to zip:", error);
    throw error;
  }
};
