import React from "react";
import type { Rule } from "./types";
import { getTriggerById } from "./Triggers";
import { getConditionTypeById } from "./Conditions";
import { getEffectTypeById } from "./Effects";
import { TrashIcon, BoltIcon, BeakerIcon } from "@heroicons/react/24/outline";

interface RuleCardProps {
  rule: Rule;
  ruleIndex: number;
  selectedItem: {
    type: "trigger" | "condition" | "effect";
    ruleId: string;
    itemId?: string;
  } | null;
  onSelectItem: (item: {
    type: "trigger" | "condition" | "effect";
    ruleId: string;
    itemId?: string;
  }) => void;
  onDeleteRule: (ruleId: string) => void;
  onDeleteCondition: (ruleId: string, conditionId: string) => void;
  onDeleteEffect: (ruleId: string, effectId: string) => void;
}

interface BlockComponentProps {
  type: "trigger" | "condition" | "effect";
  label: string;
  isSelected: boolean;
  onClick: () => void;
  onDelete?: () => void;
}

const BlockComponent: React.FC<BlockComponentProps> = ({
  type,
  label,
  isSelected,
  onClick,
  onDelete,
}) => {
  const getTypeColor = () => {
    switch (type) {
      case "trigger":
        return "bg-mint text-black-darker border-mint-dark";
      case "condition":
        return "bg-balatro-blue text-white border-balatro-blueshadow";
      case "effect":
        return "bg-balatro-orange text-black-darker border-balatro-red";
      default:
        return "bg-black-light text-white border-black-lighter";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "trigger":
        return <BoltIcon className="h-4 w-4" />;
      case "condition":
        return <BeakerIcon className="h-4 w-4" />;
      case "effect":
        return <BoltIcon className="h-4 w-4" />;
    }
  };

  return (
    <div
      className={`
        relative p-3 rounded-lg border-2 cursor-pointer transition-all
        ${getTypeColor()}
        ${
          isSelected
            ? "ring-2 ring-white ring-offset-2 ring-offset-black"
            : "hover:opacity-80"
        }
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getIcon()}
          <span className="text-sm font-medium tracking-wide">{label}</span>
        </div>
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 hover:bg-black/20 rounded transition-colors"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

const RuleCard: React.FC<RuleCardProps> = ({
  rule,
  ruleIndex,
  selectedItem,
  onSelectItem,
  onDeleteRule,
  onDeleteCondition,
  onDeleteEffect,
}) => {
  const trigger = getTriggerById(rule.trigger);
  const allConditions = rule.conditionGroups.flatMap(
    (group) => group.conditions
  );

  const isItemSelected = (
    type: "trigger" | "condition" | "effect",
    itemId?: string
  ) => {
    if (!selectedItem || selectedItem.ruleId !== rule.id) return false;
    if (selectedItem.type !== type) return false;
    if (type === "trigger") return true;
    return selectedItem.itemId === itemId;
  };

  return (
    <div className="bg-black-dark/90 backdrop-blur-sm border-2 border-black-lighter rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white-light text-lg font-medium tracking-wider">
          Rule {ruleIndex + 1}
        </h3>
        <button
          onClick={() => onDeleteRule(rule.id)}
          className="p-2 text-balatro-red hover:bg-balatro-red/20 rounded transition-colors"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <div className="text-white-darker text-xs tracking-wider uppercase mb-2">
            Trigger
          </div>
          <BlockComponent
            type="trigger"
            label={trigger?.label || "Unknown Trigger"}
            isSelected={isItemSelected("trigger")}
            onClick={() => onSelectItem({ type: "trigger", ruleId: rule.id })}
          />
        </div>

        {allConditions.length > 0 && (
          <div>
            <div className="text-white-darker text-xs tracking-wider uppercase mb-2">
              Conditions
            </div>
            <div className="space-y-2">
              {allConditions.map((condition) => {
                const conditionType = getConditionTypeById(condition.type);
                return (
                  <BlockComponent
                    key={condition.id}
                    type="condition"
                    label={conditionType?.label || "Unknown Condition"}
                    isSelected={isItemSelected("condition", condition.id)}
                    onClick={() =>
                      onSelectItem({
                        type: "condition",
                        ruleId: rule.id,
                        itemId: condition.id,
                      })
                    }
                    onDelete={() => onDeleteCondition(rule.id, condition.id)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {rule.effects.length > 0 && (
          <div>
            <div className="text-white-darker text-xs tracking-wider uppercase mb-2">
              Effects
            </div>
            <div className="space-y-2">
              {rule.effects.map((effect) => {
                const effectType = getEffectTypeById(effect.type);
                return (
                  <BlockComponent
                    key={effect.id}
                    type="effect"
                    label={effectType?.label || "Unknown Effect"}
                    isSelected={isItemSelected("effect", effect.id)}
                    onClick={() =>
                      onSelectItem({
                        type: "effect",
                        ruleId: rule.id,
                        itemId: effect.id,
                      })
                    }
                    onDelete={() => onDeleteEffect(rule.id, effect.id)}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RuleCard;
