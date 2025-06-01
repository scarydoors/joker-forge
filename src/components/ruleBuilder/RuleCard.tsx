import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    startIndex: number,
    endIndex: number
  ) => void;
  onReorderEffects: (
    ruleId: string,
    startIndex: number,
    endIndex: number
  ) => void;
  isRuleSelected: boolean;
  joker: JokerData;
  canvasScale: number;
}

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
  canvasScale,
}) => {
  // State management
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

  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({
    x: 0,
    y: 0,
    cardX: 0,
    cardY: 0,
  });
  const [dragFromHeader, setDragFromHeader] = useState(false);

  // Custom drag and drop state
  const [draggedItem, setDraggedItem] = useState<{
    type: "condition" | "effect";
    id: string;
    groupId?: string;
    index: number;
    element: React.ReactElement;
    mouseOffset: { x: number; y: number };
  } | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [dropType, setDropType] = useState<"condition" | "effect" | null>(null);
  const [dropGroupId, setDropGroupId] = useState<string | null>(null);

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectItem({ type: "trigger", ruleId: rule.id });
  };

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      e.stopPropagation();
      setIsDragging(true);
      setDragFromHeader(true);
      setDragStart({
        x: e.clientX,
        y: e.clientY,
        cardX: cardPosition.x,
        cardY: cardPosition.y,
      });
    }
  };

  const handleCardMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging && dragFromHeader) {
        const deltaX = (e.clientX - dragStart.x) / canvasScale;
        const deltaY = (e.clientY - dragStart.y) / canvasScale;

        setCardPosition({
          x: dragStart.cardX + deltaX,
          y: dragStart.cardY + deltaY,
        });
      }

      if (draggedItem) {
        // Account for canvas scale when positioning the dragged item
        const newY = (e.clientY - draggedItem.mouseOffset.y) / canvasScale;
        setDragPosition({ x: draggedItem.mouseOffset.x, y: newY });

        // Calculate drop position based on Y coordinate
        const elements = document.querySelectorAll(
          `[data-drop-zone="${draggedItem.type}"]`
        );
        let closestIndex = -1;
        let closestDistance = Infinity;

        elements.forEach((element, index) => {
          const rect = element.getBoundingClientRect();
          const elementCenter = rect.top + rect.height / 2;
          const distance = Math.abs(e.clientY - elementCenter);

          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });

        if (closestIndex !== -1) {
          setDropIndex(closestIndex);
          setDropType(draggedItem.type);
          setDropGroupId(draggedItem.groupId || null);
        }
      }
    },
    [isDragging, dragFromHeader, dragStart, canvasScale, draggedItem]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging && dragFromHeader) {
      setIsDragging(false);
      setDragFromHeader(false);
    }

    if (draggedItem && dropIndex !== null && dropIndex !== draggedItem.index) {
      if (draggedItem.type === "condition" && draggedItem.groupId) {
        onReorderConditions(
          rule.id,
          draggedItem.groupId,
          draggedItem.index,
          dropIndex
        );
      } else if (draggedItem.type === "effect") {
        onReorderEffects(rule.id, draggedItem.index, dropIndex);
      }
    }

    setDraggedItem(null);
    setDropIndex(null);
    setDropType(null);
    setDropGroupId(null);
  }, [
    isDragging,
    dragFromHeader,
    draggedItem,
    dropIndex,
    onReorderConditions,
    onReorderEffects,
    rule.id,
  ]);

  useEffect(() => {
    if (isDragging || draggedItem) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, draggedItem, handleMouseMove, handleMouseUp]);

  // Handle reopen button visibility with delay
  useEffect(() => {
    if (!descriptionVisible) {
      // Wait a bit longer for the description close animation to fully complete
      const timer = setTimeout(() => {
        setShowReopenButton(true);
      }, 250);
      return () => clearTimeout(timer);
    } else {
      // Hide the button immediately when description is shown
      setShowReopenButton(false);
    }
  }, [descriptionVisible]);

  // Data processing
  const trigger = getTriggerById(rule.trigger);
  const allConditions = rule.conditionGroups.flatMap(
    (group) => group.conditions
  );
  const totalConditions = allConditions.length;
  const totalEffects = rule.effects.length;

  // Animation variants
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

  // Simple description animation
  const descriptionSlideDown = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  // Utility functions
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

  // Event handlers
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

  // Drag and drop handlers
  const handleDragStart = (
    e: React.MouseEvent,
    type: "condition" | "effect",
    id: string,
    index: number,
    groupId?: string,
    element?: React.ReactElement
  ) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const mouseOffset = {
      x: rect.left,
      y: e.clientY - rect.top,
    };

    setDraggedItem({
      type,
      id,
      index,
      groupId,
      element: element || <div></div>,
      mouseOffset,
    });

    setDragPosition({
      x: rect.left / canvasScale,
      y: (e.clientY - mouseOffset.y) / canvasScale,
    });
  };

  // Dynamic title generation
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

  // CONDITION GROUP RENDERING
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
          {/* Condition Group Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-white-darker text-xs tracking-wider">
              CONDITION GROUP {groupIndex + 1} {isSelected && "(SELECTED)"}
            </div>
            {/* Delete condition group button */}
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

          {/* Conditions within the group */}
          <div className="">
            {group.conditions.map((condition, conditionIndex) => {
              const conditionType = getConditionTypeById(condition.type);
              const operatorKey = `${group.id}-${conditionIndex}`;
              const currentOperator = conditionOperators[operatorKey] || "AND";
              const isDraggedCondition = draggedItem?.id === condition.id;
              const shouldShift =
                dropType === "condition" &&
                dropGroupId === group.id &&
                dropIndex !== null &&
                !isDraggedCondition;

              let translateY = 0;
              if (shouldShift) {
                if (
                  draggedItem &&
                  conditionIndex >= dropIndex &&
                  conditionIndex < draggedItem.index
                ) {
                  translateY = 60; // Shift down to make space
                } else if (
                  draggedItem &&
                  conditionIndex <= dropIndex &&
                  conditionIndex > draggedItem.index
                ) {
                  translateY = -60; // Shift up to make space
                }
              }

              return (
                <motion.div
                  key={condition.id}
                  variants={snapFadeUp}
                  initial="initial"
                  animate={{
                    opacity: isDraggedCondition ? 0 : 1,
                    y: translateY,
                  }}
                  transition={{
                    duration: 0.12,
                    delay: conditionIndex * 0.02,
                    y: { duration: 0.2 },
                  }}
                  data-drop-zone="condition"
                >
                  <div onClick={(e) => e.stopPropagation()}>
                    <BlockComponent
                      type="condition"
                      label={conditionType?.label || "Unknown Condition"}
                      dynamicTitle={generateConditionTitle(condition)}
                      isSelected={isItemSelected(
                        "condition",
                        condition.id,
                        group.id
                      )}
                      onClick={() => {
                        onSelectItem({
                          type: "condition",
                          ruleId: rule.id,
                          itemId: condition.id,
                          groupId: group.id,
                        });
                      }}
                      showTrash={true}
                      onDelete={() => onDeleteCondition(rule.id, condition.id)}
                      parameterCount={getParameterCount(condition.params)}
                      isNegated={condition.negate}
                      isDraggable={true}
                      onDragStart={(e) =>
                        handleDragStart(
                          e,
                          "condition",
                          condition.id,
                          conditionIndex,
                          group.id
                        )
                      }
                    />
                  </div>
                  {conditionIndex < group.conditions.length - 1 && (
                    <div
                      className="text-center"
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
        </div>

        {/* Operator between groups */}
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

  // Main component render
  return (
    <div
      className="w-96 relative pl-16 select-none"
      style={{
        zIndex: isRuleSelected ? 30 : 20,
        pointerEvents: "auto",
        transform: `translate(${cardPosition.x}px, ${cardPosition.y}px)`,
        cursor: isDragging && dragFromHeader ? "grabbing" : "default",
      }}
      onClick={handleCardClick}
      onMouseDown={handleCardMouseDown}
    >
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="absolute left-0 top-11 bg-black-dark border-2 border-black-lighter rounded-xl z-20 flex flex-col gap-2 py-2 p-[6px]"
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
        className={`w-96 relative ${isDisabled ? "opacity-50" : ""}`}
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
          style={{ cursor: "grab" }}
        >
          <div
            className={`bg-black border-2 rounded-t-md px-6 pt-2 py-3 relative ${
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
            className="bg-black-darker px-4 py-3 border-b border-black-lighter"
            onMouseDown={handleHeaderMouseDown}
            style={{ cursor: "grab" }}
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
                className="flex items-center gap-4"
                variants={quickFade}
                initial="initial"
                animate="animate"
                transition={{ duration: 0.12, delay: 0.08 }}
              >
                {totalConditions > 0 && (
                  <span className="text-white-darker text-sm">
                    {totalConditions} Condition
                    {totalConditions !== 1 ? "s" : ""}
                  </span>
                )}
                {totalEffects > 0 && (
                  <span className="text-white-darker text-sm">
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
            className="p-4 space-y-4"
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
            >
              <BlockComponent
                type="trigger"
                label={trigger?.label || "Unknown Trigger"}
                isSelected={isItemSelected("trigger")}
                onClick={(e) => {
                  e?.stopPropagation();
                  onSelectItem({ type: "trigger", ruleId: rule.id });
                }}
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
                className="space-y-3"
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
                {rule.effects.map((effect, index) => {
                  const effectType = getEffectTypeById(effect.type);
                  const hasRandomChance =
                    effect.params.has_random_chance === "true";
                  const isDraggedEffect = draggedItem?.id === effect.id;
                  const shouldShift =
                    dropType === "effect" &&
                    dropIndex !== null &&
                    !isDraggedEffect;

                  let translateY = 0;
                  if (shouldShift) {
                    if (
                      draggedItem &&
                      index >= dropIndex &&
                      index < draggedItem.index
                    ) {
                      translateY = 60; // Shift down to make space
                    } else if (
                      draggedItem &&
                      index <= dropIndex &&
                      index > draggedItem.index
                    ) {
                      translateY = -60; // Shift up to make space
                    }
                  }

                  return (
                    <motion.div
                      key={effect.id}
                      variants={snapFadeUp}
                      initial="initial"
                      animate={{
                        opacity: isDraggedEffect ? 0 : 1,
                        y: translateY,
                      }}
                      transition={{
                        duration: 0.12,
                        delay: index * 0.02,
                        y: { duration: 0.2 },
                      }}
                      data-drop-zone="effect"
                    >
                      <BlockComponent
                        type="effect"
                        label={effectType?.label || "Unknown Effect"}
                        dynamicTitle={generateEffectTitle(effect)}
                        isSelected={isItemSelected("effect", effect.id)}
                        onClick={(e) => {
                          e?.stopPropagation();
                          onSelectItem({
                            type: "effect",
                            ruleId: rule.id,
                            itemId: effect.id,
                          });
                        }}
                        showTrash={true}
                        onDelete={() => onDeleteEffect(rule.id, effect.id)}
                        parameterCount={getParameterCount(effect.params)}
                        hasRandomChance={hasRandomChance}
                        isDraggable={true}
                        onDragStart={(e) =>
                          handleDragStart(e, "effect", effect.id, index)
                        }
                      />
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {/* Description positioned absolutely to not affect layout */}
        <AnimatePresence>
          {descriptionVisible && (
            <motion.div
              className="absolute top-full left-0 w-full mt-4 bg-black-dark border-2 border-black-lighter rounded-lg p-3 z-10"
              variants={descriptionSlideDown}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="text-white-darker text-xs tracking-wider uppercase">
                  Description
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDescriptionVisible(false);
                  }}
                  className="w-6 h-6 bg-black-darker rounded-lg flex items-center justify-center border-2 border-black-lighter hover:bg-black-light transition-colors cursor-pointer"
                  title="Hide Description"
                >
                  <ChevronUpIcon className="h-3 w-3 text-white-darker" />
                </button>
              </div>
              <div className="text-white-darker text-sm leading-relaxed">
                {generateDescription()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {showReopenButton && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowReopenButton(false);
                setTimeout(() => {
                  setDescriptionVisible(true);
                }, 50);
              }}
              className="w-8 h-8 bg-black-darker rounded-lg flex items-center justify-center border-2 border-black-lighter hover:bg-black-light transition-colors cursor-pointer"
              title="Show Description"
            >
              <ChevronDownIcon className="h-4 w-4 text-white-darker" />
            </button>
          </div>
        )}
      </motion.div>

      {/* Dragged item overlay */}
      {draggedItem && (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            left: dragPosition.x * canvasScale,
            top: dragPosition.y * canvasScale,
            transform: `translateZ(0) scale(${canvasScale})`,
            transformOrigin: "top left",
          }}
        >
          <div
            className="w-80"
            style={{
              filter: "drop-shadow(0 10px 20px rgba(0, 0, 0, 0.5))",
            }}
          >
            {draggedItem.type === "condition"
              ? (() => {
                  const condition = rule.conditionGroups
                    .flatMap((g) => g.conditions)
                    .find((c) => c.id === draggedItem.id);
                  const conditionType = getConditionTypeById(
                    condition?.type || ""
                  );
                  return (
                    <BlockComponent
                      type="condition"
                      label={conditionType?.label || "Unknown Condition"}
                      dynamicTitle={
                        condition
                          ? generateConditionTitle(condition)
                          : undefined
                      }
                      onClick={() => {}}
                      isDraggable={false}
                      parameterCount={
                        condition ? getParameterCount(condition.params) : 0
                      }
                      isNegated={condition?.negate}
                    />
                  );
                })()
              : (() => {
                  const effect = rule.effects.find(
                    (e) => e.id === draggedItem.id
                  );
                  const effectType = getEffectTypeById(effect?.type || "");
                  const hasRandomChance =
                    effect?.params.has_random_chance === "true";
                  return (
                    <BlockComponent
                      type="effect"
                      label={effectType?.label || "Unknown Effect"}
                      dynamicTitle={
                        effect ? generateEffectTitle(effect) : undefined
                      }
                      onClick={() => {}}
                      isDraggable={false}
                      parameterCount={
                        effect ? getParameterCount(effect.params) : 0
                      }
                      hasRandomChance={hasRandomChance}
                    />
                  );
                })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default RuleCard;
