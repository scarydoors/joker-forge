import React, { useState, useRef, useEffect, useCallback } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragStartEvent,
  closestCenter,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import type { Rule, Condition, Effect } from "./types";
import { JokerData } from "../JokerCard";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import RuleCard from "./RuleCard";
import BlockComponent from "./BlockComponent";
import Button from "../generic/Button";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { getConditionTypeById } from "./data/Conditions";
import { getEffectTypeById } from "./data/Effects";

interface RuleBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rules: Rule[]) => void;
  existingRules: Rule[];
  joker: JokerData;
  onUpdateJoker: (updates: Partial<JokerData>) => void;
}

type SelectedItem = {
  type: "trigger" | "condition" | "effect";
  ruleId: string;
  itemId?: string;
  groupId?: string;
} | null;

interface DraggedItem {
  id: string;
  type: "condition" | "effect";
  ruleId: string;
  groupId?: string;
  data: Condition | Effect;
}

const RuleBuilder: React.FC<RuleBuilderProps> = ({
  isOpen,
  onClose,
  onSave,
  existingRules = [],
  joker,
  onUpdateJoker,
}) => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null);
  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

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

  const handleSaveAndClose = useCallback(() => {
    onSave(rules);
    onClose();
  }, [onSave, onClose, rules]);

  useEffect(() => {
    if (isOpen) {
      setRules(existingRules);
      setSelectedItem(null);
    }
  }, [isOpen, existingRules]);

  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          modalRef.current &&
          !modalRef.current.contains(event.target as Node)
        ) {
          handleSaveAndClose();
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, handleSaveAndClose]);

  const addTrigger = (triggerId: string) => {
    const newRule: Rule = {
      id: crypto.randomUUID(),
      trigger: triggerId,
      conditionGroups: [],
      effects: [],
    };
    setRules((prev) => [...prev, newRule]);
    setSelectedItem({ type: "trigger", ruleId: newRule.id });
  };

  const addCondition = useCallback(
    (conditionType: string) => {
      if (!selectedItem) return;

      const newCondition: Condition = {
        id: crypto.randomUUID(),
        type: conditionType,
        negate: false,
        params: {},
      };

      let targetGroupId = selectedItem.groupId;

      setRules((prev) => {
        return prev.map((rule) => {
          if (rule.id === selectedItem.ruleId) {
            if (selectedItem.groupId && selectedItem.type === "condition") {
              return {
                ...rule,
                conditionGroups: rule.conditionGroups.map((group) =>
                  group.id === selectedItem.groupId
                    ? {
                        ...group,
                        conditions: [...group.conditions, newCondition],
                      }
                    : group
                ),
              };
            }

            if (rule.conditionGroups.length === 0) {
              const newGroupId = crypto.randomUUID();
              targetGroupId = newGroupId;
              return {
                ...rule,
                conditionGroups: [
                  {
                    id: newGroupId,
                    operator: "and",
                    conditions: [newCondition],
                  },
                ],
              };
            } else {
              targetGroupId = rule.conditionGroups[0].id;
              return {
                ...rule,
                conditionGroups: rule.conditionGroups.map((group, index) => {
                  if (index === 0) {
                    return {
                      ...group,
                      conditions: [...group.conditions, newCondition],
                    };
                  }
                  return group;
                }),
              };
            }
          }
          return rule;
        });
      });

      setSelectedItem({
        type: "condition",
        ruleId: selectedItem.ruleId,
        itemId: newCondition.id,
        groupId: targetGroupId,
      });
    },
    [selectedItem]
  );

  const addConditionGroup = (ruleId: string) => {
    const newGroup = {
      id: crypto.randomUUID(),
      operator: "and" as const,
      conditions: [],
    };

    setRules((prev) =>
      prev.map((rule) => {
        if (rule.id === ruleId) {
          return {
            ...rule,
            conditionGroups: [...rule.conditionGroups, newGroup],
          };
        }
        return rule;
      })
    );

    setSelectedItem({
      type: "condition",
      ruleId: ruleId,
      groupId: newGroup.id,
    });
  };

  const deleteConditionGroup = (ruleId: string, groupId: string) => {
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.id === ruleId) {
          return {
            ...rule,
            conditionGroups: rule.conditionGroups.filter(
              (group) => group.id !== groupId
            ),
          };
        }
        return rule;
      })
    );

    if (selectedItem && selectedItem.groupId === groupId) {
      setSelectedItem({ type: "trigger", ruleId });
    }
  };

  const toggleGroupOperator = (ruleId: string, groupId: string) => {
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.id === ruleId) {
          return {
            ...rule,
            conditionGroups: rule.conditionGroups.map((group) => {
              if (group.id === groupId) {
                return {
                  ...group,
                  operator: group.operator === "and" ? "or" : "and",
                };
              }
              return group;
            }),
          };
        }
        return rule;
      })
    );
  };

  const addEffect = (effectType: string) => {
    if (!selectedItem) return;

    const newEffect: Effect = {
      id: crypto.randomUUID(),
      type: effectType,
      params: {},
    };

    setRules((prev) =>
      prev.map((rule) => {
        if (rule.id === selectedItem.ruleId) {
          return {
            ...rule,
            effects: [...rule.effects, newEffect],
          };
        }
        return rule;
      })
    );

    setSelectedItem({
      type: "effect",
      ruleId: selectedItem.ruleId,
      itemId: newEffect.id,
    });
  };

  const updateCondition = (
    ruleId: string,
    conditionId: string,
    updates: Partial<Condition>
  ) => {
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.id === ruleId) {
          return {
            ...rule,
            conditionGroups: rule.conditionGroups.map((group) => ({
              ...group,
              conditions: group.conditions.map((condition) =>
                condition.id === conditionId
                  ? { ...condition, ...updates }
                  : condition
              ),
            })),
          };
        }
        return rule;
      })
    );
  };

  const updateEffect = (
    ruleId: string,
    effectId: string,
    updates: Partial<Effect>
  ) => {
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.id === ruleId) {
          return {
            ...rule,
            effects: rule.effects.map((effect) =>
              effect.id === effectId ? { ...effect, ...updates } : effect
            ),
          };
        }
        return rule;
      })
    );
  };

  const deleteRule = (ruleId: string) => {
    setRules((prev) => prev.filter((rule) => rule.id !== ruleId));
    if (selectedItem && selectedItem.ruleId === ruleId) {
      setSelectedItem(null);
    }
  };

  const deleteCondition = (ruleId: string, conditionId: string) => {
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.id === ruleId) {
          return {
            ...rule,
            conditionGroups: rule.conditionGroups
              .map((group) => ({
                ...group,
                conditions: group.conditions.filter(
                  (condition) => condition.id !== conditionId
                ),
              }))
              .filter((group) => group.conditions.length > 0),
          };
        }
        return rule;
      })
    );
    if (selectedItem && selectedItem.itemId === conditionId) {
      setSelectedItem({ type: "trigger", ruleId });
    }
  };

  const deleteEffect = (ruleId: string, effectId: string) => {
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.id === ruleId) {
          return {
            ...rule,
            effects: rule.effects.filter((effect) => effect.id !== effectId),
          };
        }
        return rule;
      })
    );
    if (selectedItem && selectedItem.itemId === effectId) {
      setSelectedItem({ type: "trigger", ruleId });
    }
  };

  const reorderConditions = (
    ruleId: string,
    groupId: string,
    oldIndex: number,
    newIndex: number
  ) => {
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.id === ruleId) {
          return {
            ...rule,
            conditionGroups: rule.conditionGroups.map((group) => {
              if (group.id === groupId) {
                return {
                  ...group,
                  conditions: arrayMove(group.conditions, oldIndex, newIndex),
                };
              }
              return group;
            }),
          };
        }
        return rule;
      })
    );
  };

  const reorderEffects = (
    ruleId: string,
    oldIndex: number,
    newIndex: number
  ) => {
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.id === ruleId) {
          return {
            ...rule,
            effects: arrayMove(rule.effects, oldIndex, newIndex),
          };
        }
        return rule;
      })
    );
  };

  const getSelectedRule = () => {
    if (!selectedItem) return null;
    return rules.find((rule) => rule.id === selectedItem.ruleId) || null;
  };

  const getSelectedCondition = () => {
    if (
      !selectedItem ||
      selectedItem.type !== "condition" ||
      !selectedItem.itemId
    )
      return null;
    const rule = getSelectedRule();
    if (!rule) return null;
    for (const group of rule.conditionGroups) {
      const condition = group.conditions.find(
        (c) => c.id === selectedItem.itemId
      );
      if (condition) return condition;
    }
    return null;
  };

  const getSelectedEffect = () => {
    if (!selectedItem || selectedItem.type !== "effect" || !selectedItem.itemId)
      return null;
    const rule = getSelectedRule();
    if (!rule) return null;
    return rule.effects.find((e) => e.id === selectedItem.itemId) || null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id as string;

    // Find which rule and item is being dragged for the overlay
    for (const rule of rules) {
      // Check conditions
      for (const group of rule.conditionGroups) {
        const condition = group.conditions.find((c) => c.id === activeId);
        if (condition) {
          setDraggedItem({
            id: condition.id,
            type: "condition",
            ruleId: rule.id,
            groupId: group.id,
            data: condition,
          });
          return;
        }
      }

      // Check effects
      const effect = rule.effects.find((e) => e.id === activeId);
      if (effect) {
        setDraggedItem({
          id: effect.id,
          type: "effect",
          ruleId: rule.id,
          data: effect,
        });
        return;
      }
    }
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

  const getParameterCount = (params: Record<string, unknown>) => {
    return Object.keys(params).length;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-balatro-blackshadow/80 flex items-center justify-center z-50 font-lexend">
      <div
        ref={modalRef}
        className="bg-black-darker rounded-lg w-full h-full overflow-hidden border-2 border-black-light flex flex-col"
      >
        <div className="flex justify-between items-center p-4 relative border-b-2 border-black-light z-50">
          <h2 className="text-sm text-white-light font-extralight tracking-widest">
            Rule Builder for {joker.name}
          </h2>
          <div className="flex items-center gap-4">
            <Button
              variant="primary"
              onClick={handleSaveAndClose}
              icon={<CheckCircleIcon className="h-5 w-5" />}
              className="text-xs"
            >
              Save & Close
            </Button>
          </div>
        </div>

        <div className="flex-grow flex overflow-hidden relative">
          <div className="relative z-40 h-full">
            <LeftSidebar
              joker={joker}
              selectedRule={getSelectedRule()}
              rulesCount={rules.length}
              onAddTrigger={addTrigger}
              onAddCondition={addCondition}
              onAddEffect={addEffect}
            />
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            modifiers={[restrictToVerticalAxis]}
          >
            <div className="flex-grow relative overflow-hidden">
              <TransformWrapper
                initialScale={1}
                initialPositionX={0}
                initialPositionY={0}
                minScale={1}
                maxScale={1}
                limitToBounds={false}
                centerOnInit={false}
                wheel={{
                  disabled: true,
                }}
                pinch={{
                  disabled: true,
                }}
                doubleClick={{
                  disabled: true,
                }}
                panning={{
                  velocityDisabled: true,
                }}
              >
                <TransformComponent
                  wrapperClass="w-full h-full"
                  contentClass="w-full h-full relative"
                  wrapperStyle={{
                    width: "100%",
                    height: "100%",
                    overflow: "hidden",
                  }}
                  contentStyle={{
                    width: "100%",
                    height: "100%",
                    minWidth: "100%",
                    minHeight: "100%",
                  }}
                >
                  <div
                    className="absolute inset-0 w-full h-full"
                    style={{
                      backgroundImage: `radial-gradient(circle, #26353B 1px, transparent 1px)`,
                      backgroundSize: `20px 20px`,
                      backgroundColor: "#1E2B30",
                      backgroundAttachment: "local",
                    }}
                  />

                  <div className="relative z-10">
                    {rules.length === 0 ? (
                      <div className="flex items-center justify-center h-screen">
                        <div className="text-center bg-black-dark/80 backdrop-blur-sm rounded-lg p-8 border-2 border-black-lighter">
                          <div className="text-white-darker text-lg mb-3">
                            No Rules Created
                          </div>
                          <p className="text-white-darker text-sm max-w-md">
                            Select a trigger from the Block Palette to create
                            your first rule.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 min-h-screen">
                        <div className="flex flex-wrap gap-6">
                          {rules.map((rule, index) => (
                            <div
                              key={rule.id}
                              className="relative flex-shrink-0"
                              style={{
                                zIndex:
                                  selectedItem?.ruleId === rule.id ? 30 : 20,
                              }}
                            >
                              <RuleCard
                                rule={rule}
                                ruleIndex={index}
                                selectedItem={selectedItem}
                                onSelectItem={setSelectedItem}
                                onDeleteRule={deleteRule}
                                onDeleteCondition={deleteCondition}
                                onDeleteConditionGroup={deleteConditionGroup}
                                onDeleteEffect={deleteEffect}
                                onAddConditionGroup={addConditionGroup}
                                onToggleGroupOperator={toggleGroupOperator}
                                onReorderConditions={reorderConditions}
                                onReorderEffects={reorderEffects}
                                isRuleSelected={
                                  selectedItem?.ruleId === rule.id
                                }
                                joker={joker}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TransformComponent>
              </TransformWrapper>
            </div>

            <DragOverlay>
              {draggedItem ? (
                <div>
                  {draggedItem.type === "condition"
                    ? (() => {
                        const condition = draggedItem.data as Condition;
                        const conditionType = getConditionTypeById(
                          condition.type
                        );
                        return (
                          <div className="w-72">
                            <BlockComponent
                              type="condition"
                              label={
                                conditionType?.label || "Unknown Condition"
                              }
                              dynamicTitle={generateConditionTitle(condition)}
                              onClick={() => {}}
                              isDraggable={false}
                              parameterCount={getParameterCount(
                                condition.params
                              )}
                              isNegated={condition.negate}
                              variant="condition"
                            />
                          </div>
                        );
                      })()
                    : (() => {
                        const effect = draggedItem.data as Effect;
                        const effectType = getEffectTypeById(effect.type);
                        const hasRandomChance =
                          effect.params.has_random_chance === "true";
                        return (
                          <div className="w-80">
                            <BlockComponent
                              type="effect"
                              label={effectType?.label || "Unknown Effect"}
                              dynamicTitle={generateEffectTitle(effect)}
                              onClick={() => {}}
                              isDraggable={false}
                              parameterCount={getParameterCount(effect.params)}
                              hasRandomChance={hasRandomChance}
                              variant="default"
                            />
                          </div>
                        );
                      })()}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          <div className="relative z-40 h-full">
            <RightSidebar
              joker={joker}
              selectedRule={getSelectedRule()}
              selectedCondition={getSelectedCondition()}
              selectedEffect={getSelectedEffect()}
              onUpdateCondition={updateCondition}
              onUpdateEffect={updateEffect}
              onUpdateJoker={onUpdateJoker}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RuleBuilder;
