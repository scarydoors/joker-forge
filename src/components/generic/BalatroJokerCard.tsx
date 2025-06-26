import React, { useState, useEffect } from "react";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { BalatroText } from "./balatroTextFormatter";

interface JokerData {
  id: string;
  name: string;
  description: string;
  imagePreview: string;
  overlayImagePreview?: string;
  rarity: number;
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
}

const BalatroJokerCard: React.FC<BalatroJokerCardProps> = ({
  joker,
  onClick,
  className = "",
  size = "md",
}) => {
  const [imageError, setImageError] = useState(false);
  const [placeholderError, setPlaceholderError] = useState(false);

  // Reset error states when joker image changes
  useEffect(() => {
    setImageError(false);
  }, [joker.imagePreview]);

  const getRarityText = (rarity: number): string => {
    const rarityMap: Record<number, string> = {
      1: "Common",
      2: "Uncommon",
      3: "Rare",
      4: "Legendary",
    };
    return rarityMap[rarity] || "Common";
  };

  const getRarityStyles = (rarity: number) => {
    const styleMap: Record<number, { bg: string; shadow: string }> = {
      // these are reversed because im silly and i cant be bothered to rewrite
      1: {
        bg: "bg-balatro-blueshadow",
        shadow: "bg-balatro-blue",
      },
      2: {
        bg: "bg-balatro-greenshadow",
        shadow: "bg-balatro-green",
      },
      3: {
        bg: "bg-balatro-redshadow",
        shadow: "bg-balatro-red",
      },
      4: {
        bg: "bg-balatro-purpleshadow",
        shadow: "bg-balatro-purple",
      },
    };
    return styleMap[rarity] || styleMap[1];
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
  const rarityStyles = getRarityStyles(joker.rarity);
  const rarityText = getRarityText(joker.rarity);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div
      className={`select-none font-game ${className} ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex flex-col items-center">
        {/* Cost Display - positioned above image */}
        {joker.cost !== undefined && (
          <div className="bg-cost-bg border-4 border-cost-border rounded-t-2xl px-4 py-1 -mb-1 -z-10 relative">
            <span className="text-cost-text font-bold text-shadow-cost text-2xl">
              ${joker.cost}
            </span>
          </div>
        )}

        {/* Image Section */}
        <div
          className={`${
            currentSize.image
          } mb-2 flex items-center justify-center overflow-hidden ${
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

        {/* Info Section - separate from image */}
        <div className={`${currentSize.infoWidth} flex-shrink-0`}>
          <div className="relative m-2">
            <div className="absolute inset-0 bg-balatro-lightgreyshadow rounded-2xl translate-y-1" />
            <div className="relative">
              <div className="bg-balatro-lightgrey rounded-2xl p-1">
                <div className="bg-balatro-black rounded-xl p-3">
                  <h3 className="text-2xl mb-2 text-center text-balatro-white text-shadow-pixel">
                    {joker.name || "New Joker"}
                  </h3>

                  {/* Description Box - positioned to grow independently */}
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
                    <div
                      className={`absolute inset-0 ${rarityStyles.bg} rounded-xl translate-y-1`}
                    />
                    <div
                      className={`${rarityStyles.shadow} rounded-xl text-center text-lg text-balatro-white py-1 relative`}
                    >
                      <span className="relative text-shadow-pixel">
                        {rarityText}
                      </span>
                    </div>
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
