import React, { useState } from "react";
import {
  PencilIcon,
  PuzzlePieceIcon,
  DocumentDuplicateIcon,
  DocumentIcon,
  StarIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";

import Button from "./generic/Button";
import type { Rule } from "./ruleBuilder/types";

export interface UserVariable {
  id: string;
  name: string;
  initialValue: number;
  description?: string;
}

export interface JokerData {
  id: string;
  name: string;
  description: string;
  imagePreview: string;
  rarity: number;
  cost?: number;
  blueprint_compat?: boolean;
  eternal_compat?: boolean;
  unlocked?: boolean;
  discovered?: boolean;
  rules?: Rule[];
  userVariables?: UserVariable[];
}

interface JokerCardProps {
  joker: JokerData;
  onEditInfo: () => void;
  onEditRules: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onQuickUpdate: (updates: Partial<JokerData>) => void;
}

const getRarityText = (rarity: number) => {
  const rarityMap: Record<number, string> = {
    1: "Common",
    2: "Uncommon",
    3: "Rare",
    4: "Legendary",
  };
  return rarityMap[rarity] || "Common";
};

const getRarityStyles = (rarity: number) => {
  const styleMap: Record<number, { text: string; bg: string; border: string }> =
    {
      1: {
        text: "text-balatro-blue",
        bg: "bg-black",
        border: "border-balatro-blue",
      },
      2: {
        text: "text-balatro-green",
        bg: "bg-black",
        border: "border-balatro-green",
      },
      3: {
        text: "text-balatro-red",
        bg: "bg-black",
        border: "border-balatro-red",
      },
      4: {
        text: "text-balatro-purple",
        bg: "bg-black",
        border: "border-balatro-purple",
      },
    };
  return styleMap[rarity] || styleMap[1];
};

const formatDescription = (text: string) => {
  if (!text) return "";

  let result = text;

  const colorPattern = /\{C:([a-z]+)\}(.*?)(\{\}|$)/g;
  result = result.replace(colorPattern, (_, colorName, content) => {
    return `<span class="${getColorClass(colorName)}">${content}</span>`;
  });

  const xMultPattern = /\{X:mult,C:([a-z]+)\}(.*?)(\{\}|$)/g;
  result = result.replace(xMultPattern, (_, colorName, content) => {
    return `<span class="${getColorClass(colorName)}">×${content}</span>`;
  });

  return result;
};

const getColorClass = (color: string) => {
  const colorMap: Record<string, string> = {
    white: "text-white-lighter",
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
  };
  return colorMap[color] || "text-white-lighter";
};

const JokerCard: React.FC<JokerCardProps> = ({
  joker,
  onEditInfo,
  onEditRules,
  onDelete,
  onDuplicate,
  onQuickUpdate,
}) => {
  const [showRarityMenu, setShowRarityMenu] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editingCost, setEditingCost] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [tempName, setTempName] = useState(joker.name);
  const [tempCost, setTempCost] = useState(joker.cost || 4);
  const [tempDescription, setTempDescription] = useState(joker.description);
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

  const safeRarity =
    typeof joker.rarity === "number" && joker.rarity >= 1 && joker.rarity <= 4
      ? joker.rarity
      : 1;
  const rarityText = getRarityText(safeRarity);
  const rarityStyles = getRarityStyles(safeRarity);
  const rulesCount = joker.rules?.length || 0;

  const rarities = [
    { value: 1, label: "Common", styles: getRarityStyles(1) },
    { value: 2, label: "Uncommon", styles: getRarityStyles(2) },
    { value: 3, label: "Rare", styles: getRarityStyles(3) },
    { value: 4, label: "Legendary", styles: getRarityStyles(4) },
  ];

  const handleNameSave = () => {
    onQuickUpdate({ name: tempName });
    setEditingName(false);
  };

  const handleCostSave = () => {
    onQuickUpdate({ cost: tempCost });
    setEditingCost(false);
  };

  const handleDescriptionSave = () => {
    onQuickUpdate({ description: tempDescription });
    setEditingDescription(false);
  };

  const handleRarityChange = (newRarity: number) => {
    onQuickUpdate({ rarity: newRarity });
    setShowRarityMenu(false);
  };

  return (
    <div className="flex gap-4">
      <div className="relative flex flex-col items-center">
        {editingCost ? (
          <input
            type="number"
            value={tempCost}
            onChange={(e) => setTempCost(parseInt(e.target.value))}
            onBlur={handleCostSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCostSave();
              if (e.key === "Escape") {
                setTempCost(joker.cost || 4);
                setEditingCost(false);
              }
            }}
            className="px-4 -mb-6 z-20 py-1 rounded-lg border-2 text-xl w-1/2 font-bold cursor-pointer transition-all bg-black font-game tracking-widest border-balatro-money text-balatro-money"
            autoFocus
          />
        ) : (
          <div
            className="px-4 -mb-6 z-20 py-1 rounded-lg border-2 text-xl font-bold cursor-pointer transition-all bg-black font-game tracking-widest border-balatro-money text-balatro-money"
            onClick={() => {
              setTempCost(joker.cost || 4);
              setEditingCost(true);
            }}
          >
            ${joker.cost || 4}
          </div>
        )}

        <div className="w-42 z-10">
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

        <div className="relative z-20">
          <div
            className={`px-6 py-1 -mt-6 rounded-lg border-2 text-xl font-game tracking-wide font-medium cursor-pointer transition-all ${rarityStyles.bg} ${rarityStyles.border} ${rarityStyles.text}`}
            onClick={() => setShowRarityMenu(!showRarityMenu)}
          >
            {rarityText}
          </div>

          {showRarityMenu && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-black-darker border-2 border-black-lighter rounded-lg shadow-lg z-20 overflow-hidden">
              {rarities.map((rarity) => (
                <div
                  key={rarity.value}
                  className={`px-3 py-1 text-xs font-medium cursor-pointer transition-all hover:bg-opacity-20 ${rarity.styles.text} ${rarity.styles.bg} border-b border-black-lighter last:border-b-0`}
                  onClick={() => handleRarityChange(rarity.value)}
                >
                  {rarity.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="h-1/2 my-auto relative bg-black-dark border-2 border-black-lighter rounded-xl p-4 pl-10 -ml-12 flex-1">
        <div className="absolute -top-3 -right-3 bg-black-dark border-2 border-balatro-red rounded-lg p-1 hover:bg-balatro-redshadow cursor-pointer transition-colors flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="w-full h-full flex items-center cursor-pointer justify-center"
          >
            <TrashIcon className="h-5 w-5 text-balatro-red" />
          </button>
        </div>

        <div className="flex flex-col">
          <div className="flex-1">
            <div className="mb-3">
              {editingName ? (
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onBlur={handleNameSave}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleNameSave();
                    if (e.key === "Escape") {
                      setTempName(joker.name);
                      setEditingName(false);
                    }
                  }}
                  className="text-white-light font-medium text-lg font-game leading-tight bg-transparent border-none outline-none w-full cursor-text"
                  autoFocus
                />
              ) : (
                <h3
                  className="text-white-lighter text-xl tracking-wide font-game leading-tight cursor-pointer"
                  onClick={() => {
                    setTempName(joker.name);
                    setEditingName(true);
                  }}
                >
                  {joker.name}
                </h3>
              )}
            </div>

            {editingDescription ? (
              <textarea
                value={tempDescription}
                onChange={(e) => setTempDescription(e.target.value)}
                onBlur={handleDescriptionSave}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.ctrlKey) handleDescriptionSave();
                  if (e.key === "Escape") {
                    setTempDescription(joker.description);
                    setEditingDescription(false);
                  }
                }}
                className="text-white-darker text-sm mb-4 leading-relaxed font-game bg-transparent border-none outline-none resize-none w-full cursor-text"
                rows={3}
                autoFocus
              />
            ) : (
              <div
                className="text-white-darker text-sm mb-4 leading-relaxed font-game cursor-pointer"
                onClick={() => {
                  setTempDescription(joker.description);
                  setEditingDescription(true);
                }}
                dangerouslySetInnerHTML={{
                  __html: formatDescription(joker.description),
                }}
              />
            )}

            <div className="flex items-center gap-4 text-sm mb-4">
              <div className="flex items-center gap-2">
                <span className="text-white-darker">Rules:</span>
                <span className="text-mint font-bold">{rulesCount}</span>
              </div>

              {(joker.blueprint_compat === false ||
                joker.eternal_compat === false) && (
                <div className="flex items-center gap-2">
                  {joker.blueprint_compat === false && (
                    <div
                      className="relative"
                      onMouseEnter={() => setHoveredIcon("blueprint")}
                      onMouseLeave={() => setHoveredIcon(null)}
                    >
                      <DocumentIcon className="h-4 w-4 text-balatro-red" />
                      {hoveredIcon === "blueprint" && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black-darker border border-black-lighter rounded text-xs text-white-light whitespace-nowrap z-10">
                          No Blueprint
                        </div>
                      )}
                    </div>
                  )}

                  {joker.eternal_compat === false && (
                    <div
                      className="relative"
                      onMouseEnter={() => setHoveredIcon("eternal")}
                      onMouseLeave={() => setHoveredIcon(null)}
                    >
                      <StarIcon className="h-4 w-4 text-balatro-red" />
                      {hoveredIcon === "eternal" && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black-darker border border-black-lighter rounded text-xs text-white-light whitespace-nowrap z-10">
                          No Eternal
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onEditInfo}
              icon={<PencilIcon className="h-3 w-3" />}
            />
            <Button
              variant="primary"
              size="sm"
              onClick={onEditRules}
              icon={<PuzzlePieceIcon className="h-3 w-3" />}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={onDuplicate}
              icon={<DocumentDuplicateIcon className="h-3 w-3" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default JokerCard;
