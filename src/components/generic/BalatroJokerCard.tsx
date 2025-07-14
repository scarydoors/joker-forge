import React, { useState, useEffect } from "react";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { BalatroText } from "./balatroTextFormatter";

interface JokerData {
  id: string;
  name: string;
  description: string;
  imagePreview: string;
  overlayImagePreview?: string;
  rarity: number | string;
  cost?: number;
  blueprint_compat?: boolean;
  eternal_compat?: boolean;
  unlocked?: boolean;
  discovered?: boolean;
}

interface BalatroJokerCardProps {
  joker: JokerData;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  rarityName: string;
  rarityColor: string;
}

const BalatroJokerCard: React.FC<BalatroJokerCardProps> = ({
  joker,
  onClick,
  className = "",
  size = "md",
  rarityName,
  rarityColor,
}) => {
  const [imageError, setImageError] = useState(false);
  const [placeholderError, setPlaceholderError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [joker.imagePreview]);

  const darkenColor = (hexColor: string, amount: number = 0.3): string => {
    // Remove # if present
    const hex = hexColor.replace("#", "");

    // Parse RGB values
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Darken each component
    const newR = Math.max(0, Math.floor(r * (1 - amount)));
    const newG = Math.max(0, Math.floor(g * (1 - amount)));
    const newB = Math.max(0, Math.floor(b * (1 - amount)));

    // Convert back to hex
    const toHex = (n: number) => n.toString(16).padStart(2, "0");
    return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
  };

  const getRarityStyles = () => {
    const vanillaStyles: Record<string, { bg: string; shadow: string }> = {
      "#009dff": { bg: "bg-balatro-blueshadow", shadow: "bg-balatro-blue" },
      "#4BC292": { bg: "bg-balatro-greenshadow", shadow: "bg-balatro-green" },
      "#fe5f55": { bg: "bg-balatro-redshadow", shadow: "bg-balatro-red" },
      "#b26cbb": { bg: "bg-balatro-purpleshadow", shadow: "bg-balatro-purple" },
    };

    // If it's a vanilla rarity, use the predefined styles
    if (vanillaStyles[rarityColor]) {
      return vanillaStyles[rarityColor];
    }

    // For custom rarities, generate a darkened shadow color
    const shadowColor = darkenColor(rarityColor, 0.4);
    return {
      bg: shadowColor,
      shadow: rarityColor,
    };
  };

  const sizeClasses = {
    sm: {
      image: "w-28 h-36",
      infoWidth: "min-w-40",
    },
    md: {
      image: "w-40 h-52",
      infoWidth: "min-w-48",
    },
    lg: {
      image: "w-48 h-64",
      infoWidth: "min-w-56",
    },
  };

  const currentSize = sizeClasses[size];
  const rarityStyles = getRarityStyles();
  const isVanillaRarity = rarityStyles.bg.startsWith("bg-");

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div
      className={`select-none font-game relative ${className} ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex flex-col items-center">
        {joker.cost !== undefined && (
          <div className="bg-cost-bg border-4 border-cost-border rounded-t-2xl px-4 py-1 -mb-1 z-10 relative">
            <span className="text-cost-text font-bold text-shadow-cost text-2xl">
              ${joker.cost}
            </span>
          </div>
        )}

        <div
          className={`${
            currentSize.image
          } mb-2 flex items-center justify-center overflow-hidden relative z-10 ${
            joker.cost !== undefined ? "rounded-t-none" : ""
          } `}
        >
          {!imageError && joker.imagePreview ? (
            <div className="relative w-full h-full">
              <img
                src={joker.imagePreview}
                alt={joker.name}
                className="w-full h-full object-cover pixelated"
                draggable="false"
                onError={handleImageError}
              />
              {joker.overlayImagePreview && (
                <img
                  src={joker.overlayImagePreview}
                  alt={`${joker.name} overlay`}
                  className="absolute inset-0 w-full h-full object-cover pixelated"
                  draggable="false"
                />
              )}
            </div>
          ) : !placeholderError ? (
            <img
              src="/images/placeholder-joker.png"
              alt="Placeholder Joker"
              className="w-full h-full"
              draggable="false"
              onError={() => setPlaceholderError(true)}
            />
          ) : (
            <div className="w-full h-full bg-balatro-black flex items-center justify-center">
              <PhotoIcon className="h-16 w-16 text-white-darker" />
            </div>
          )}
        </div>

        <div
          className={`${currentSize.infoWidth} flex-shrink-0 absolute top-full left-1/2 transform -translate-x-1/2 z-20`}
        >
          <div className="relative m-2">
            <div className="absolute inset-0 bg-balatro-lightgreyshadow rounded-2xl translate-y-1" />
            <div className="relative">
              <div className="bg-balatro-lightgrey rounded-2xl p-1">
                <div className="bg-balatro-black rounded-xl p-3">
                  <h3 className="text-2xl mb-2 text-center text-balatro-white text-shadow-pixel">
                    {joker.name || "New Joker"}
                  </h3>

                  <div className="relative mb-3">
                    <div className="absolute inset-0 bg-balatro-whiteshadow rounded-xl translate-y-1" />
                    <div className="bg-balatro-white text-balatro-black font-thin px-3 py-2 rounded-xl relative overflow-visible">
                      <div className="text-base text-center leading-4 relative z-10">
                        <BalatroText
                          text={
                            joker.description ||
                            "A custom joker with unique effects."
                          }
                          noWrap={true}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="relative mx-6 mt-3">
                    {isVanillaRarity ? (
                      <>
                        <div
                          className={`absolute inset-0 ${rarityStyles.bg} rounded-xl translate-y-1`}
                        />
                        <div
                          className={`${rarityStyles.shadow} rounded-xl text-center text-lg text-balatro-white py-1 relative`}
                        >
                          <span className="relative text-shadow-pixel">
                            {rarityName}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          className="absolute inset-0 rounded-xl translate-y-1"
                          style={{ backgroundColor: rarityStyles.bg }}
                        />
                        <div
                          className="rounded-xl text-center text-lg text-balatro-white py-1 relative"
                          style={{ backgroundColor: rarityStyles.shadow }}
                        >
                          <span className="relative text-shadow-pixel">
                            {rarityName}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalatroJokerCard;
