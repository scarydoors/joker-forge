import React, { useState, useMemo } from "react";
import type {
  Rule,
  TriggerDefinition,
  ConditionTypeDefinition,
  EffectTypeDefinition,
} from "./types";
import { TRIGGERS } from "./data/Triggers";
import { getConditionsForTrigger } from "./data/Conditions";
import { getEffectsForTrigger } from "./data/Effects";
import BlockComponent from "./BlockComponent";
import InputField from "../generic/InputField";
import {
  SwatchIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

interface BlockPaletteProps {
  selectedRule: Rule | null;
  onAddTrigger: (triggerId: string) => void;
  onAddCondition: (conditionType: string) => void;
  onAddEffect: (effectType: string) => void;
}

const BlockPalette: React.FC<BlockPaletteProps> = ({
  selectedRule,
  onAddTrigger,
  onAddCondition,
  onAddEffect,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    triggers: true,
    conditions: true,
    effects: true,
  });

  const showOnlyTriggers = !selectedRule;

  const availableConditions = useMemo(() => {
    return selectedRule ? getConditionsForTrigger(selectedRule.trigger) : [];
  }, [selectedRule]);

  const availableEffects = useMemo(() => {
    return selectedRule ? getEffectsForTrigger(selectedRule.trigger) : [];
  }, [selectedRule]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();

    const triggers = TRIGGERS.filter(
      (trigger) =>
        trigger.label.toLowerCase().includes(normalizedSearch) ||
        trigger.description.toLowerCase().includes(normalizedSearch)
    );

    const conditions = availableConditions.filter(
      (condition) =>
        condition.label.toLowerCase().includes(normalizedSearch) ||
        condition.description.toLowerCase().includes(normalizedSearch)
    );

    const effects = availableEffects.filter(
      (effect) =>
        effect.label.toLowerCase().includes(normalizedSearch) ||
        effect.description.toLowerCase().includes(normalizedSearch)
    );

    return { triggers, conditions, effects };
  }, [searchTerm, availableConditions, availableEffects]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const renderSection = (
    title: string,
    items:
      | TriggerDefinition[]
      | ConditionTypeDefinition[]
      | EffectTypeDefinition[],
    type: "trigger" | "condition" | "effect",
    onAdd: (id: string) => void,
    sectionKey: keyof typeof expandedSections
  ) => {
    if (showOnlyTriggers && type !== "trigger") return null;
    if (items.length === 0 && searchTerm) return null;

    const isExpanded = expandedSections[sectionKey];

    return (
      <div className="mb-4">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between p-2 hover:bg-black-light rounded-md transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-white-light text-sm font-medium tracking-wider uppercase">
              {title}
            </span>
            <span className="text-white-darker text-xs">({items.length})</span>
          </div>
          {isExpanded ? (
            <ChevronDownIcon className="h-4 w-4 text-white-darker" />
          ) : (
            <ChevronRightIcon className="h-4 w-4 text-white-darker" />
          )}
        </button>

        {isExpanded && (
          <div className="mt-2 space-y-2">
            {items.length === 0 ? (
              <div className="text-white-darker text-xs text-center py-4">
                No {title.toLowerCase()} available
              </div>
            ) : (
              items.map((item) => (
                <BlockComponent
                  key={item.id}
                  label={item.label}
                  type={type}
                  onClick={() => onAdd(item.id)}
                />
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-black-dark border-black-lighter border-t-1 border-r-2 flex flex-col h-full">
      <div className="p-3 border-b border-black-lighter">
        <span className="flex items-center justify-center mb-3 gap-2">
          <SwatchIcon className="h-6 w-6 text-white-light" />
          <h3 className="text-white-light text-lg font-medium tracking-wider">
            Block Palette
          </h3>
        </span>

        <div className="w-1/4 h-[1px] bg-black-lighter mx-auto mb-4"></div>

        <InputField
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search blocks..."
          icon={<MagnifyingGlassIcon className="h-5 w-5 text-mint stroke-2" />}
          separator={true}
          size="sm"
          className="text-sm"
        />
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar p-3">
        {renderSection(
          "Triggers",
          filteredItems.triggers,
          "trigger",
          onAddTrigger,
          "triggers"
        )}

        {renderSection(
          "Conditions",
          filteredItems.conditions,
          "condition",
          onAddCondition,
          "conditions"
        )}

        {renderSection(
          "Effects",
          filteredItems.effects,
          "effect",
          onAddEffect,
          "effects"
        )}
      </div>
    </div>
  );
};

export default BlockPalette;
