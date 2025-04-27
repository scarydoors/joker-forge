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
  rarity: number; // 0: Common, 1: Uncommon, 2: Rare, 3: Legendary
}

const getRarityText = (rarity: number) => {
  const rarityMap = {
    0: "Common",
    1: "Uncommon",
    2: "Rare",
    3: "Legendary",
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

const formatDescription = (text: string) => {
  // If no formatting tags, return as is
  if (!text.includes("[")) return text;

  // Replace new line tags
  text = text.replace(/\[s\]/g, "<br />");

  let result = "";
  let currentIndex = 0;
  let currentTag = "";

  // Function to find next tag position
  const findNextTag = (
    startFrom: number
  ): number | { start: number; end: number } => {
    const nextOpen = text.indexOf("[", startFrom);
    if (nextOpen === -1) return -1;

    const nextClose = text.indexOf("]", nextOpen);
    if (nextClose === -1) return -1; // Treat malformed tag as end

    return { start: nextOpen, end: nextClose };
  };

  // Use a different variable name for the result of findNextTag
  let nextTagResult = findNextTag(currentIndex);

  // Process the text with formatting
  while (nextTagResult !== -1) {
    // Explicitly assign to a new variable *inside* the loop after the check
    // This makes the type `{ start: number, end: number }` absolutely clear in this scope
    const currentTagInfo = nextTagResult;
    const start = currentTagInfo.start;
    const end = currentTagInfo.end;

    // Add text before the tag
    if (start > currentIndex) {
      result += text.substring(currentIndex, start);
    }

    // Get the tag
    const tag = text.substring(start, end + 1);

    // Apply the tag formatting
    if (tag === "[/]") {
      // Close current formatting
      if (currentTag) {
        result += "</span>";
        currentTag = "";
      }
    } else {
      // Start new formatting
      const colorClass = getColorClass(tag);

      // Close previous tag if exists
      if (currentTag) {
        result += "</span>";
      }

      // Open new tag
      result += `<span class="${colorClass}">`;
      currentTag = tag;
    }

    // Update current position using the confirmed 'end' value
    currentIndex = end + 1;

    // Find next tag for the next iteration check
    nextTagResult = findNextTag(currentIndex);
  }

  // Add remaining text
  if (currentIndex < text.length) {
    result += text.substring(currentIndex);
  }

  // Close any open tag
  if (currentTag) {
    result += "</span>";
  }

  return result;
};

const getColorClass = (tag: string) => {
  const colorMap: Record<string, string> = {
    "[/]": "text-white", // default color
    "[b]": "text-balatro-blue",
    "[r]": "text-balatro-red",
    "[o]": "text-balatro-orange",
    "[g]": "text-balatro-green",
    "[p]": "text-balatro-purple",
    "[a]": "text-balatro-planet", // aqua
    "[y]": "text-balatro-money", // yellow
    "[n]": "text-balatro-black", // negative
    "[l]": "text-balatro-lightgrey", // light gray
    "[1]": "text-balatro-orange", // diamond
    "[2]": "text-balatro-green", // club
    "[3]": "text-balatro-red", // heart
    "[4]": "text-balatro-blue", // spade
    "[m]": "text-white bg-balatro-red px-1 rounded", // white with red bg
  };
  return colorMap[tag] || "text-white";
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
      window.addEventListener("scroll", updatePosition, true); // Use capture phase for scroll
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
      document.getElementById("joker-info-root")! // Assert non-null as we create it if needed
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
        {/* Card body - No separate shadow div */}
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
