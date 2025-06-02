import React from "react";
import { JokerData } from "../JokerCard";
import { IdentificationIcon } from "@heroicons/react/16/solid";

interface JokerInfoProps {
  joker: JokerData;
  rulesCount: number;
}

const JokerInfo: React.FC<JokerInfoProps> = ({ joker, rulesCount }) => {
  return (
    <div className="bg-black-dark p-4 border-r-2 border-black-light">
      <div className="flex items-center gap-2 mb-3">
        <IdentificationIcon className="h-6 w-6 text-white" />
        <span className="text-white font-light tracking-wide">
          {joker.name}
        </span>
      </div>

      <div className="text-white-darker text-sm">
        {rulesCount === 0
          ? "No Rules"
          : `${rulesCount} Rule${rulesCount !== 1 ? "s" : ""}`}
      </div>
    </div>
  );
};

export default JokerInfo;
