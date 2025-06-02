import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import type { Rule, ConditionGroup, Condition, Effect } from "./types";
import { getTriggerById } from "./data/Triggers";
import { getConditionTypeById } from "./data/Conditions";
import { getEffectTypeById } from "./data/Effects";
import BlockComponent from "./BlockComponent";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import {
  TrashIcon,
  PlusIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  EyeSlashIcon,
  XMarkIcon,
} from "@heroicons/react/16/solid";
import { JokerData } from "../JokerCard";

interface RuleCardProps {
  rule: Rule;
  ruleIndex: number;
  selectedItem: {
    type: "trigger" | "condition" | "effect";
    ruleId: string;
    itemId?: string;
    groupId?: string;
  } | null;
  onSelectItem: (item: {
    type: "trigger" | "condition" | "effect";
    ruleId: string;
    itemId?: string;
    groupId?: string;
  }) => void;
  onDeleteRule: (ruleId: string) => void;
  onDeleteCondition: (ruleId: string, conditionId: string) => void;
  onDeleteConditionGroup: (ruleId: string, groupId: string) => void;
  onDeleteEffect: (ruleId: string, effectId: string) => void;
  onAddConditionGroup: (ruleId: string) => void;
  onToggleGroupOperator?: (ruleId: string, groupId: string) => void;
  onReorderConditions: (
    ruleId: string,
    groupId: string,
    oldIndex: number,
    newIndex: number
  ) => void;
  onReorderEffects: (
    ruleId: string,
    oldIndex: number,
    newIndex: number
  ) => void;
  isRuleSelected: boolean;
  joker: JokerData;
}

const SortableCondition: React.FC<{
  condition: Condition;
  ruleId: string;
  groupId: string;
  isSelected: boolean;
  isNegated: boolean;
  onSelect: () => void;
  onDelete: () => void;
  parameterCount: number;
  dynamicTitle: string;
}> = ({
  condition,
  isSelected,
  isNegated,
  onSelect,
  onDelete,
  parameterCount,
  dynamicTitle,
}) => {
  const conditionType = getConditionTypeById(condition.type);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: condition.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex justify-center -mt-3"
    >
      <BlockComponent
        type="condition"
        label={conditionType?.label || "Unknown Condition"}
        dynamicTitle={dynamicTitle}
        isSelected={isSelected}
        onClick={(e) => {
          e?.stopPropagation();
          onSelect();
        }}
        showTrash={true}
        onDelete={() => {
          onDelete();
        }}
        parameterCount={parameterCount}
        isNegated={isNegated}
        isDraggable={true}
        dragHandleProps={listeners}
        variant="condition"
      />
    </div>
  );
};

const SortableEffect: React.FC<{
  effect: Effect;
  ruleId: string;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  parameterCount: number;
  dynamicTitle: string;
  hasRandomChance: boolean;
}> = ({
  effect,
  isSelected,
  onSelect,
  onDelete,
  parameterCount,
  dynamicTitle,
  hasRandomChance,
}) => {
  const effectType = getEffectTypeById(effect.type);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: effect.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex justify-center"
    >
      <BlockComponent
        type="effect"
        label={effectType?.label || "Unknown Effect"}
        dynamicTitle={dynamicTitle}
        isSelected={isSelected}
        onClick={(e) => {
          e?.stopPropagation();
          onSelect();
        }}
        showTrash={true}
        onDelete={() => {
          onDelete();
        }}
        parameterCount={parameterCount}
        hasRandomChance={hasRandomChance}
        isDraggable={true}
        dragHandleProps={listeners}
        variant="default"
      />
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
  onDeleteConditionGroup,
  onDeleteEffect,
  onAddConditionGroup,
  onToggleGroupOperator,
  onReorderConditions,
  onReorderEffects,
  isRuleSelected,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [descriptionVisible, setDescriptionVisible] = useState(true);
  const [showReopenButton, setShowReopenButton] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [conditionOperators, setConditionOperators] = useState<
    Record<string, string>
  >({});
  const [groupOperators, setGroupOperators] = useState<Record<string, string>>(
    {}
  );
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({
    x: 0,
    y: 0,
    cardX: 0,
    cardY: 0,
  });

  const handleCardMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      e.stopPropagation();
      setIsDragging(true);
      setDragStart({
        x: e.clientX,
        y: e.clientY,
        cardX: cardPosition.x,
        cardY: cardPosition.y,
      });
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        setCardPosition({
          x: dragStart.cardX + deltaX,
          y: dragStart.cardY + deltaY,
        });
      }
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
    }
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    if (!descriptionVisible) {
      const timer = setTimeout(() => {
        setShowReopenButton(true);
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setShowReopenButton(false);
    }
  }, [descriptionVisible]);

  const trigger = getTriggerById(rule.trigger);
  const allConditions = rule.conditionGroups.flatMap(
    (group) => group.conditions
  );
  const totalConditions = allConditions.length;
  const totalEffects = rule.effects.length;

  const snapFadeUp = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -15 },
  };

  const quickFade = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const slideFromRight = {
    initial: { opacity: 0, x: 20, scale: 0.9 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: 20, scale: 0.9 },
  };

  const cardEntrance = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
  };

  const popIn = {
    initial: { opacity: 0, scale: 0.8, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.8, y: -10 },
  };

  const descriptionSlideDown = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  const isItemSelected = (
    type: "trigger" | "condition" | "effect",
    itemId?: string,
    groupId?: string
  ) => {
    if (!selectedItem || selectedItem.ruleId !== rule.id) return false;
    if (selectedItem.type !== type) return false;
    if (type === "trigger") return true;
    if (type === "condition" && groupId && selectedItem.groupId !== groupId)
      return false;
    return selectedItem.itemId === itemId;
  };

  const isGroupSelected = (groupId: string) => {
    return (
      selectedItem?.ruleId === rule.id && selectedItem?.groupId === groupId
    );
  };

  const getParameterCount = (params: Record<string, unknown>) => {
    return Object.keys(params).length;
  };

  const handleEditName = () => {
    console.log("Edit rule name functionality not yet implemented");
  };

  const handleDuplicateRule = () => {
    console.log("Duplicate rule functionality not yet implemented");
  };

  const handleToggleDisabled = () => {
    setIsDisabled(!isDisabled);
    console.log(
      "Toggle rule disabled state - connect to external state management"
    );
  };

  const handleConditionOperatorToggle = (
    groupId: string,
    conditionIndex: number
  ) => {
    const key = `${groupId}-${conditionIndex}`;
    const current = conditionOperators[key] || "AND";
    const newOperator = current === "AND" ? "OR" : "AND";
    setConditionOperators((prev) => ({ ...prev, [key]: newOperator }));
  };

  const handleGroupOperatorToggle = (groupIndex: number, groupId: string) => {
    const key = `group-${groupIndex}`;
    const current = groupOperators[key] || "AND";
    const newOperator = current === "AND" ? "OR" : "AND";
    setGroupOperators((prev) => ({ ...prev, [key]: newOperator }));
    onToggleGroupOperator?.(rule.id, groupId);
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

  const handleConditionDragEnd = (
    groupId: string,
    activeId: string,
    overId: string
  ) => {
    const group = rule.conditionGroups.find((g) => g.id === groupId);
    if (group && activeId !== overId) {
      const oldIndex = group.conditions.findIndex((c) => c.id === activeId);
      const newIndex = group.conditions.findIndex((c) => c.id === overId);
      onReorderConditions(rule.id, groupId, oldIndex, newIndex);
    }
  };

  const handleEffectDragEnd = (activeId: string, overId: string) => {
    if (activeId !== overId) {
      const oldIndex = rule.effects.findIndex((e) => e.id === activeId);
      const newIndex = rule.effects.findIndex((e) => e.id === overId);
      onReorderEffects(rule.id, oldIndex, newIndex);
    }
  };

  const renderConditionGroup = (group: ConditionGroup, groupIndex: number) => {
    const isSelected = isGroupSelected(group.id);

    return (
      <motion.div
        key={group.id}
        className="relative"
        variants={popIn}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.15, delay: 0.03 }}
      >
        <div
          className={`border-2 border-dashed rounded-lg p-4 bg-black-darker/50 relative ${
            isSelected ? "border-mint" : "border-black-lighter"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onSelectItem({
              type: "condition",
              ruleId: rule.id,
              groupId: group.id,
            });
          }}
        >
          <div className="flex items-center justify-between mb-10">
            <div className="text-white-darker text-xs tracking-wider">
              CONDITION GROUP {groupIndex + 1} {isSelected && "(SELECTED)"}
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConditionGroup(rule.id, group.id);
                }}
                className="w-full h-full flex items-center rounded justify-center"
                title="Delete Condition Group"
              >
                <XMarkIcon className="h-4 w-4 text-white-dark hover:text-white-lighter cursor-pointer transition-colors" />
              </button>
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => {
              const { active, over } = event;
              if (over && active.id !== over.id) {
                handleConditionDragEnd(
                  group.id,
                  active.id as string,
                  over.id as string
                );
              }
            }}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext
              items={group.conditions.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {group.conditions.map((condition, conditionIndex) => {
                  const operatorKey = `${group.id}-${conditionIndex}`;
                  const currentOperator =
                    conditionOperators[operatorKey] || "AND";

                  return (
                    <motion.div key={condition.id}>
                      <div onClick={(e) => e.stopPropagation()}>
                        <SortableCondition
                          condition={condition}
                          ruleId={rule.id}
                          groupId={group.id}
                          isSelected={isItemSelected(
                            "condition",
                            condition.id,
                            group.id
                          )}
                          isNegated={condition.negate}
                          onSelect={() => {
                            onSelectItem({
                              type: "condition",
                              ruleId: rule.id,
                              itemId: condition.id,
                              groupId: group.id,
                            });
                          }}
                          onDelete={() =>
                            onDeleteCondition(rule.id, condition.id)
                          }
                          parameterCount={getParameterCount(condition.params)}
                          dynamicTitle={generateConditionTitle(condition)}
                        />
                      </div>

                      {conditionIndex < group.conditions.length - 1 && (
                        <div
                          className="text-center py-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConditionOperatorToggle(
                                group.id,
                                conditionIndex
                              );
                            }}
                            className="px-3 text-white-darker text-sm font-medium tracking-wider cursor-pointer rounded transition-colors hover:bg-black-light"
                          >
                            {currentOperator}
                          </button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {groupIndex < rule.conditionGroups.length - 1 && (
          <div className="text-center py-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleGroupOperatorToggle(groupIndex, group.id);
              }}
              className="px-3 text-white-darker text-sm font-medium tracking-wider cursor-pointer rounded transition-colors hover:bg-black-light"
            >
              {groupOperators[`group-${groupIndex}`] || "AND"}
            </button>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div
      className="w-80 relative pl-8 select-none"
      style={{
        zIndex: isRuleSelected ? 30 : 20,
        pointerEvents: "auto",
        transform: `translate(${cardPosition.x}px, ${cardPosition.y}px)`,
        cursor: isDragging ? "grabbing" : "default",
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelectItem({ type: "trigger", ruleId: rule.id });
      }}
      onMouseDown={handleCardMouseDown}
    >
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="absolute left-0 top-9 -ml-6 bg-black-dark border-2 border-black-lighter rounded-lg z-20 flex flex-col gap-2 py-2 p-[6px]"
            variants={slideFromRight}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.15 }}
          >
            <motion.div
              className="w-8 h-8 bg-black-darker rounded-lg flex items-center justify-center border-2 border-balatro-redshadow"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.05 }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteRule(rule.id);
                }}
                className="w-full h-full flex items-center rounded justify-center transition-colors hover:bg-balatro-redshadow active:bg-balatro-blackshadow cursor-pointer"
                title="Delete Rule"
              >
                <TrashIcon className="h-4 w-4 text-balatro-red transition-colors" />
              </button>
            </motion.div>

            <motion.div
              className="w-8 h-8 bg-black-darker rounded-lg flex items-center justify-center border-2 border-balatro-orange"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.05 }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditName();
                }}
                className="w-full h-full flex items-center rounded justify-center transition-colors hover:bg-balatro-orange/20 cursor-pointer"
                title="Edit Name"
              >
                <PencilIcon className="h-4 w-4 text-balatro-orange" />
              </button>
            </motion.div>

            <motion.div
              className="w-8 h-8 bg-black-darker rounded-lg flex items-center justify-center border-2 border-balatro-blue"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.05 }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDuplicateRule();
                }}
                className="w-full h-full flex items-center rounded justify-center transition-colors hover:bg-balatro-blue/20 cursor-pointer"
                title="Duplicate Rule"
              >
                <DocumentDuplicateIcon className="h-4 w-4 text-balatro-blue" />
              </button>
            </motion.div>

            <motion.div
              className="w-8 h-8 bg-black-darker rounded-lg flex items-center justify-center border-2 border-balatro-grey"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.05 }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleDisabled();
                }}
                className="w-full h-full flex items-center rounded justify-center transition-colors hover:bg-balatro-grey/20 cursor-pointer"
                title={isDisabled ? "Enable Rule" : "Disable Rule"}
              >
                <EyeSlashIcon className="h-4 w-4 text-balatro-grey" />
              </button>
            </motion.div>

            <motion.div
              className="w-8 h-8 bg-black-darker rounded-lg flex items-center justify-center border-2 border-white-darker"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.05 }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSidebarOpen(false);
                }}
                className="w-full h-full flex items-center rounded justify-center transition-colors hover:bg-white-darker/20 cursor-pointer"
                title="Close Menu"
              >
                <XMarkIcon className="h-4 w-4 text-white-darker" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className={`w-80 relative ${isDisabled ? "opacity-50" : ""}`}
        variants={cardEntrance}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="flex justify-center relative"
          variants={snapFadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.15 }}
          onMouseDown={handleHeaderMouseDown}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        >
          <div
            className={`bg-black border-2 rounded-t-md px-8 py-2 pt-1 relative ${
              isRuleSelected ? "border-mint" : "border-black-light"
            } ${isDisabled ? "opacity-70" : ""}`}
          >
            <span className="text-white-light text-sm tracking-widest">
              {isDisabled
                ? "Rule " + (ruleIndex + 1) + " (Disabled)"
                : "Rule " + (ruleIndex + 1)}
            </span>
          </div>
        </motion.div>

        <motion.div
          className={`
            bg-black-dark border-2 rounded-lg overflow-hidden -mt-2 relative
            ${isRuleSelected ? "border-mint" : "border-black-lighter"}
            ${isDisabled ? "bg-balatro-grey/20" : ""}
          `}
          style={{ pointerEvents: "auto" }}
          variants={snapFadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.18, delay: 0.05 }}
        >
          <div
            className="bg-black-darker px-3 py-2 border-b border-black-lighter"
            onMouseDown={handleHeaderMouseDown}
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
          >
            <div className="flex justify-between items-center">
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  setSidebarOpen(!sidebarOpen);
                }}
                className="p-1 text-white-darker hover:bg-black-light rounded transition-colors cursor-pointer"
                title="Open Menu"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.05 }}
              >
                <Bars3Icon className="h-4 w-4" />
              </motion.button>

              <motion.div
                className="flex items-center gap-3"
                variants={quickFade}
                initial="initial"
                animate="animate"
                transition={{ duration: 0.12, delay: 0.08 }}
              >
                {totalConditions > 0 && (
                  <span className="text-white-darker text-xs">
                    {totalConditions} Condition
                    {totalConditions !== 1 ? "s" : ""}
                  </span>
                )}
                {totalEffects > 0 && (
                  <span className="text-white-darker text-xs">
                    {totalEffects} Effect{totalEffects !== 1 ? "s" : ""}
                  </span>
                )}

                {rule.conditionGroups.length > 0 && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddConditionGroup(rule.id);
                      }}
                      className="w-6 h-6 bg-black-darker rounded-lg flex items-center justify-center border-2 border-mint hover:bg-mint/20 transition-colors cursor-pointer"
                      title="Add Condition Group"
                    >
                      <PlusIcon className="h-3 w-3 text-mint" />
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          <motion.div
            className="p-4 space-y-3"
            variants={quickFade}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.15, delay: 0.1 }}
          >
            <motion.div
              variants={snapFadeUp}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.12, delay: 0.12 }}
              className="flex justify-center"
            >
              <BlockComponent
                type="trigger"
                label={trigger?.label || "Unknown Trigger"}
                isSelected={isItemSelected("trigger")}
                onClick={(e) => {
                  e?.stopPropagation();
                  onSelectItem({ type: "trigger", ruleId: rule.id });
                }}
                variant="default"
              />
            </motion.div>

            {(rule.conditionGroups.length > 0 || rule.effects.length > 0) && (
              <motion.div
                className="flex justify-center"
                variants={quickFade}
                initial="initial"
                animate="animate"
                transition={{ duration: 0.1, delay: 0.15 }}
              >
                <ChevronDownIcon className="h-5 w-5 text-white-darker" />
              </motion.div>
            )}

            {rule.conditionGroups.length > 0 && (
              <motion.div
                variants={quickFade}
                initial="initial"
                animate="animate"
                transition={{ duration: 0.1, delay: 0.17 }}
              >
                {rule.conditionGroups.map((group, index) =>
                  renderConditionGroup(group, index)
                )}

                {rule.conditionGroups.length === 0 && (
                  <div className="flex justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddConditionGroup(rule.id);
                      }}
                      className="w-8 h-8 bg-black-darker rounded-lg flex items-center justify-center border-2 border-mint hover:bg-mint/20 transition-colors cursor-pointer"
                      title="Add Condition Group"
                    >
                      <PlusIcon className="h-4 w-4 text-mint" />
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {rule.effects.length > 0 && rule.conditionGroups.length > 0 && (
              <motion.div
                className="flex justify-center"
                variants={quickFade}
                initial="initial"
                animate="animate"
                transition={{ duration: 0.1, delay: 0.2 }}
              >
                <ChevronDownIcon className="h-5 w-5 text-white-darker" />
              </motion.div>
            )}

            {rule.effects.length > 0 && (
              <motion.div
                className="space-y-3"
                variants={quickFade}
                initial="initial"
                animate="animate"
                transition={{ duration: 0.1, delay: 0.22 }}
              >
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(event) => {
                    const { active, over } = event;
                    if (over && active.id !== over.id) {
                      handleEffectDragEnd(
                        active.id as string,
                        over.id as string
                      );
                    }
                  }}
                  modifiers={[restrictToVerticalAxis]}
                >
                  <SortableContext
                    items={rule.effects.map((e) => e.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {rule.effects.map((effect) => {
                      const hasRandomChance =
                        effect.params.has_random_chance === "true";

                      return (
                        <motion.div key={effect.id}>
                          <SortableEffect
                            effect={effect}
                            ruleId={rule.id}
                            isSelected={isItemSelected("effect", effect.id)}
                            onSelect={() => {
                              onSelectItem({
                                type: "effect",
                                ruleId: rule.id,
                                itemId: effect.id,
                              });
                            }}
                            onDelete={() => onDeleteEffect(rule.id, effect.id)}
                            parameterCount={getParameterCount(effect.params)}
                            dynamicTitle={generateEffectTitle(effect)}
                            hasRandomChance={hasRandomChance}
                          />
                        </motion.div>
                      );
                    })}
                  </SortableContext>
                </DndContext>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {descriptionVisible && (
            <motion.div
              className="absolute top-full left-0 w-full mt-2 bg-black-dark border-2 border-black-lighter rounded-lg p-2 z-10"
              variants={descriptionSlideDown}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="text-white-darker text-xs tracking-wider">
                  DESCRIPTION
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDescriptionVisible(false);
                  }}
                  className="w-5 h-5 bg-black-darker rounded-lg flex items-center justify-center border-2 border-black-lighter hover:bg-black-light transition-colors cursor-pointer"
                  title="Hide Description"
                >
                  <ChevronUpIcon className="h-3 w-3 text-white-darker" />
                </button>
              </div>
              <div className="text-white-darker text-xs leading-relaxed">
                {generateDescription()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {showReopenButton && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowReopenButton(false);
                setTimeout(() => {
                  setDescriptionVisible(true);
                }, 50);
              }}
              className="w-7 h-7 bg-black-darker rounded-lg flex items-center justify-center border-2 border-black-lighter hover:bg-black-light transition-colors cursor-pointer"
              title="Show Description"
            >
              <ChevronDownIcon className="h-4 w-4 text-white-darker" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default RuleCard;
