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
  DragEndEvent,
  closestCenter,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import type { Rule, Condition, Effect } from "./types";
import { JokerData } from "../JokerCard";
import RuleCard from "./RuleCard";
import BlockComponent from "./BlockComponent";
import FloatingDock from "./FloatingDock";
import BlockPalette from "./BlockPalette";
import JokerInfo from "./JokerInfo";
import Variables from "./Variables";
import Inspector from "./Inspector";
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

interface PanelState {
  id: string;
  isVisible: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
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
  const [panels, setPanels] = useState<Record<string, PanelState>>({
    blockPalette: {
      id: "blockPalette",
      isVisible: true,
      position: { x: 20, y: 20 },
      size: { width: 320, height: 720 },
    },
    jokerInfo: {
      id: "jokerInfo",
      isVisible: true,
      position: { x: 20, y: 760 },
      size: { width: 320, height: 120 },
    },
    variables: {
      id: "variables",
      isVisible: false,
      position: { x: 0, y: 0 },
      size: { width: 320, height: 400 },
    },
    inspector: {
      id: "inspector",
      isVisible: false,
      position: { x: 0, y: 0 },
      size: { width: 384, height: 600 },
    },
  });
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

  useEffect(() => {
    if (selectedItem && !panels.inspector.isVisible) {
      togglePanel("inspector");
    }
  }, [selectedItem]);

  const findValidPosition = (panelId: string): { x: number; y: number } => {
    const panelSize = panels[panelId].size;
    const padding = 20;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight - 100;

    const positions = [
      { x: viewportWidth - panelSize.width - padding, y: padding },
      { x: padding, y: padding },
      {
        x: viewportWidth - panelSize.width - padding,
        y: viewportHeight - panelSize.height - padding,
      },
      { x: viewportWidth / 2 - panelSize.width / 2, y: padding },
      {
        x: viewportWidth / 2 - panelSize.width / 2,
        y: viewportHeight / 2 - panelSize.height / 2,
      },
    ];

    for (const position of positions) {
      if (!hasOverlap(position, panelSize, panelId)) {
        return position;
      }
    }

    return {
      x: Math.random() * 200 + padding,
      y: Math.random() * 200 + padding,
    };
  };

  const hasOverlap = (
    position: { x: number; y: number },
    size: { width: number; height: number },
    excludePanelId: string
  ): boolean => {
    const rect1 = {
      left: position.x,
      top: position.y,
      right: position.x + size.width,
      bottom: position.y + size.height,
    };

    return Object.values(panels).some((panel) => {
      if (panel.id === excludePanelId || !panel.isVisible) return false;

      const rect2 = {
        left: panel.position.x,
        top: panel.position.y,
        right: panel.position.x + panel.size.width,
        bottom: panel.position.y + panel.size.height,
      };

      return !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
      );
    });
  };

  const togglePanel = (panelId: string) => {
    setPanels((prev) => {
      const panel = prev[panelId];
      const newState = {
        ...prev,
        [panelId]: {
          ...panel,
          isVisible: !panel.isVisible,
          position: panel.isVisible
            ? panel.position
            : findValidPosition(panelId),
        },
      };
      return newState;
    });
  };

  const updatePanelPosition = (
    panelId: string,
    position: { x: number; y: number }
  ) => {
    setPanels((prev) => ({
      ...prev,
      [panelId]: {
        ...prev[panelId],
        position,
      },
    }));
  };

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

    console.log("Drag started:", activeId); // Debug log

    if (activeId.startsWith("panel-")) {
      return;
    }

    for (const rule of rules) {
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const activeId = active.id as string;

    console.log("Drag ended:", activeId, delta); // Debug log

    if (activeId.startsWith("panel-")) {
      const panelId = activeId.replace("panel-", "");
      const currentPanel = panels[panelId];
      if (delta && currentPanel) {
        const newPosition = {
          x: Math.max(0, currentPanel.position.x + delta.x),
          y: Math.max(0, currentPanel.position.y + delta.y),
        };
        console.log("Updating panel position:", panelId, newPosition); // Debug log
        updatePanelPosition(panelId, newPosition);
      }
      return;
    }

    setDraggedItem(null);
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

        <div className="flex-grow relative overflow-hidden">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
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
                          Select a trigger from the Block Palette to create your
                          first rule.
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
                              isRuleSelected={selectedItem?.ruleId === rule.id}
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
                          <div>
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

            {panels.blockPalette.isVisible && (
              <BlockPalette
                position={panels.blockPalette.position}
                selectedRule={getSelectedRule()}
                rulesCount={rules.length}
                onAddTrigger={addTrigger}
                onAddCondition={addCondition}
                onAddEffect={addEffect}
                onClose={() => togglePanel("blockPalette")}
                onPositionChange={(position) =>
                  updatePanelPosition("blockPalette", position)
                }
              />
            )}

            {panels.jokerInfo.isVisible && (
              <JokerInfo
                position={panels.jokerInfo.position}
                joker={joker}
                rulesCount={rules.length}
                onClose={() => togglePanel("jokerInfo")}
                onPositionChange={(position) =>
                  updatePanelPosition("jokerInfo", position)
                }
              />
            )}

            {panels.variables.isVisible && (
              <Variables
                position={panels.variables.position}
                joker={joker}
                onUpdateJoker={onUpdateJoker}
                onClose={() => togglePanel("variables")}
                onPositionChange={(position) =>
                  updatePanelPosition("variables", position)
                }
              />
            )}

            {panels.inspector.isVisible && (
              <Inspector
                position={panels.inspector.position}
                joker={joker}
                selectedRule={getSelectedRule()}
                selectedCondition={getSelectedCondition()}
                selectedEffect={getSelectedEffect()}
                onUpdateCondition={updateCondition}
                onUpdateEffect={updateEffect}
                onUpdateJoker={onUpdateJoker}
                onClose={() => togglePanel("inspector")}
                onPositionChange={(position) =>
                  updatePanelPosition("inspector", position)
                }
              />
            )}

            <FloatingDock panels={panels} onTogglePanel={togglePanel} />
          </DndContext>
        </div>
      </div>
    </div>
  );
};

export default RuleBuilder;
