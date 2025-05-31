import React from "react";
import { JokerData } from "../JokerCard";
import { IdentificationIcon } from "@heroicons/react/16/solid";

//TODO
// Button to close the sidebar
// Dynamic trigger count

interface JokerInfoProps {
  joker: JokerData;
}

const JokerInfo: React.FC<JokerInfoProps> = ({ joker }) => {
  return (
    <div className="bg-black-dark p-4 border-t-2 border-r-2 border-black-light">
      <div className="flex items-center gap-2 mb-3">
        <IdentificationIcon className="h-6 w-6 text-white" />
        <span className="text-white font-light tracking-wide">
          {joker.name}
        </span>
      </div>
    </div>
  );
};

export default JokerInfo;
