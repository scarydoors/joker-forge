import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { JokerData } from "../JokerCard";
import {
  IdentificationIcon,
  XMarkIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";

interface JokerInfoProps {
  position: { x: number; y: number };
  joker: JokerData;
  rulesCount: number;
  onClose: () => void;
  onPositionChange: (position: { x: number; y: number }) => void;
}

const JokerInfo: React.FC<JokerInfoProps> = ({
  position,
  joker,
  rulesCount,
  onClose,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: "panel-jokerInfo",
    });

  const style = {
    position: "absolute" as const,
    left: position.x,
    top: position.y,
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 1000 : 40,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-80 bg-black-dark backdrop-blur-md border-2 border-black-lighter rounded-lg shadow-2xl select-none touch-none"
    >
      <div
        className="flex items-center justify-between p-3 border-b border-black-lighter cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
        style={{ touchAction: "none" }}
      >
        <div className="flex items-center gap-2">
          <Bars3Icon className="h-4 w-4 text-white-darker" />
          <IdentificationIcon className="h-5 w-5 text-white-light" />
          <h3 className="text-white-light text-sm font-medium tracking-wider">
            Joker Info
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-white-darker hover:text-white transition-colors cursor-pointer"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-mint/20 to-mint/10 rounded-lg flex items-center justify-center border border-mint/30">
            <IdentificationIcon className="h-6 w-6 text-mint" />
          </div>
          <div>
            <span className="text-white font-medium tracking-wide text-lg">
              {joker.name}
            </span>
            <div className="text-white-darker text-sm">
              {rulesCount === 0
                ? "No Rules"
                : `${rulesCount} Rule${rulesCount !== 1 ? "s" : ""}`}
            </div>
          </div>
        </div>

        <div className="bg-black-darker/50 rounded-lg p-3 border border-black-lighter">
          <div className="text-white-light text-sm mb-2">Statistics</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="text-mint text-xl font-bold">{rulesCount}</div>
              <div className="text-white-darker text-xs">Rules</div>
            </div>
            <div className="text-center">
              <div className="text-mint text-xl font-bold">
                {joker.userVariables?.length || 0}
              </div>
              <div className="text-white-darker text-xs">Variables</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JokerInfo;
