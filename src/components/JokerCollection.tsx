import React from "react";
import JokerCard, { JokerData } from "./JokerCard";
import Button from "./generic/Button";
import {
  PlusIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

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
    <div className="h-full flex flex-col font-lexend">
      <h2 className="text-xl text-white-darker font-extralight tracking-widest px-4 flex items-center">
        COLLECTION
      </h2>
      <div className="text-white-darker text-sm px-4 pt-1 tracking-wide flex items-center">
        <DocumentTextIcon className="h-4 w-4 mr-2 text-mint" />
        {modName} • {jokers.length} Joker{jokers.length !== 1 ? "s" : ""}
      </div>
      <div className="h-[2px] bg-black w-2/3 mt-4 mx-auto"></div>

      <div className="flex-1 px-4 py-4 bg-black-darker">
        {jokers.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-140">
            <InformationCircleIcon className="h-12 w-12 text-mint opacity-60 mb-3" />
            <p className="text-white-darker text-lg font-light">
              Your collection is empty
            </p>
            <p className="text-white-darker text-sm mt-2 max-w-xs font-light">
              Create your first custom joker
            </p>
          </div>
        ) : (
          <div className="overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-6 ">
              {jokers.map((joker) => (
                <div
                  key={joker.id}
                  className={`
                    ${selectedJokerId === joker.id ? "bg-black rounded-lg" : ""}
                    flex justify-center p-2 items-center hover:bg-black rounded-lg transition-colors
                    cursor-pointer
                  `}
                  onClick={() => onSelectJoker(joker.id)}
                >
                  <JokerCard
                    joker={joker}
                    onClick={() => onSelectJoker(joker.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="h-[2px] bg-black w-2/3 mt-4 mx-auto"></div>
      <div className="px-4 pb-4 mt-auto pt-4 grid grid-cols-2 gap-4">
        <Button
          variant="secondary"
          onClick={onAddNewJoker}
          icon={<PlusIcon className="h-5 w-5" />}
        >
          New Joker
        </Button>

        <Button
          variant="primary"
          onClick={onExportClick}
          disabled={jokers.length === 0}
          icon={<ArrowUpTrayIcon className="h-5 w-5" />}
        >
          Export
        </Button>
      </div>
    </div>
  );
};

export default JokerCollection;
