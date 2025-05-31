import React from "react";
import {
  BoltIcon,
  BeakerIcon,
  PuzzlePieceIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

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
}) => {
  const getTypeConfig = () => {
    switch (type) {
      case "trigger":
        return {
          borderColor: "border-l-mint",
          backgroundColor: "bg-black-light",
          icon: <BoltIcon className="h-4 w-4 text-mint" />,
          typeLabel: "Trigger",
        };
      case "condition":
        return {
          borderColor: "border-l-balatro-blue",
          backgroundColor: "bg-black-light",
          icon: <BeakerIcon className="h-4 w-4 text-balatro-blue" />,
          typeLabel: "Condition",
        };
      case "effect":
        return {
          borderColor: "border-l-balatro-orange",
          backgroundColor: "bg-black-light",
          icon: <PuzzlePieceIcon className="h-4 w-4 text-balatro-orange" />,
          typeLabel: "Effect",
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
        ${isSelected ? "border-mint" : "border-black-lighter"} 
        rounded-lg cursor-pointer transition-all hover:border-mint/50 p-3 pt-6
      `}
      onClick={onClick}
    >
      {/* Type label */}
      <div className="absolute top-1 left-3 text-white-darker text-xs uppercase tracking-wider">
        {config.typeLabel}
      </div>

      {/* Trash icon */}
      {showTrash && onDelete && (
        <div className="absolute -top-3 -right-3 w-8 h-8 bg-black-darker rounded-lg flex items-center justify-center border-2 border-balatro-redshadow">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="w-full h-full flex items-center rounded justify-center transition-colors"
          >
            <TrashIcon className="h-5 w-5 text-balatro-red" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-grow min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0">{config.icon}</div>
            {isNegated && (
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-4 w-4 text-balatro-red" />
              </div>
            )}
          </div>
          <div className="flex-grow min-w-0">
            <div className="text-white text-sm font-medium tracking-wide">
              {isNegated ? `NOT ${displayTitle}` : displayTitle}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {parameterCount !== undefined && parameterCount > 0 && (
            <span className="text-white-darker text-xs">
              {parameterCount} Parameter{parameterCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlockComponent;
