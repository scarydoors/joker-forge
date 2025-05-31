import React, { useState } from "react";
import type { Rule } from "./types";
import { TRIGGERS } from "./Triggers";
import { getConditionsForTrigger } from "./Conditions";
import { getEffectsForTrigger } from "./Effects";
import {
  BoltIcon,
  BeakerIcon,
  PuzzlePieceIcon,
} from "@heroicons/react/24/outline";
import { SwatchIcon } from "@heroicons/react/16/solid";

interface BlockPaletteProps {
  selectedRule: Rule | null;
  onAddTrigger: (triggerId: string) => void;
  onAddCondition: (conditionType: string) => void;
  onAddEffect: (effectType: string) => void;
}

type PaletteTab = "triggers" | "conditions" | "effects";

const BlockPalette: React.FC<BlockPaletteProps> = ({
  selectedRule,
  onAddTrigger,
  onAddCondition,
  onAddEffect,
}) => {
  const [activeTab, setActiveTab] = useState<PaletteTab>("triggers");

  const showOnlyTriggers = !selectedRule;
  const availableConditions = selectedRule
    ? getConditionsForTrigger(selectedRule.trigger)
    : [];
  const availableEffects = selectedRule
    ? getEffectsForTrigger(selectedRule.trigger)
    : [];

  const getTabs = (): {
    id: PaletteTab;
    label: string;
    icon: React.ReactNode;
    count: number;
  }[] => {
    if (showOnlyTriggers) {
      return [
        {
          id: "triggers",
          label: "Triggers",
          icon: <BoltIcon className="h-4 w-4" />,
          count: TRIGGERS.length,
        },
      ];
    }

    return [
      {
        id: "triggers",
        label: "Triggers",
        icon: <BoltIcon className="h-4 w-4" />,
        count: TRIGGERS.length,
      },
      {
        id: "conditions",
        label: "Conditions",
        icon: <BeakerIcon className="h-4 w-4" />,
        count: availableConditions.length,
      },
      {
        id: "effects",
        label: "Effects",
        icon: <PuzzlePieceIcon className="h-4 w-4" />,
        count: availableEffects.length,
      },
    ];
  };

  const tabs = getTabs();

  React.useEffect(() => {
    if (showOnlyTriggers) {
      setActiveTab("triggers");
    }
  }, [showOnlyTriggers]);

  const renderBlockItem = (
    id: string,
    label: string,
    description: string,
    type: "trigger" | "condition" | "effect",
    onClick: () => void
  ) => {
    const getTypeColor = () => {
      switch (type) {
        case "trigger":
          return "hover:bg-mint/20 border-mint/30";
        case "condition":
          return "hover:bg-balatro-blue/20 border-balatro-blue/30";
        case "effect":
          return "hover:bg-balatro-orange/20 border-balatro-orange/30";
      }
    };

    return (
      <div
        key={id}
        className={`
          p-3 border-2 border-black-lighter rounded-lg cursor-pointer
          transition-all ${getTypeColor()}
        `}
        onClick={onClick}
      >
        <div className="text-white text-sm font-medium tracking-wide mb-1">
          {label}
        </div>
        <div className="text-white-darker text-xs leading-relaxed">
          {description}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "triggers":
        return (
          <div className="space-y-2">
            {TRIGGERS.map((trigger) =>
              renderBlockItem(
                trigger.id,
                trigger.label,
                trigger.description,
                "trigger",
                () => onAddTrigger(trigger.id)
              )
            )}
          </div>
        );

      case "conditions":
        return (
          <div className="space-y-2">
            {availableConditions.map((condition) =>
              renderBlockItem(
                condition.id,
                condition.label,
                condition.description,
                "condition",
                () => onAddCondition(condition.id)
              )
            )}
            {availableConditions.length === 0 && (
              <div className="text-white-darker text-sm text-center py-8">
                No conditions available for this trigger
              </div>
            )}
          </div>
        );

      case "effects":
        return (
          <div className="space-y-2">
            {availableEffects.map((effect) =>
              renderBlockItem(
                effect.id,
                effect.label,
                effect.description,
                "effect",
                () => onAddEffect(effect.id)
              )
            )}
            {availableEffects.length === 0 && (
              <div className="text-white-darker text-sm text-center py-8">
                No effects available for this trigger
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="bg-black-dark border-black-lighter border-t-1 border-r-2 flex flex-col h-full">
      <div className="p-3 border-black-lighter">
        <span className="flex items-center justify-center mb-2 gap-2">
          <SwatchIcon className="h-6 w-6 text-white-light" />
          <h3 className="text-white-light text-lg font-medium tracking-wider">
            Block Palette
          </h3>
        </span>

        <div className="w-1/4 h-[1px] bg-black-lighter mx-auto mb-4"></div>

        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-md text-xs transition-colors
                ${
                  activeTab === tab.id
                    ? "bg-mint text-black-darker"
                    : "text-white-darker hover:text-white hover:bg-black-light"
                }
              `}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span className="text-xs opacity-70">({tab.count})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar p-3">
        {renderContent()}
      </div>
    </div>
  );
};

export default BlockPalette;
