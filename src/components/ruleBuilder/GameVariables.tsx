import React, { useState, useMemo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { getAllGameVariables, GameVariable } from "./data/GameVars";
import {
  CubeIcon,
  XMarkIcon,
  Bars3Icon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

interface GameVariablesProps {
  position: { x: number; y: number };
  selectedGameVariable: GameVariable | null;
  onSelectGameVariable: (variable: GameVariable) => void;
  onClose: () => void;
  onPositionChange: (position: { x: number; y: number }) => void;
}

const GameVariables: React.FC<GameVariablesProps> = ({
  position,
  onSelectGameVariable,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: "panel-gameVariables",
  });

  const style = transform
    ? {
        position: "absolute" as const,
        left: position.x + transform.x,
        top: position.y + transform.y,
      }
    : {
        position: "absolute" as const,
        left: position.x,
        top: position.y,
      };

  const filteredVariables = useMemo(() => {
    const allVariables = getAllGameVariables();
    if (!searchTerm.trim()) {
      return allVariables;
    }

    const search = searchTerm.toLowerCase();
    return allVariables.filter(
      (variable) =>
        variable.label.toLowerCase().includes(search) ||
        variable.description.toLowerCase().includes(search) ||
        variable.id.toLowerCase().includes(search)
    );
  }, [searchTerm]);

  const handleVariableSelect = (variable: GameVariable) => {
    onSelectGameVariable(variable);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-80 bg-black-dark backdrop-blur-md border-2 border-black-lighter rounded-lg shadow-2xl max-h-[60vh] z-40 flex flex-col"
    >
      <div
        className="flex items-center justify-between p-3 border-b border-black-lighter cursor-grab flex-shrink-0"
        {...attributes}
        {...listeners}
      >
        <div className="flex items-center gap-2">
          <Bars3Icon className="h-4 w-4 text-white-darker" />
          <CubeIcon className="h-5 w-5 text-white-light" />
          <h3 className="text-white-light text-sm font-medium tracking-wider">
            Game Variables
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-white-darker hover:text-white transition-colors cursor-pointer"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="p-3 flex flex-col min-h-0 flex-1">
        <div className="relative mb-3 flex-shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-4 w-4 text-white-darker" />
          </div>
          <input
            type="text"
            placeholder="Search variables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black-darker border border-black-lighter rounded-lg text-white-light placeholder-white-darker text-sm focus:outline-none focus:border-mint transition-colors"
          />
        </div>

        <div className="space-y-1.5 overflow-y-auto custom-scrollbar min-h-0 flex-1 pr-2">
          {filteredVariables.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-white-darker text-sm">
                No variables found
              </div>
              <div className="text-white-darker text-xs mt-1">
                Try adjusting your search terms
              </div>
            </div>
          ) : (
            filteredVariables.map((variable) => (
              <div
                key={variable.id}
                className="p-2.5 rounded-lg border border-black-lighter bg-black-darker cursor-pointer transition-all hover:bg-black-dark hover:border-mint/50 active:bg-mint/10"
                onClick={() => handleVariableSelect(variable)}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-white-light text-sm font-medium">
                    {variable.label}
                  </h4>
                  <span className="text-xs px-1.5 py-0.5 bg-black-light text-white-darker rounded uppercase tracking-wider">
                    {variable.category}
                  </span>
                </div>

                <p className="text-white-darker text-xs leading-relaxed mb-2">
                  {variable.description}
                </p>

                <div className="bg-black/40 rounded px-2 py-1">
                  <code className="text-mint text-xs font-mono">
                    ${variable.id}
                  </code>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GameVariables;
