import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  TransformWrapper,
  TransformComponent,
  ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragEndEvent,
  closestCenter,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import type { Rule, Condition, Effect, RandomGroup } from "./types";
import { JokerData } from "../JokerCard";
import RuleCard from "./RuleCard";
import FloatingDock from "./FloatingDock";
import BlockPalette from "./BlockPalette";
import JokerInfo from "./JokerInfo";
import Variables from "./Variables";
import Inspector from "./Inspector";
import Button from "../generic/Button";
import {
  CheckCircleIcon,
  ArrowsPointingInIcon,
} from "@heroicons/react/24/outline";
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
  type: "trigger" | "condition" | "effect" | "randomgroup";
  ruleId: string;
  itemId?: string;
  groupId?: string;
  randomGroupId?: string;
} | null;

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
  const [panState, setPanState] = useState({ x: 0, y: 0, scale: 1 });
  const [backgroundOffset, setBackgroundOffset] = useState({ x: 0, y: 0 });
  const [panels, setPanels] = useState<Record<string, PanelState>>({
    blockPalette: {
      id: "blockPalette",
      isVisible: true,
      position: { x: 20, y: 20 },
      size: { width: 320, height: 1200 },
    },
    jokerInfo: {
      id: "jokerInfo",
      isVisible: false,
      position: { x: 0, y: 0 },
      size: { width: 320, height: 200 },
    },
    variables: {
      id: "variables",
      isVisible: false,
      position: { x: 0, y: 0 },
      size: { width: 320, height: 300 },
    },
    inspector: {
      id: "inspector",
      isVisible: false,
      position: { x: 0, y: 0 },
      size: { width: 384, height: 600 },
    },
  });

  const modalRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef<ReactZoomPanPinchRef>(null);

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

  const handleRecenter = () => {
    if (transformRef.current) {
      transformRef.current.resetTransform();
      setPanState({ x: 0, y: 0, scale: 1 });
      setBackgroundOffset({ x: 0, y: 0 });
    }
  };

  const getCenterPosition = () => {
    const screenCenterX =
      (typeof window !== "undefined" ? window.innerWidth : 1200) / 2;
    const screenCenterY =
      (typeof window !== "undefined" ? window.innerHeight : 800) / 2;
    const transformCenterX = screenCenterX - panState.x;
    const transformCenterY = screenCenterY - panState.y;
    return {
      x: transformCenterX - 160,
      y: transformCenterY - 200,
    };
  };

  const togglePanel = useCallback((panelId: string) => {
    setPanels((prev) => {
      const panel = prev[panelId];
      const findPosition = (
        panels: Record<string, PanelState>,
        targetPanelId: string
      ): { x: number; y: number } => {
        const panelSize = panels[targetPanelId].size;
        const padding = 20;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight - 100;
        if (targetPanelId === "variables") {
          const blockPalettePanel = panels["blockPalette"];
          if (blockPalettePanel && blockPalettePanel.isVisible) {
            return {
              x:
                blockPalettePanel.position.x +
                blockPalettePanel.size.width +
                padding,
              y: blockPalettePanel.position.y,
            };
          } else {
            return {
              x: 360 + padding,
              y: 100,
            };
          }
        }

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

        for (const position of positions) {
          if (!hasOverlap(position, panelSize, targetPanelId)) {
            return position;
          }
        }

        return {
          x: Math.random() * 200 + padding,
          y: Math.random() * 200 + padding,
        };
      };

      const newState = {
        ...prev,
        [panelId]: {
          ...panel,
          isVisible: !panel.isVisible,
          position: panel.isVisible
            ? panel.position
            : findPosition(prev, panelId),
        },
      };
      return newState;
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      setRules(
        existingRules.map((rule) => ({
          ...rule,
          randomGroups: rule.randomGroups || [],
        }))
      );
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

      const handleKeyPress = (event: KeyboardEvent) => {
        if (
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement
        ) {
          return;
        }
        switch (event.key.toLowerCase()) {
          case "b":
            togglePanel("blockPalette");
            break;
          case "i":
            togglePanel("jokerInfo");
            break;
          case "v":
            togglePanel("variables");
            break;
          case "p":
            togglePanel("inspector");
            break;
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyPress);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleKeyPress);
      };
    }
  }, [isOpen, handleSaveAndClose, togglePanel]);

  useEffect(() => {
    if (selectedItem && !panels.inspector.isVisible) {
      togglePanel("inspector");
    }
  }, [selectedItem, panels.inspector.isVisible, togglePanel]);

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

  const updateRulePosition = (
    ruleId: string,
    position: { x: number; y: number }
  ) => {
    setRules((prev) =>
      prev.map((rule) => (rule.id === ruleId ? { ...rule, position } : rule))
    );
  };

  const addTrigger = (triggerId: string) => {
    const centerPos = getCenterPosition();
    const newRule: Rule = {
      id: crypto.randomUUID(),
      trigger: triggerId,
      conditionGroups: [],
      effects: [],
      randomGroups: [],
      position: centerPos,
    };
    setRules((prev) => [...prev, newRule]);
    setSelectedItem({ type: "trigger", ruleId: newRule.id });
  };

  const addCondition = useCallback(
    (conditionType: string) => {
      if (!selectedItem) return;
      const conditionTypeData = getConditionTypeById(conditionType);
      const defaultParams: Record<string, unknown> = {};
      if (conditionTypeData) {
        conditionTypeData.params.forEach((param) => {
          if (param.default !== undefined) {
            defaultParams[param.id] = param.default;
          }
        });
      }
      const newCondition: Condition = {
        id: crypto.randomUUID(),
        type: conditionType,
        negate: false,
        params: defaultParams,
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

  const addRandomGroup = (ruleId: string) => {
    const newGroup: RandomGroup = {
      id: crypto.randomUUID(),
      chance_numerator: 1,
      chance_denominator: 4,
      effects: [],
    };
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.id === ruleId) {
          return {
            ...rule,
            randomGroups: [...rule.randomGroups, newGroup],
          };
        }
        return rule;
      })
    );
    setSelectedItem({
      type: "randomgroup",
      ruleId: ruleId,
      randomGroupId: newGroup.id,
    });
  };

  const deleteRandomGroup = (ruleId: string, randomGroupId: string) => {
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.id === ruleId) {
          const groupToDelete = rule.randomGroups.find(
            (g) => g.id === randomGroupId
          );
          return {
            ...rule,
            randomGroups: rule.randomGroups.filter(
              (group) => group.id !== randomGroupId
            ),
            effects: groupToDelete
              ? [...rule.effects, ...groupToDelete.effects]
              : rule.effects,
          };
        }
        return rule;
      })
    );
    if (selectedItem && selectedItem.randomGroupId === randomGroupId) {
      setSelectedItem({ type: "trigger", ruleId });
    }
  };

  const updateRandomGroup = (
    ruleId: string,
    randomGroupId: string,
    updates: Partial<RandomGroup>
  ) => {
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.id === ruleId) {
          return {
            ...rule,
            randomGroups: rule.randomGroups.map((group) =>
              group.id === randomGroupId ? { ...group, ...updates } : group
            ),
          };
        }
        return rule;
      })
    );
  };

  const createRandomGroupFromEffect = (ruleId: string, effectId: string) => {
    const newGroup: RandomGroup = {
      id: crypto.randomUUID(),
      chance_numerator: 1,
      chance_denominator: 4,
      effects: [],
    };
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.id !== ruleId) return rule;
        let movedEffect: Effect | null = null;
        const updatedRule = { ...rule };

        updatedRule.effects = rule.effects.filter((effect) => {
          if (effect.id === effectId) {
            movedEffect = effect;
            return false;
          }
          return true;
        });

        updatedRule.randomGroups = rule.randomGroups.map((group) => ({
          ...group,
          effects: group.effects.filter((effect) => {
            if (effect.id === effectId) {
              movedEffect = effect;
              return false;
            }
            return true;
          }),
        }));

        if (movedEffect) {
          newGroup.effects = [movedEffect];
          updatedRule.randomGroups = [...updatedRule.randomGroups, newGroup];
        }

        return updatedRule;
      })
    );
    setSelectedItem({
      type: "randomgroup",
      ruleId: ruleId,
      randomGroupId: newGroup.id,
    });
  };

  const addEffect = (effectType: string) => {
    if (!selectedItem) return;

    const effectTypeData = getEffectTypeById(effectType);
    const defaultParams: Record<string, unknown> = {};
    if (effectTypeData) {
      effectTypeData.params.forEach((param) => {
        if (param.default !== undefined) {
          defaultParams[param.id] = param.default;
        }
      });
    }

    const newEffect: Effect = {
      id: crypto.randomUUID(),
      type: effectType,
      params: defaultParams,
    };

    setRules((prev) =>
      prev.map((rule) => {
        if (rule.id === selectedItem.ruleId) {
          if (selectedItem.randomGroupId) {
            return {
              ...rule,
              randomGroups: rule.randomGroups.map((group) =>
                group.id === selectedItem.randomGroupId
                  ? { ...group, effects: [...group.effects, newEffect] }
                  : group
              ),
            };
          } else {
            return {
              ...rule,
              effects: [...rule.effects, newEffect],
            };
          }
        }
        return rule;
      })
    );
    setSelectedItem({
      type: "effect",
      ruleId: selectedItem.ruleId,
      itemId: newEffect.id,
      randomGroupId: selectedItem.randomGroupId,
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
          const updatedRule = { ...rule };
          updatedRule.effects = rule.effects.map((effect) =>
            effect.id === effectId ? { ...effect, ...updates } : effect
          );
          updatedRule.randomGroups = rule.randomGroups.map((group) => ({
            ...group,
            effects: group.effects.map((effect) =>
              effect.id === effectId ? { ...effect, ...updates } : effect
            ),
          }));
          return updatedRule;
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
            randomGroups: rule.randomGroups.map((group) => ({
              ...group,
              effects: group.effects.filter((effect) => effect.id !== effectId),
            })),
          };
        }
        return rule;
      })
    );
    if (selectedItem && selectedItem.itemId === effectId) {
      setSelectedItem({ type: "trigger", ruleId });
    }
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

    const effectInMain = rule.effects.find((e) => e.id === selectedItem.itemId);
    if (effectInMain) return effectInMain;

    for (const group of rule.randomGroups) {
      const effectInGroup = group.effects.find(
        (e) => e.id === selectedItem.itemId
      );
      if (effectInGroup) return effectInGroup;
    }
    return null;
  };

  const getSelectedRandomGroup = () => {
    if (
      !selectedItem ||
      selectedItem.type !== "randomgroup" ||
      !selectedItem.randomGroupId
    )
      return null;
    const rule = getSelectedRule();
    if (!rule) return null;
    return (
      rule.randomGroups.find((g) => g.id === selectedItem.randomGroupId) || null
    );
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

  const updateConditionOperator = (
    ruleId: string,
    conditionId: string,
    operator: "and" | "or"
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
                  ? { ...condition, operator }
                  : condition
              ),
            })),
          };
        }
        return rule;
      })
    );
  };

  const getParameterCount = (params: Record<string, unknown>) => {
    return Object.keys(params).length;
  };

  const handleDragStart = () => {};

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event;
    const activeId = active.id as string;

    if (activeId.startsWith("panel-")) {
      const panelId = activeId.replace("panel-", "");
      const currentPanel = panels[panelId];
      if (delta && currentPanel) {
        const newPosition = {
          x: Math.max(0, currentPanel.position.x + delta.x),
          y: Math.max(0, currentPanel.position.y + delta.y),
        };
        updatePanelPosition(panelId, newPosition);
      }
      return;
    }

    if (!over || active.id === over.id) {
      return;
    }

    const overId = over.id as string;

    setRules((currentRules) => {
      let activeRule: Rule | undefined;
      let containerWithActive: (Condition[] | Effect[]) | undefined;
      let containerWithOver: (Condition[] | Effect[]) | undefined;

      for (const rule of currentRules) {
        for (const group of rule.conditionGroups) {
          if (group.conditions.some((c) => c.id === activeId)) {
            activeRule = rule;
            containerWithActive = group.conditions;
          }
          if (group.conditions.some((c) => c.id === overId)) {
            containerWithOver = group.conditions;
          }
        }

        if (rule.effects.some((e) => e.id === activeId)) {
          activeRule = rule;
          containerWithActive = rule.effects;
        }
        if (rule.effects.some((e) => e.id === overId)) {
          containerWithOver = rule.effects;
        }

        for (const group of rule.randomGroups) {
          if (group.effects.some((e) => e.id === activeId)) {
            activeRule = rule;
            containerWithActive = group.effects;
          }
          if (group.effects.some((e) => e.id === overId)) {
            containerWithOver = group.effects;
          }
        }

        if (activeRule) break;
      }

      if (
        !activeRule ||
        !containerWithActive ||
        !containerWithOver ||
        containerWithActive !== containerWithOver
      ) {
        return currentRules;
      }

      const oldIndex = containerWithActive.findIndex((i) => i.id === activeId);
      const newIndex = containerWithOver.findIndex((i) => i.id === overId);

      if (oldIndex === -1 || newIndex === -1) {
        return currentRules;
      }

      let reorderedItems: Condition[] | Effect[];
      // Determine if this is a Condition[] or Effect[] container
      if (
        activeRule.conditionGroups.some(
          (group) => group.conditions === containerWithActive
        )
      ) {
        reorderedItems = arrayMove(
          containerWithActive as Condition[],
          oldIndex,
          newIndex
        );
      } else {
        reorderedItems = arrayMove(
          containerWithActive as Effect[],
          oldIndex,
          newIndex
        );
      }

      return currentRules.map((rule) => {
        if (rule.id !== activeRule?.id) {
          return rule;
        }
        // If it's a condition group, update that group; if it's effects, update effects, etc.
        if (
          activeRule.conditionGroups.some(
            (group) => group.conditions === containerWithActive
          )
        ) {
          return {
            ...rule,
            conditionGroups: rule.conditionGroups.map((group) =>
              group.conditions === containerWithActive
                ? { ...group, conditions: reorderedItems as Condition[] }
                : group
            ),
          };
        } else if (rule.effects === containerWithActive) {
          return {
            ...rule,
            effects: reorderedItems as Effect[],
          };
        } else {
          return {
            ...rule,
            randomGroups: rule.randomGroups.map((group) =>
              group.effects === containerWithActive
                ? { ...group, effects: reorderedItems as Effect[] }
                : group
            ),
          };
        }
      });
    });
  };

  const createAlternatingDotPattern = () => {
    const dotSize = 3;
    return `
      radial-gradient(circle at 0px 0px, #26353B ${dotSize}px, transparent ${dotSize}px),
      radial-gradient(circle at 0px 0px, #26353B ${dotSize}px, transparent ${dotSize}px)
    `;
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex bg-black-darker items-center justify-center z-[60] font-lexend">
      <div
        ref={modalRef}
        className="bg-black-dark rounded-lg w-full h-full overflow-hidden border-2 border-black-light flex flex-col"
      >
        <div className="flex px-4 py-2 border-b-2 border-black-light z-50">
          <h2 className="text-xs text-white-light font-extralight tracking-widest mx-auto">
            Rule Builder for {joker.name}
          </h2>
        </div>
        <div className="flex-grow relative overflow-hidden">
          <div
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{
              backgroundImage: createAlternatingDotPattern(),
              backgroundSize: "40px 40px, 40px 40px",
              backgroundPosition: `${backgroundOffset.x % 40}px ${
                backgroundOffset.y % 40
              }px, ${(backgroundOffset.x + 20) % 40}px ${
                (backgroundOffset.y + 20) % 40
              }px`,
              backgroundColor: "#1E2B30",
            }}
          />
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-black-dark/90 backdrop-blur-md border border-black-lighter rounded-lg px-3 py-1 flex items-center gap-3">
            <div className="text-white-darker text-xs">
              Pan: {Math.round(panState.x)}, {Math.round(panState.y)}
            </div>
            <button
              onClick={handleRecenter}
              className="p-1 text-white-darker hover:text-white transition-colors cursor-pointer"
              title="Recenter View"
            >
              <ArrowsPointingInIcon className="h-4 w-4" />
            </button>
            <div className="w-px h-4 bg-black-lighter" />
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveAndClose}
              icon={<CheckCircleIcon className="h-4 w-4" />}
              className="text-xs cursor-pointer"
            >
              Save & Close
            </Button>
          </div>
          {rules.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center z-40">
              <div className="text-center bg-black-dark/80 backdrop-blur-sm rounded-lg p-8 border-2 border-black-lighter">
                <div className="text-white-darker text-lg mb-3">
                  No Rules Created
                </div>
                <p className="text-white-darker text-sm max-w-md">
                  Select a trigger from the Block Palette to create your first
                  rule.
                </p>
              </div>
            </div>
          )}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <TransformWrapper
              ref={transformRef}
              initialScale={1}
              initialPositionX={0}
              initialPositionY={0}
              minScale={1}
              maxScale={1}
              centerOnInit={false}
              limitToBounds={false}
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
              onTransformed={(_, state) => {
                setPanState({
                  x: state.positionX,
                  y: state.positionY,
                  scale: state.scale,
                });
                setBackgroundOffset({
                  x: state.positionX,
                  y: state.positionY,
                });
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
                <div className="relative z-10">
                  <div className="p-6 min-h-screen">
                    <div className="relative">
                      {rules.map((rule, index) => (
                        <div
                          key={rule.id}
                          className="absolute"
                          style={{
                            left: rule.position?.x || 0,
                            top: rule.position?.y || 0,
                            zIndex:
                              selectedItem?.ruleId === rule.id
                                ? 50 + index
                                : 20 + index,
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
                            onAddRandomGroup={addRandomGroup}
                            onDeleteRandomGroup={deleteRandomGroup}
                            onToggleGroupOperator={toggleGroupOperator}
                            onUpdatePosition={updateRulePosition}
                            isRuleSelected={selectedItem?.ruleId === rule.id}
                            joker={joker}
                            generateConditionTitle={generateConditionTitle}
                            generateEffectTitle={generateEffectTitle}
                            getParameterCount={getParameterCount}
                            onUpdateConditionOperator={updateConditionOperator}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TransformComponent>
            </TransformWrapper>

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
                selectedRandomGroup={getSelectedRandomGroup()}
                onUpdateCondition={updateCondition}
                onUpdateEffect={updateEffect}
                onUpdateRandomGroup={updateRandomGroup}
                onUpdateJoker={onUpdateJoker}
                onClose={() => togglePanel("inspector")}
                onPositionChange={(position) =>
                  updatePanelPosition("inspector", position)
                }
                onToggleVariablesPanel={() => togglePanel("variables")}
                onCreateRandomGroupFromEffect={createRandomGroupFromEffect}
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
