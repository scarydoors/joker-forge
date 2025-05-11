import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Rule } from "./ruleBuilder";

interface JokerCardProps {
  joker: JokerData;
  onClick: () => void;
}

export interface JokerData {
  id: string;
  name: string;
  description: string;
  chipAddition: number;
  multAddition: number;
  xMult: number;
  imagePreview: string;
  rarity: number; // 1: Common, 2: Uncommon, 3: Rare, 4: Legendary
  cost?: number;
  blueprint_compat?: boolean;
  eternal_compat?: boolean;
  unlocked?: boolean;
  discovered?: boolean;
  rules?: Rule[];
}

const getRarityText = (rarity: number) => {
  const rarityMap: Record<number, string> = {
    1: "Common",
    2: "Uncommon",
    3: "Rare",
    4: "Legendary",
  };
  return rarityMap[rarity] || "Common"; // Default to Common if invalid
};

const getRarityStyles = (rarity: number) => {
  const styleMap: Record<number, { bg: string; shadow: string }> = {
    1: {
      // Common
      bg: "bg-balatro-blue",
      shadow: "bg-balatro-blueshadow",
    },
    2: {
      // Uncommon
      bg: "bg-balatro-green",
      shadow: "bg-balatro-greenshadow",
    },
    3: {
      // Rare
      bg: "bg-balatro-red",
      shadow: "bg-balatro-redshadow",
    },
    4: {
      // Legendary
      bg: "bg-balatro-purple",
      shadow: "bg-balatro-purpleshadow",
    },
  };

  // Safely return a valid style, defaulting to Common (1)
  return styleMap[rarity] || styleMap[1];
};

/**
 * Format Balatro description syntax for display in the UI
 * Handles color tags like {C:blue} and newlines [s]
 */
const formatDescription = (text: string) => {
  if (!text) return "";

  // Handle newline tags
  text = text.replace(/\[s\]/g, "<br />");

  // Replace Balatro color tags with HTML spans
  let result = text;

  // Handle color tags like {C:blue} and closing tags {}
  const colorPattern = /\{C:([a-z]+)\}(.*?)(\{\}|$)/g;
  result = result.replace(colorPattern, (_, colorName, content) => {
    return `<span class="${getColorClass(colorName)}">${content}</span>`;
  });

  // Handle X multiplier tags
  const xMultPattern = /\{X:mult,C:([a-z]+)\}(.*?)(\{\}|$)/g;
  result = result.replace(xMultPattern, (_, colorName, content) => {
    return `<span class="${getColorClass(colorName)}">×${content}</span>`;
  });

  return result;
};

/**
 * Map Balatro color names to Tailwind CSS classes
 */
const getColorClass = (color: string) => {
  const colorMap: Record<string, string> = {
    white: "text-balatro-white",
    blue: "text-balatro-blue",
    red: "text-balatro-red",
    orange: "text-balatro-orange",
    green: "text-balatro-green",
    purple: "text-balatro-purple",
    attention: "text-balatro-planet",
    chips: "text-balatro-chips",
    mult: "text-balatro-mult",
    money: "text-balatro-money",
    black: "text-balatro-black",
    lightgrey: "text-balatro-lightgrey",
  };
  return colorMap[color] || "text-balatro-white";
};

const JokerCard: React.FC<JokerCardProps> = ({ joker, onClick }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null
  );
  const cardRef = useRef<HTMLDivElement>(null);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  // Find or create the portal root element
  useEffect(() => {
    let root = document.getElementById("joker-info-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "joker-info-root";
      document.body.appendChild(root);
    }
    setPortalRoot(root);
  }, []);

  const updatePosition = useCallback(() => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.bottom,
      });
    }
  }, []);

  useEffect(() => {
    if (isHovering) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [isHovering, updatePosition]);

  // Safely determine the rarity styles
  const safeRarity =
    typeof joker.rarity === "number" && joker.rarity >= 1 && joker.rarity <= 4
      ? joker.rarity
      : 1; // Default to Common

  const rarityStyles = getRarityStyles(safeRarity);
  const rarityText = getRarityText(safeRarity);

  // Display info tooltip on hover
  const renderTooltip = () => {
    if (!position || !isHovering || !portalRoot) return null;

    return createPortal(
      <div
        className="fixed pointer-events-none font-game z-50"
        style={{
          left: position.x,
          top: position.y + 8,
          transform: "translate(-50%, 0%)",
          width: "180px",
        }}
      >
        <div className="relative m-2">
          {/* Tooltip Shadow */}
          <div className="absolute inset-0 bg-balatro-blackshadow pixel-corners-medium translate-y-1" />
          {/* Tooltip Body */}
          <div className="relative bg-balatro-lightgrey pixel-corners-medium p-1">
            <div className="bg-balatro-black pixel-corners-medium p-2">
              <h3 className="text-2xl mb-1 text-center text-balatro-white text-shadow-pixel">
                {joker.name}
              </h3>
              {/* Description Box */}
              <div className="relative mb-2">
                <div className="absolute inset-0 bg-balatro-whiteshadow pixel-corners-small translate-y-1" />
                <div className="relative bg-balatro-white text-balatro-black font-thin px-2 py-1 pixel-corners-small">
                  <p
                    className="text-base text-center leading-4"
                    dangerouslySetInnerHTML={{
                      __html: formatDescription(joker.description),
                    }}
                  />
                </div>
              </div>
              {/* Effects Preview */}
              {(joker.chipAddition > 0 ||
                joker.multAddition > 0 ||
                joker.xMult > 1) && (
                <div className="text-center text-sm mb-2">
                  {joker.chipAddition > 0 && (
                    <span className="text-balatro-chips mr-2">
                      +{joker.chipAddition} Chips
                    </span>
                  )}
                  {joker.multAddition > 0 && (
                    <span className="text-balatro-mult mr-2">
                      +{joker.multAddition} Mult
                    </span>
                  )}
                  {joker.xMult > 1 && (
                    <span className="text-balatro-money">×{joker.xMult}</span>
                  )}
                </div>
              )}
              {/* Rarity indicator */}
              <div className="relative mx-7 mt-2">
                <div
                  className={`absolute inset-0 ${rarityStyles.shadow} pixel-corners-small translate-y-1`}
                />
                <div
                  className={`relative ${rarityStyles.bg} pixel-corners-small text-center text-lg text-balatro-white`}
                >
                  <span className="relative text-shadow-pixel">
                    {rarityText}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>,
      portalRoot
    );
  };

  return (
    <>
      <div
        ref={cardRef}
        className="relative cursor-pointer w-32"
        onClick={onClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Card body */}
        <div className="w-full aspect-[2/3] overflow-hidden">
          {joker.imagePreview ? (
            <img
              src={joker.imagePreview}
              alt={joker.name}
              className="w-full h-full object-contain"
              draggable="false"
            />
          ) : (
            <img
              src="/images/placeholder-joker.png"
              alt="Default Joker"
              className="w-full h-full object-contain"
              draggable="false"
            />
          )}
        </div>
      </div>

      {/* Info tooltip */}
      {renderTooltip()}
    </>
  );
};

export default JokerCard;
