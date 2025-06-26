import React, { useState } from "react";
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
      1: {
        bg: "bg-balatro-blue",
        shadow: "bg-balatro-blueshadow",
      },
      2: {
        bg: "bg-balatro-green",
        shadow: "bg-balatro-greenshadow",
      },
      3: {
        bg: "bg-balatro-red",
        shadow: "bg-balatro-redshadow",
      },
      4: {
        bg: "bg-balatro-purple",
        shadow: "bg-balatro-purpleshadow",
      },
    };
    return styleMap[rarity] || styleMap[1];
  };

  const sizeClasses = {
    sm: {
      image: "w-32 h-40",
      infoWidth: "w-44",
    },
    md: {
      image: "w-48 h-60",
      infoWidth: "w-56",
    },
    lg: {
      image: "w-56 h-72",
      infoWidth: "w-64",
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
        <div
          className={`${currentSize.image} mb-2 flex items-center justify-center overflow-hidden`}
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
          ) : (
            <div className="w-full h-full bg-balatro-black flex items-center justify-center">
              <PhotoIcon className="h-16 w-16 text-white-darker opacity-50" />
            </div>
          )}
        </div>

        <div className={`${currentSize.infoWidth}`}>
          <div className="relative m-2">
            <div className="absolute inset-0 bg-balatro-lightgreyshadow rounded-2xl translate-y-1" />
            <div className="relative">
              <div className="bg-balatro-lightgrey rounded-2xl p-1">
                <div className="bg-balatro-black rounded-xl p-3">
                  <h3 className="text-2xl mb-2 text-center text-balatro-white text-shadow-pixel">
                    {joker.name || "New Joker"}
                  </h3>

                  <div className="relative">
                    <div className="absolute inset-0 bg-balatro-whiteshadow rounded-xl translate-y-1" />
                    <div className="bg-balatro-white text-balatro-black font-thin px-3 py-2 rounded-xl relative mb-3">
                      <div className="text-base text-center leading-4">
                        <BalatroText
                          text={
                            joker.description ||
                            "A custom joker with unique effects."
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="relative mx-6 mt-3">
                    <div
                      className={`absolute inset-0 ${rarityStyles.shadow} rounded-xl translate-y-1`}
                    />
                    <div
                      className={`${rarityStyles.bg} rounded-xl text-center text-lg text-balatro-white py-1`}
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
