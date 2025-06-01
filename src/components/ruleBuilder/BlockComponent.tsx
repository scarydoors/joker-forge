import React from "react";
import {
  TrashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

import {
  BoltIcon,
  PuzzlePieceIcon,
  BeakerIcon,
  PercentBadgeIcon,
} from "@heroicons/react/16/solid";

interface BlockComponentProps {
  label: string;
  type: "trigger" | "condition" | "effect";
  onClick: () => void;
  isSelected?: boolean;
  showTrash?: boolean;
  onDelete?: () => void;
  parameterCount?: number;
  isNegated?: boolean;
  dynamicTitle?: string;
  variableName?: string;
  hasRandomChance?: boolean;
}

const BlockComponent: React.FC<BlockComponentProps> = ({
  label,
  type,
  onClick,
  isSelected = false,
  showTrash = false,
  onDelete,
  parameterCount,
  isNegated = false,
  dynamicTitle,
  variableName,
  hasRandomChance = false,
}) => {
  const getTypeConfig = () => {
    switch (type) {
      case "trigger":
        return {
          borderColor: "border-l-trigger",
          backgroundColor: "bg-black",
          icon: <BoltIcon className="h-6 w-6 text-trigger -mt-4 -ml-1" />,
          typeLabel: "Trigger",
          selectColor: "border-trigger",
          hoverColor: "hover:border-trigger-dark",
        };
      case "condition":
        return {
          borderColor: "border-l-condition",
          backgroundColor: "bg-black",
          icon: <BeakerIcon className="h-6 w-6 text-condition -mt-4 -ml-1" />,
          typeLabel: "Condition",
          selectColor: "border-condition",
          hoverColor: "hover:border-condition-dark",
        };
      case "effect":
        return {
          borderColor: "border-l-effect",
          backgroundColor: "bg-black",
          icon: <PuzzlePieceIcon className="h-6 w-6 text-effect -mt-4 -ml-1" />,
          typeLabel: "Effect",
          selectColor: "border-effect",
          hoverColor: "hover:border-effect-dark",
        };
    }
  };

  const config = getTypeConfig();
  const displayTitle = dynamicTitle || label;

  return (
    <div
      className={`
        relative ${config.backgroundColor} ${
        config.borderColor
      } border-l-4 border-2 
        ${isSelected ? config.selectColor : "border-black-light"} 
        rounded-lg cursor-pointer transition-all ${config.hoverColor} p-3 pt-6
      `}
      onClick={onClick}
    >
      <div className="absolute top-2 left-11 text-white-darker text-xs font-medium tracking-wider">
        {config.typeLabel}
      </div>

      <div className="absolute top-[2px] right-6 flex items-center gap-2">
        {variableName && (
          <span className="bg-mint/20 text-mint text-xs px-2 py-1 rounded font-medium">
            ${variableName}
          </span>
        )}
        {parameterCount !== undefined && parameterCount > 0 && (
          <span className="text-white-darker text-xs font-medium">
            {parameterCount} Parameter{parameterCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {showTrash && onDelete && (
        <div className="absolute -top-3 -right-3 w-8 h-8 bg-black-darker rounded-lg flex items-center justify-center border-2 border-balatro-redshadow">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="w-full h-full flex items-center rounded justify-center transition-colors hover:bg-balatro-redshadow active:bg-balatro-blackshadow"
          >
            <TrashIcon className="h-5 w-5 text-balatro-red hover:text-white cursor-pointer active:text-balatro-red transition-colors" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-grow min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0">{config.icon}</div>
            {isNegated && (
              <div className="flex-shrink-0 -mr-2">
                <ExclamationTriangleIcon className="h-4 w-4 text-balatro-red" />
              </div>
            )}
            {hasRandomChance && (
              <div className="flex-shrink-0 -mr-2">
                <PercentBadgeIcon className="h-4 w-4 text-mint" />
              </div>
            )}
          </div>
          <div className="flex-grow min-w-0">
            <div className="text-white text-sm tracking-wide truncate">
              {isNegated ? `NOT ${displayTitle}` : displayTitle}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockComponent;
