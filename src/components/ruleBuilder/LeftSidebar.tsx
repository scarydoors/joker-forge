import React from "react";
import type { Rule } from "./types";
import { JokerData } from "../JokerCard";
import JokerInfo from "./JokerInfo";
import BlockPalette from "./BlockPalette";

interface LeftSidebarProps {
  joker: JokerData;
  selectedRule: Rule | null;
  onAddTrigger: (triggerId: string) => void;
  onAddCondition: (conditionType: string) => void;
  onAddEffect: (effectType: string) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  joker,
  selectedRule,
  onAddTrigger,
  onAddCondition,
  onAddEffect,
}) => {
  return (
    <div className="w-80 flex flex-col ">
      <JokerInfo joker={joker} />
      <BlockPalette
        selectedRule={selectedRule}
        onAddTrigger={onAddTrigger}
        onAddCondition={onAddCondition}
        onAddEffect={onAddEffect}
      />
    </div>
  );
};

export default LeftSidebar;
