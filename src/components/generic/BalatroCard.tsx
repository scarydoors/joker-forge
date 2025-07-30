import React, { useState, useEffect } from "react";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { BalatroText } from "./balatroTextFormatter";

interface BaseCardData {
  id: string;
  name: string;
  description: string;
  imagePreview?: string;
  overlayImagePreview?: string;
  cost?: number;
}

interface JokerCardData extends BaseCardData {
  rarity: number | string;
  locVars?: {
    vars: (string | number)[];
  };
}

interface ConsumableCardData extends BaseCardData {
  set: string;
}

interface BoosterCardData extends BaseCardData {
  config: {
    extra: number;
    choose: number;
  };
  booster_type: string;
}

type CardData = JokerCardData | ConsumableCardData | BoosterCardData;

interface BalatroCardProps {
  type: "joker" | "consumable" | "booster";
  data: CardData;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";

  // Type-specific props
  rarityName?: string;
  rarityColor?: string;
  setName?: string;
  setColor?: string;
}

const BalatroCard: React.FC<BalatroCardProps> = ({
  type,
  data,
  onClick,
  className = "",
  size = "md",
  rarityName,
  rarityColor,
  setName,
  setColor,
}) => {
  const [imageError, setImageError] = useState(false);
  const [placeholderError, setPlaceholderError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [data.imagePreview]);

  const darkenColor = (hexColor: string, amount: number = 0.3): string => {
    const hex = hexColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const newR = Math.max(0, Math.floor(r * (1 - amount)));
    const newG = Math.max(0, Math.floor(g * (1 - amount)));
    const newB = Math.max(0, Math.floor(b * (1 - amount)));

    const toHex = (n: number) => n.toString(16).padStart(2, "0");
    return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
  };

  const getBadgeStyles = () => {
    if (type === "joker" && rarityColor) {
      const vanillaStyles: Record<string, { bg: string; shadow: string }> = {
        "#009dff": { bg: "bg-balatro-blueshadow", shadow: "bg-balatro-blue" },
        "#4BC292": { bg: "bg-balatro-greenshadow", shadow: "bg-balatro-green" },
        "#fe5f55": { bg: "bg-balatro-redshadow", shadow: "bg-balatro-red" },
        "#b26cbb": {
          bg: "bg-balatro-purpleshadow",
          shadow: "bg-balatro-purple",
        },
      };

      if (vanillaStyles[rarityColor]) {
        return vanillaStyles[rarityColor];
      }

      const shadowColor = darkenColor(rarityColor, 0.4);
      return {
        bg: shadowColor,
        shadow: rarityColor,
      };
    }

    if (type === "consumable" && setColor) {
      const vanillaStyles: Record<string, { bg: string; shadow: string }> = {
        "#b26cbb": {
          bg: "bg-balatro-purpleshadow",
          shadow: "bg-balatro-purple",
        },
        "#13afce": {
          bg: "bg-balatro-planetshadow",
          shadow: "bg-balatro-planet",
        },
        "#4584fa": {
          bg: "bg-balatro-spectralshadow",
          shadow: "bg-balatro-spectral",
        },
      };

      if (vanillaStyles[setColor]) {
        return vanillaStyles[setColor];
      }

      const shadowColor = darkenColor(setColor, 0.4);
      return {
        bg: shadowColor,
        shadow: setColor,
      };
    }

    // Default for boosters
    return {
      bg: "bg-balatro-greenshadow",
      shadow: "bg-balatro-green",
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
  const badgeStyles = getBadgeStyles();
  const isVanillaBadge = badgeStyles.bg.startsWith("bg-");

  const handleImageError = () => {
    setImageError(true);
  };

  const getPlaceholderImage = () => {
    switch (type) {
      case "joker":
        return "/images/placeholder-joker.png";
      case "consumable":
        return "/images/placeholder-consumable.png";
      case "booster":
        return "/images/placeholder-booster.png";
      default:
        return "/images/placeholder-joker.png";
    }
  };

  const getBadgeText = () => {
    if (type === "joker") {
      return rarityName || "Common";
    }
    if (type === "consumable") {
      return setName || "Tarot";
    }
    if (type === "booster") {
      const boosterData = data as BoosterCardData;
      const typeLabel = boosterData.booster_type
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      return `${typeLabel} Pack`;
    }
    return "";
  };

  const getLocVars = (): { colours?: string[] } | undefined => {
    if (type === "joker") {
      const jokerData = data as JokerCardData;
      if (jokerData.locVars && Array.isArray(jokerData.locVars.vars)) {
        // Only include string values for colours
        const colours = jokerData.locVars.vars.filter(
          (v) => typeof v === "string"
        ) as string[];
        return colours.length > 0 ? { colours } : undefined;
      }
    }
    return undefined;
  };

  return (
    <div
      className={`select-none font-game relative ${className} ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex flex-col items-center">
        {data.cost !== undefined && (
          <div className="bg-cost-bg border-4 border-cost-border rounded-t-2xl px-4 py-1 -mb-1 z-10 relative">
            <span className="text-cost-text font-bold text-shadow-cost text-2xl">
              ${data.cost}
            </span>
          </div>
        )}

        <div
          className={`${
            currentSize.image
          } mb-2 flex items-center justify-center overflow-hidden relative z-10 ${
            data.cost !== undefined ? "rounded-t-none" : ""
          } `}
        >
          {!imageError && data.imagePreview ? (
            <div className="relative w-full h-full">
              <img
                src={data.imagePreview}
                alt={data.name}
                className="w-full h-full object-cover pixelated"
                draggable="false"
                onError={handleImageError}
              />
              {data.overlayImagePreview && (
                <img
                  src={data.overlayImagePreview}
                  alt={`${data.name} overlay`}
                  className="absolute inset-0 w-full h-full object-cover pixelated"
                  draggable="false"
                />
              )}
            </div>
          ) : !placeholderError ? (
            <img
              src={getPlaceholderImage()}
              alt={`Placeholder ${type}`}
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
                    {data.name || `New ${type}`}
                  </h3>

                  <div className="relative mb-3">
                    <div className="absolute inset-0 bg-balatro-whiteshadow rounded-xl translate-y-1" />
                    <div className="bg-balatro-white text-balatro-black font-thin px-3 py-2 rounded-xl relative overflow-visible">
                      <div className="text-base text-center leading-4 relative z-10">
                        <BalatroText
                          text={
                            data.description ||
                            `A custom ${type} with unique effects.`
                          }
                          locVars={getLocVars()}
                          noWrap={true}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="relative mx-6 mt-3">
                    {isVanillaBadge ? (
                      <>
                        <div
                          className={`absolute inset-0 ${badgeStyles.bg} rounded-xl translate-y-1`}
                        />
                        <div
                          className={`${badgeStyles.shadow} rounded-xl text-center text-lg text-balatro-white py-1 relative`}
                        >
                          <span className="relative text-shadow-pixel">
                            {getBadgeText()}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          className="absolute inset-0 rounded-xl translate-y-1"
                          style={{ backgroundColor: badgeStyles.bg }}
                        />
                        <div
                          className="rounded-xl text-center text-lg text-balatro-white py-1 relative"
                          style={{ backgroundColor: badgeStyles.shadow }}
                        >
                          <span className="relative text-shadow-pixel">
                            {getBadgeText()}
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

export default BalatroCard;
