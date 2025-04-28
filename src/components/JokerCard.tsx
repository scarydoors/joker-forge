import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

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
}

const getRarityText = (rarity: number) => {
  const rarityMap = {
    1: "Common",
    2: "Uncommon",
    3: "Rare",
    4: "Legendary",
  };
  return rarityMap[rarity as keyof typeof rarityMap] || "Unknown";
};

const getRarityStyles = (rarity: number) => {
  const styleMap = {
    0: {
      bg: "bg-balatro-blue",
      shadow: "bg-balatro-blueshadow",
    },
    1: {
      bg: "bg-balatro-green",
      shadow: "bg-balatro-greenshadow",
    },
    2: {
      bg: "bg-balatro-red",
      shadow: "bg-balatro-redshadow",
    },
    3: {
      bg: "bg-balatro-purple",
      shadow: "bg-balatro-purpleshadow",
    },
  };
  return styleMap[rarity as keyof typeof styleMap] || styleMap[0];
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
  result = result.replace(colorPattern, (match, color, content) => {
    return `<span class="${getColorClass(color)}">${content}</span>`;
  });

  // Handle X multiplier tags
  const xMultPattern = /\{X:mult,C:([a-z]+)\}(.*?)(\{\}|$)/g;
  result = result.replace(xMultPattern, (match, color, content) => {
    return `<span class="${getColorClass(color)}">×${content}</span>`;
  });

  return result;
};

/**
 * Map Balatro color names to Tailwind CSS classes
 */
const getColorClass = (color: string) => {
  const colorMap: Record<string, string> = {
    white: "text-white",
    blue: "text-balatro-blue",
    red: "text-balatro-red",
    orange: "text-balatro-orange",
    green: "text-balatro-green",
    purple: "text-balatro-purple",
    attention: "text-balatro-planet", // aqua/attention
    chips: "text-balatro-chips",
    mult: "text-balatro-mult",
    money: "text-balatro-money",
    black: "text-balatro-black",
    lightgrey: "text-balatro-lightgrey",
  };
  return colorMap[color] || "text-white";
};

const JokerCard: React.FC<JokerCardProps> = ({ joker, onClick }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null
  );
  const cardRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.bottom,
      });
    }
  };

  useEffect(() => {
    let portalRoot = document.getElementById("joker-info-root");
    if (!portalRoot) {
      portalRoot = document.createElement("div");
      portalRoot.id = "joker-info-root";
      document.body.appendChild(portalRoot);
    }

    if (isHovering) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [isHovering]);

  const rarityStyles = getRarityStyles(joker.rarity);

  // Display info tooltip on hover
  const infoTooltip =
    position &&
    isHovering &&
    createPortal(
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
          <div
            className={`relative bg-balatro-lightgrey pixel-corners-medium p-1`}
          >
            <div className="bg-balatro-black pixel-corners-medium p-2">
              <h3
                className={`text-2xl mb-1 text-center text-white text-shadow-pixel`}
              >
                {joker.name}
              </h3>
              {/* Description Box */}
              <div className="relative mb-2">
                <div className="absolute inset-0 bg-balatro-whiteshadow pixel-corners-small translate-y-1" />
                <div className="relative bg-white text-balatro-black font-thin px-2 py-1 pixel-corners-small">
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
                  className={`relative ${rarityStyles.bg} pixel-corners-small text-center text-lg text-white`}
                >
                  <span className="relative text-shadow-pixel">
                    {getRarityText(joker.rarity)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.getElementById("joker-info-root")!
    );

  return (
    <>
      <div
        ref={cardRef}
        className="relative cursor-pointer w-32 hover:scale-105 transition-transform duration-200"
        onClick={onClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Card body */}
        <div className="w-full aspect-[2/3] pixel-corners-medium overflow-hidden">
          {joker.imagePreview ? (
            <img
              src={joker.imagePreview}
              alt={joker.name}
              className="w-full h-full object-contain pixelated"
              draggable="false"
            />
          ) : (
            <img
              src="/images/placeholder-joker.png"
              alt="Default Joker"
              className="w-full h-full object-contain pixelated"
              draggable="false"
            />
          )}
        </div>
      </div>

      {/* Info tooltip */}
      {infoTooltip}
    </>
  );
};

export default JokerCard;
