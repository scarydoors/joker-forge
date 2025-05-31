import React from "react";
import type { Rule, ConditionGroup, Condition, Effect } from "./types";
import { getTriggerById } from "./Triggers";
import { getConditionTypeById } from "./Conditions";
import { getEffectTypeById } from "./Effects";
import BlockComponent from "./BlockComponent";
import {
  TrashIcon,
  PlusIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

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
  onAddConditionGroup: (ruleId: string) => void;
  onToggleGroupOperator: (ruleId: string, groupId: string) => void;
  isRuleSelected: boolean;
}

const RuleCard: React.FC<RuleCardProps> = ({
  rule,
  ruleIndex,
  selectedItem,
  onSelectItem,
  onDeleteRule,
  onDeleteCondition,
  onDeleteEffect,
  onAddConditionGroup,
  onToggleGroupOperator,
  isRuleSelected,
}) => {
  const trigger = getTriggerById(rule.trigger);
  const allConditions = rule.conditionGroups.flatMap(
    (group) => group.conditions
  );
  const totalConditions = allConditions.length;
  const totalEffects = rule.effects.length;

  const isItemSelected = (
    type: "trigger" | "condition" | "effect",
    itemId?: string
  ) => {
    if (!selectedItem || selectedItem.ruleId !== rule.id) return false;
    if (selectedItem.type !== type) return false;
    if (type === "trigger") return true;
    return selectedItem.itemId === itemId;
  };

  const getParameterCount = (params: Record<string, unknown>) => {
    return Object.keys(params).length;
  };

  const generateConditionTitle = (condition: Condition) => {
    const conditionType = getConditionTypeById(condition.type);
    const baseLabel = conditionType?.label || "Unknown Condition";

    if (!condition.params || Object.keys(condition.params).length === 0) {
      return baseLabel;
    }

    const params = condition.params;

    switch (condition.type) {
      case "hand_type":
        if (params.value) {
          return `If Hand Type = ${params.value}`;
        }
        break;
      case "player_money":
        if (params.operator && params.value !== undefined) {
          const op =
            params.operator === "greater_than"
              ? ">"
              : params.operator === "less_than"
              ? "<"
              : params.operator === "equals"
              ? "="
              : params.operator === "greater_equals"
              ? ">="
              : params.operator === "less_equals"
              ? "<="
              : "≠";
          return `If Player Money ${op} $${params.value}`;
        }
        break;
      case "card_count":
        if (params.operator && params.value !== undefined) {
          const op =
            params.operator === "greater_than"
              ? ">"
              : params.operator === "less_than"
              ? "<"
              : params.operator === "equals"
              ? "="
              : params.operator === "greater_equals"
              ? ">="
              : params.operator === "less_equals"
              ? "<="
              : "≠";
          return `If Card Count ${op} ${params.value}`;
        }
        break;
      case "card_rank":
        if (params.specific_rank) {
          return `If Card Rank = ${params.specific_rank}`;
        } else if (params.rank_group) {
          return `If Card Rank = ${params.rank_group}`;
        }
        break;
      case "card_suit":
        if (params.specific_suit) {
          return `If Card Suit = ${params.specific_suit}`;
        } else if (params.suit_group) {
          return `If Card Suit = ${params.suit_group}`;
        }
        break;
      case "remaining_hands":
        if (params.operator && params.value !== undefined) {
          const op =
            params.operator === "greater_than"
              ? ">"
              : params.operator === "less_than"
              ? "<"
              : params.operator === "equals"
              ? "="
              : params.operator === "greater_equals"
              ? ">="
              : params.operator === "less_equals"
              ? "<="
              : "≠";
          return `If Remaining Hands ${op} ${params.value}`;
        }
        break;
      case "remaining_discards":
        if (params.operator && params.value !== undefined) {
          const op =
            params.operator === "greater_than"
              ? ">"
              : params.operator === "less_than"
              ? "<"
              : params.operator === "equals"
              ? "="
              : params.operator === "greater_equals"
              ? ">="
              : params.operator === "less_equals"
              ? "<="
              : "≠";
          return `If Remaining Discards ${op} ${params.value}`;
        }
        break;
      case "random_chance":
        if (params.numerator && params.denominator) {
          return `If Random ${params.numerator} in ${params.denominator}`;
        }
        break;
    }

    return baseLabel;
  };

  const generateEffectTitle = (effect: Effect) => {
    const effectType = getEffectTypeById(effect.type);
    const baseLabel = effectType?.label || "Unknown Effect";

    if (!effect.params || Object.keys(effect.params).length === 0) {
      return baseLabel;
    }

    const params = effect.params;

    switch (effect.type) {
      case "add_chips":
        if (params.value !== undefined) {
          return `Add ${params.value} Chips`;
        }
        break;
      case "add_mult":
        if (params.value !== undefined) {
          return `Add ${params.value} Mult`;
        }
        break;
      case "apply_x_mult":
        if (params.value !== undefined) {
          return `Apply ${params.value}x Mult`;
        }
        break;
      case "add_dollars":
        if (params.value !== undefined) {
          return `Add $${params.value}`;
        }
        break;
      case "retrigger_cards":
        if (params.repetitions !== undefined) {
          return `Retrigger ${params.repetitions}x`;
        }
        break;
      case "edit_hand":
        if (params.operation && params.value !== undefined) {
          const op =
            params.operation === "add"
              ? "+"
              : params.operation === "subtract"
              ? "-"
              : "Set to";
          return `${op} ${params.value} Hands`;
        }
        break;
      case "edit_discard":
        if (params.operation && params.value !== undefined) {
          const op =
            params.operation === "add"
              ? "+"
              : params.operation === "subtract"
              ? "-"
              : "Set to";
          return `${op} ${params.value} Discards`;
        }
        break;
      case "level_up_hand":
        if (params.value !== undefined) {
          return `Level Up Hand ${params.value}x`;
        }
        break;
    }

    return baseLabel;
  };

  const generateDescription = () => {
    const triggerText = trigger?.label || "Unknown Trigger";
    const conditionsText =
      totalConditions > 0
        ? ` > ${allConditions
            .map((c) => {
              const condType = getConditionTypeById(c.type);
              return condType?.label || "Unknown";
            })
            .join(" AND ")}`
        : "";
    const effectsText =
      totalEffects > 0
        ? ` > ${rule.effects
            .map((e) => {
              const effType = getEffectTypeById(e.type);
              return effType?.label || "Unknown";
            })
            .join(", ")}`
        : "";

    return `${triggerText}${conditionsText}${effectsText}`;
  };

  const renderConditionGroup = (group: ConditionGroup, groupIndex: number) => {
    return (
      <div key={group.id} className="relative">
        <div className="border-2 border-dashed border-black-lighter rounded-lg p-4 bg-black-darker/30">
          <div className="flex items-center justify-between mb-3">
            <div className="text-white-darker text-xs tracking-wider uppercase">
              Condition Group {groupIndex + 1}
            </div>
          </div>

          <div className="space-y-3">
            {group.conditions.map((condition, conditionIndex) => {
              const conditionType = getConditionTypeById(condition.type);
              return (
                <div key={condition.id}>
                  <BlockComponent
                    type="condition"
                    label={conditionType?.label || "Unknown Condition"}
                    dynamicTitle={generateConditionTitle(condition)}
                    isSelected={isItemSelected("condition", condition.id)}
                    onClick={() =>
                      onSelectItem({
                        type: "condition",
                        ruleId: rule.id,
                        itemId: condition.id,
                      })
                    }
                    showTrash={true}
                    onDelete={() => onDeleteCondition(rule.id, condition.id)}
                    parameterCount={getParameterCount(condition.params)}
                    isNegated={condition.negate}
                  />
                  {conditionIndex < group.conditions.length - 1 && (
                    <div className="text-center py-2">
                      <button
                        onClick={() => onToggleGroupOperator(rule.id, group.id)}
                        className="px-3 py-1 bg-black-light border border-black-lighter rounded text-white-darker text-sm hover:bg-black transition-colors"
                      >
                        {group.operator.toUpperCase()}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {groupIndex < rule.conditionGroups.length - 1 && (
          <div className="text-center py-3">
            <span className="text-white-darker text-sm font-medium tracking-wider">
              AND
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`
        w-96 bg-black-dark border-2 rounded-lg overflow-hidden
        ${isRuleSelected ? "border-mint" : "border-black-lighter"}
      `}
    >
      <div className="bg-black-darker px-4 py-3 border-b border-black-lighter">
        <div className="flex justify-between items-center">
          <h3 className="text-white-light text-lg font-medium tracking-wider">
            Rule {ruleIndex + 1}
          </h3>
          <div className="flex items-center gap-4">
            {totalConditions > 0 && (
              <span className="text-white-darker text-sm">
                {totalConditions} Condition{totalConditions !== 1 ? "s" : ""}
              </span>
            )}
            {totalEffects > 0 && (
              <span className="text-white-darker text-sm">
                {totalEffects} Effect{totalEffects !== 1 ? "s" : ""}
              </span>
            )}
            <button
              onClick={() => onDeleteRule(rule.id)}
              className="p-2 text-balatro-red hover:bg-balatro-red/20 rounded transition-colors"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <BlockComponent
            type="trigger"
            label={trigger?.label || "Unknown Trigger"}
            isSelected={isItemSelected("trigger")}
            onClick={() => onSelectItem({ type: "trigger", ruleId: rule.id })}
          />
        </div>

        {/* Separator */}
        {(rule.conditionGroups.length > 0 || rule.effects.length > 0) && (
          <div className="flex justify-center">
            <ChevronDownIcon className="h-5 w-5 text-white-darker" />
          </div>
        )}

        {rule.conditionGroups.length > 0 && (
          <div className="space-y-4">
            {rule.conditionGroups.map((group, index) =>
              renderConditionGroup(group, index)
            )}
            <div className="flex justify-center">
              <button
                onClick={() => onAddConditionGroup(rule.id)}
                className="flex items-center gap-2 px-3 py-2 bg-black-light border border-black-lighter rounded text-white-darker text-sm hover:bg-black transition-colors"
              >
                <PlusIcon className="h-4 w-4" />
                Add Condition Group
              </button>
            </div>
          </div>
        )}

        {/* Separator */}
        {rule.effects.length > 0 && rule.conditionGroups.length > 0 && (
          <div className="flex justify-center">
            <ChevronDownIcon className="h-5 w-5 text-white-darker" />
          </div>
        )}

        {rule.effects.length > 0 && (
          <div className="space-y-3">
            {rule.effects.map((effect) => {
              const effectType = getEffectTypeById(effect.type);
              return (
                <BlockComponent
                  key={effect.id}
                  type="effect"
                  label={effectType?.label || "Unknown Effect"}
                  dynamicTitle={generateEffectTitle(effect)}
                  isSelected={isItemSelected("effect", effect.id)}
                  onClick={() =>
                    onSelectItem({
                      type: "effect",
                      ruleId: rule.id,
                      itemId: effect.id,
                    })
                  }
                  showTrash={true}
                  onDelete={() => onDeleteEffect(rule.id, effect.id)}
                  parameterCount={getParameterCount(effect.params)}
                />
              );
            })}
          </div>
        )}

        <div className="border-t border-black-lighter pt-4">
          <div className="text-white-darker text-xs tracking-wider uppercase mb-2">
            Description
          </div>
          <div className="text-white-darker text-sm leading-relaxed">
            {generateDescription()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RuleCard;
