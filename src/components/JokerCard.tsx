import React, { useState } from "react";
import {
  PencilIcon,
  PuzzlePieceIcon,
  DocumentDuplicateIcon,
  DocumentIcon,
  StarIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";

import Tooltip from "./generic/Tooltip";
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
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [hoveredTrash, setHoveredTrash] = useState(false);
  const [tooltipDelayTimeout, setTooltipDelayTimeout] =
    useState<NodeJS.Timeout | null>(null);

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

  const validateJoker = (joker: JokerData) => {
    const issues = [];
    if (!joker.imagePreview) issues.push("Missing image");
    if (!joker.name || joker.name.trim() === "" || joker.name === "New Joker")
      issues.push("Generic or missing name");
    if (!joker.rules || joker.rules.length === 0)
      issues.push("No rules defined");
    return issues;
  };

  const validationIssues = validateJoker(joker);
  const hasIssues = validationIssues.length > 0;

  const handleButtonHover = (buttonType: string) => {
    if (tooltipDelayTimeout) {
      clearTimeout(tooltipDelayTimeout);
    }
    const timeout = setTimeout(() => {
      setHoveredButton(buttonType);
    }, 500);
    setTooltipDelayTimeout(timeout);
  };

  const handleButtonLeave = () => {
    if (tooltipDelayTimeout) {
      clearTimeout(tooltipDelayTimeout);
      setTooltipDelayTimeout(null);
    }
    setHoveredButton(null);
  };

  const handleTrashHover = () => {
    if (tooltipDelayTimeout) {
      clearTimeout(tooltipDelayTimeout);
    }
    const timeout = setTimeout(() => {
      setHoveredTrash(true);
    }, 500);
    setTooltipDelayTimeout(timeout);
  };

  const handleTrashLeave = () => {
    if (tooltipDelayTimeout) {
      clearTimeout(tooltipDelayTimeout);
      setTooltipDelayTimeout(null);
    }
    setHoveredTrash(false);
  };

  return (
    <div className="flex gap-4 relative">
      <div className="relative flex flex-col items-center">
        <div className="px-4 -mb-6 z-20 py-1 rounded-lg border-2 text-xl font-bold cursor-pointer transition-all bg-black font-game tracking-widest border-balatro-money text-balatro-money w-20 text-center">
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
              className="w-full bg-transparent text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              autoFocus
            />
          ) : (
            <span
              onClick={() => {
                setTempCost(joker.cost || 4);
                setEditingCost(true);
              }}
            >
              ${joker.cost || 4}
            </span>
          )}
        </div>

        <div className="w-42 z-10 relative">
          {hasIssues && (
            <Tooltip
              content={validationIssues.join(", ")}
              show={hoveredIcon === "warning"}
              contentClassName="max-w-xs whitespace-normal text-balatro-orange border-balatro-orange"
              position="right"
            >
              <div
                className="absolute top-2 left-2 bg-black border-2 border-balatro-orange rounded-lg p-1 cursor-pointer transition-all flex items-center justify-center z-30"
                onMouseEnter={() => setHoveredIcon("warning")}
                onMouseLeave={() => setHoveredIcon(null)}
              >
                <ExclamationTriangleIcon className="h-5 w-5 text-balatro-orange" />
              </div>
            </Tooltip>
          )}
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

        <div className="relative z-30">
          <div
            className={`px-6 py-1 -mt-6 rounded-lg border-2 text-xl font-game tracking-wide font-medium cursor-pointer transition-all ${rarityStyles.bg} ${rarityStyles.border} ${rarityStyles.text}`}
            onClick={() => setShowRarityMenu(!showRarityMenu)}
          >
            {rarityText}
          </div>

          {showRarityMenu && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-black-darker border-2 border-black-lighter rounded-lg shadow-lg z-50 overflow-hidden">
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

      <div className="my-auto relative bg-black-dark border-2 border-black-lighter rounded-xl p-4 pl-10 -ml-12 flex-1 min-h-fit">
        <Tooltip content="Delete Joker" show={hoveredTrash}>
          <div
            className="absolute -top-3 -right-3 bg-black-dark border-2 border-balatro-red rounded-lg p-1 hover:bg-balatro-redshadow cursor-pointer transition-colors flex items-center justify-center z-10"
            onMouseEnter={handleTrashHover}
            onMouseLeave={handleTrashLeave}
          >
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
        </Tooltip>

        <div className="flex flex-col h-full">
          <div className="flex-1">
            <div className="mb-3 h-7 flex items-start overflow-hidden">
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
                  className="text-white-lighter text-xl tracking-wide font-game leading-tight bg-transparent border-none outline-none w-full cursor-text"
                  autoFocus
                />
              ) : (
                <h3
                  className="text-white-lighter text-xl tracking-wide font-game leading-tight cursor-pointer line-clamp-1"
                  onClick={() => {
                    setTempName(joker.name);
                    setEditingName(true);
                  }}
                  style={{ lineHeight: "1.75rem" }}
                >
                  {joker.name}
                </h3>
              )}
            </div>

            <div className="mb-4 h-16 flex items-start overflow-hidden">
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
                  className="text-white-darker text-sm leading-relaxed font-game bg-transparent border-none outline-none resize-none w-full cursor-text h-full"
                  autoFocus
                />
              ) : (
                <div
                  className="text-white-darker text-sm leading-relaxed font-game cursor-pointer w-full line-clamp-3"
                  onClick={() => {
                    setTempDescription(joker.description);
                    setEditingDescription(true);
                  }}
                  dangerouslySetInnerHTML={{
                    __html: formatDescription(joker.description),
                  }}
                />
              )}
            </div>

            {(joker.blueprint_compat === false ||
              joker.eternal_compat === false) && (
              <div className="flex items-center gap-3 mb-4">
                {joker.blueprint_compat === false && (
                  <Tooltip
                    content="Cannot be copied by Blueprint"
                    show={hoveredIcon === "blueprint"}
                  >
                    <div
                      className="relative flex items-center"
                      onMouseEnter={() => setHoveredIcon("blueprint")}
                      onMouseLeave={() => setHoveredIcon(null)}
                    >
                      <div className="flex items-center gap-1 px-2 py-1 bg-balatro-red/20 border border-balatro-red/40 rounded-md">
                        <DocumentIcon className="h-3 w-3 text-balatro-red" />
                        <span className="text-balatro-red text-xs font-medium">
                          No Blueprint
                        </span>
                      </div>
                    </div>
                  </Tooltip>
                )}

                {joker.eternal_compat === false && (
                  <Tooltip
                    content="Cannot be made Eternal"
                    show={hoveredIcon === "eternal"}
                  >
                    <div
                      className="relative flex items-center"
                      onMouseEnter={() => setHoveredIcon("eternal")}
                      onMouseLeave={() => setHoveredIcon(null)}
                    >
                      <div className="flex items-center gap-1 px-2 py-1 bg-balatro-red/20 border border-balatro-red/40 rounded-md">
                        <StarIcon className="h-3 w-3 text-balatro-red" />
                        <span className="text-balatro-red text-xs font-medium">
                          No Eternal
                        </span>
                      </div>
                    </div>
                  </Tooltip>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-center bg-black rounded-lg overflow-hidden">
            <div className="w-px bg-black-lighter py-3"></div>{" "}
            <Tooltip content="Edit Info" show={hoveredButton === "edit"}>
              <div
                className="flex flex-1 hover:bg-black-light transition-colors cursor-pointer group"
                onClick={onEditInfo}
                onMouseEnter={() => handleButtonHover("edit")}
                onMouseLeave={handleButtonLeave}
              >
                <div className="flex-1 flex items-center justify-center px-3 py-3">
                  <PencilIcon className="h-6 w-6 text-white-darker group-hover:text-white-light transition-colors" />
                </div>
              </div>
            </Tooltip>
            <div className="w-px bg-black-lighter py-3"></div>
            <Tooltip content="Edit Rules" show={hoveredButton === "rules"}>
              <div
                className="flex flex-1 hover:bg-white/10 transition-colors cursor-pointer group"
                onClick={onEditRules}
                onMouseEnter={() => handleButtonHover("rules")}
                onMouseLeave={handleButtonLeave}
              >
                <div className="flex-1 flex items-center justify-center py-3 px-3">
                  <div className="relative">
                    <PuzzlePieceIcon className="h-6 w-6 text-white-darker group-hover:text-mint transition-colors" />
                    {rulesCount > 0 && (
                      <div className="absolute -top-2 -right-2 bg-mint text-black text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                        {rulesCount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Tooltip>
            <div className="w-px bg-black-lighter py-3"></div>
            <Tooltip content="Duplicate" show={hoveredButton === "duplicate"}>
              <div
                className="flex flex-1 hover:bg-white/10 transition-colors cursor-pointer group"
                onClick={onDuplicate}
                onMouseEnter={() => handleButtonHover("duplicate")}
                onMouseLeave={handleButtonLeave}
              >
                <div className="flex-1 flex items-center justify-center py-3 px-3">
                  <DocumentDuplicateIcon className="h-6 w-6 text-white-darker group-hover:text-white-light transition-colors" />
                </div>
              </div>
            </Tooltip>
            <div className="w-px bg-black-lighter py-3"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JokerCard;
