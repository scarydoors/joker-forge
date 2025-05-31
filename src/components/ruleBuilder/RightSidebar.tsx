import React from "react";
import type { Rule, Condition, Effect } from "./types";
import { JokerData } from "../JokerCard";
import Variables from "./Variables";
import Inspector from "./Inspector";

interface RightSidebarProps {
  joker: JokerData;
  selectedRule: Rule | null;
  selectedCondition: Condition | null;
  selectedEffect: Effect | null;
  onUpdateCondition: (
    ruleId: string,
    conditionId: string,
    updates: Partial<Condition>
  ) => void;
  onUpdateEffect: (
    ruleId: string,
    effectId: string,
    updates: Partial<Effect>
  ) => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({
  joker,
  selectedRule,
  selectedCondition,
  selectedEffect,
  onUpdateCondition,
  onUpdateEffect,
}) => {
  return (
    <div className="w-80 flex flex-col">
      <Variables joker={joker} />
      <Inspector
        selectedRule={selectedRule}
        selectedCondition={selectedCondition}
        selectedEffect={selectedEffect}
        onUpdateCondition={onUpdateCondition}
        onUpdateEffect={onUpdateEffect}
      />
    </div>
  );
};

export default RightSidebar;
