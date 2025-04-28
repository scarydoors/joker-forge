import React from "react";
import JokerCard, { JokerData } from "./JokerCard";

interface JokerCollectionProps {
  jokers: JokerData[];
  selectedJokerId: string | null;
  onSelectJoker: (jokerId: string) => void;
  onAddNewJoker: () => void;
  onExportClick: () => void;
  modName: string;
}

const JokerCollection: React.FC<JokerCollectionProps> = ({
  jokers,
  selectedJokerId,
  onSelectJoker,
  onAddNewJoker,
  onExportClick,
  modName,
}) => {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-2">
        <h2 className="text-2xl text-white text-shadow-pixel text-center">
          Your Jokers ({jokers.length})
        </h2>
        <div className="text-center text-balatro-lightgrey text-sm">
          {modName}
        </div>
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar p-2">
        {jokers.length === 0 ? (
          <div className="w-full h-40 flex items-center justify-center">
            <div className="text-center text-xl text-balatro-lightgrey">
              Add a joker to get started
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5">
            {jokers.map((joker) => (
              <div
                key={joker.id}
                className={`p-2 ${selectedJokerId === joker.id ? "" : ""}`}
                onClick={() => onSelectJoker(joker.id)}
              >
                <JokerCard
                  joker={joker}
                  onClick={() => onSelectJoker(joker.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 space-y-3">
        <button
          className="w-full text-white text-lg bg-balatro-black hover:bg-balatro-light-black py-2 pixel-corners-medium relative"
          onClick={onAddNewJoker}
          style={{ transition: "background-color 0.2s ease" }}
        >
          <div className="absolute inset-0 bg-balatro-blackshadow pixel-corners-medium translate-y-1"></div>
          <span className="relative text-shadow-pixel z-10">
            + Add New Joker
          </span>
        </button>

        <button
          className="w-full text-white text-lg bg-balatro-blue hover:bg-balatro-blueshadow py-2 pixel-corners-medium relative"
          onClick={onExportClick}
          disabled={jokers.length === 0}
          style={{ transition: "background-color 0.2s ease" }}
        >
          <div className="absolute inset-0 bg-balatro-blackshadow pixel-corners-medium translate-y-1"></div>
          <span className="relative text-shadow-pixel z-10">Export as Mod</span>
        </button>
      </div>
    </div>
  );
};

export default JokerCollection;
