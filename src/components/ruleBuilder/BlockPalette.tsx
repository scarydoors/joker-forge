import React, { useState, useMemo, useEffect } from "react";
import { useDraggable } from "@dnd-kit/core";
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
import {
  SwatchIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import {
  BoltIcon,
  PuzzlePieceIcon,
  BeakerIcon,
} from "@heroicons/react/16/solid";

interface BlockPaletteProps {
  position: { x: number; y: number };
  selectedRule: Rule | null;
  rulesCount: number;
  onAddTrigger: (triggerId: string) => void;
  onAddCondition: (conditionType: string) => void;
  onAddEffect: (effectType: string) => void;
  onClose: () => void;
  onPositionChange: (position: { x: number; y: number }) => void;
}

type FilterType = "triggers" | "conditions" | "effects";

const BlockPalette: React.FC<BlockPaletteProps> = ({
  position,
  selectedRule,
  rulesCount,
  onAddTrigger,
  onAddCondition,
  onAddEffect,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    triggers: true,
    conditions: true,
    effects: true,
  });
  const [activeFilters, setActiveFilters] = useState<FilterType[]>([]);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: "panel-blockPalette",
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

  const showOnlyTriggers = !selectedRule;

  useEffect(() => {
    if (rulesCount > 0) {
      setExpandedSections((prev) => ({
        ...prev,
        triggers: false,
      }));
    } else {
      setExpandedSections((prev) => ({
        ...prev,
        triggers: true,
      }));
    }
  }, [rulesCount]);

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

  const shouldShowSection = (sectionType: FilterType) => {
    if (activeFilters.length === 0) return true;
    return activeFilters.includes(sectionType);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleFilterToggle = (filterType: FilterType) => {
    setActiveFilters((prev) => {
      const newFilters = prev.includes(filterType)
        ? prev.filter((f) => f !== filterType)
        : [...prev, filterType];

      if (newFilters.includes(filterType) && !expandedSections[filterType]) {
        setExpandedSections((prevExpanded) => ({
          ...prevExpanded,
          [filterType]: true,
        }));
      }

      return newFilters;
    });
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
    const filterKey = `${sectionKey}` as FilterType;

    if (showOnlyTriggers && type !== "trigger") return null;
    if (!shouldShowSection(filterKey)) return null;
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
                <div key={item.id} className="px-2">
                  <BlockComponent
                    label={item.label}
                    type={type}
                    onClick={() => onAdd(item.id)}
                    variant="palette"
                  />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-80 bg-black-dark backdrop-blur-md border-2 border-black-lighter rounded-lg shadow-2xl z-40"
    >
      <div
        className="flex items-center justify-between p-3 border-b border-black-lighter cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <div className="flex items-center gap-2">
          <Bars3Icon className="h-4 w-4 text-white-darker" />
          <SwatchIcon className="h-5 w-5 text-white-light" />
          <h3 className="text-white-light text-sm font-medium tracking-wider">
            Block Palette
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-white-darker hover:text-white transition-colors cursor-pointer"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="p-3">
        <div className="w-1/4 h-[1px] bg-black-lighter mx-auto mb-4"></div>

        {!showOnlyTriggers && (
          <div className="flex justify-center gap-2 mb-4">
            <button
              onClick={() => handleFilterToggle("triggers")}
              className={`p-2 rounded-md transition-colors cursor-pointer border ${
                activeFilters.includes("triggers")
                  ? "bg-trigger text-black border-trigger"
                  : "bg-black-darker text-trigger border-trigger hover:bg-trigger hover:text-black"
              }`}
              title="Filter Triggers"
            >
              <BoltIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleFilterToggle("conditions")}
              className={`p-2 rounded-md transition-colors cursor-pointer border ${
                activeFilters.includes("conditions")
                  ? "bg-condition text-white border-condition"
                  : "bg-black-darker text-condition border-condition hover:bg-condition hover:text-white"
              }`}
              title="Filter Conditions"
            >
              <BeakerIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleFilterToggle("effects")}
              className={`p-2 rounded-md transition-colors cursor-pointer border ${
                activeFilters.includes("effects")
                  ? "bg-effect text-black border-effect"
                  : "bg-black-darker text-effect border-effect hover:bg-effect hover:text-black"
              }`}
              title="Filter Effects"
            >
              <PuzzlePieceIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="relative mb-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mint stroke-2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search blocks..."
              className="w-full bg-black-darker border border-black-lighter rounded-lg pl-10 pr-4 py-2 text-white text-sm placeholder-white-darker focus:outline-none focus:border-mint transition-colors"
            />
          </div>
        </div>

        <div className="h-[45rem] overflow-y-auto custom-scrollbar">
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
    </div>
  );
};

export default BlockPalette;
