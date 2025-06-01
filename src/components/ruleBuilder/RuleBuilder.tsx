import React, { useState, useRef, useEffect, useCallback } from "react";
import type { Rule, Condition, Effect } from "./types";
import { JokerData } from "../JokerCard";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import RuleCard from "./RuleCard";
import Button from "../generic/Button";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

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

interface CanvasTransform {
  x: number;
  y: number;
  scale: number;
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
  const [canvasTransform, setCanvasTransform] = useState<CanvasTransform>({
    x: 0,
    y: 0,
    scale: 1,
  });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  const modalRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const ZOOM_MIN = 0.5;
  const ZOOM_MAX = 2;
  const PAN_BOUNDS = React.useMemo(() => ({ x: 1000, y: 1000 }), []);

  const handleSaveAndClose = useCallback(() => {
    onSave(rules);
    onClose();
  }, [onSave, onClose, rules]);

  useEffect(() => {
    if (isOpen) {
      setRules(existingRules);
      setSelectedItem(null);
      setCanvasTransform({ x: 0, y: 0, scale: 1 });
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

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  };

  const handleCanvasMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isPanning) return;

      const deltaX = (e.clientX - lastPanPoint.x) / canvasTransform.scale;
      const deltaY = (e.clientY - lastPanPoint.y) / canvasTransform.scale;

      setCanvasTransform((prev) => ({
        ...prev,
        x: Math.max(
          -PAN_BOUNDS.x,
          Math.min(PAN_BOUNDS.x, prev.x + deltaX * prev.scale)
        ),
        y: Math.max(
          -PAN_BOUNDS.y,
          Math.min(PAN_BOUNDS.y, prev.y + deltaY * prev.scale)
        ),
      }));

      setLastPanPoint({ x: e.clientX, y: e.clientY });
    },
    [isPanning, lastPanPoint, PAN_BOUNDS, canvasTransform.scale]
  );

  const handleCanvasMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleCanvasWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(
      ZOOM_MIN,
      Math.min(ZOOM_MAX, canvasTransform.scale * zoomFactor)
    );

    if (newScale !== canvasTransform.scale) {
      setCanvasTransform((prev) => ({
        ...prev,
        scale: newScale,
      }));
    }
  };

  useEffect(() => {
    if (isPanning) {
      document.addEventListener("mousemove", handleCanvasMouseMove);
      document.addEventListener("mouseup", handleCanvasMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleCanvasMouseMove);
        document.removeEventListener("mouseup", handleCanvasMouseUp);
      };
    }
  }, [isPanning, handleCanvasMouseMove, handleCanvasMouseUp]);

  const resetCanvas = () => {
    setCanvasTransform({ x: 0, y: 0, scale: 1 });
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
    startIndex: number,
    endIndex: number
  ) => {
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.id === ruleId) {
          return {
            ...rule,
            conditionGroups: rule.conditionGroups.map((group) => {
              if (group.id === groupId) {
                const newConditions = [...group.conditions];
                const [removed] = newConditions.splice(startIndex, 1);
                newConditions.splice(endIndex, 0, removed);
                return {
                  ...group,
                  conditions: newConditions,
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
    startIndex: number,
    endIndex: number
  ) => {
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.id === ruleId) {
          const newEffects = [...rule.effects];
          const [removed] = newEffects.splice(startIndex, 1);
          newEffects.splice(endIndex, 0, removed);
          return {
            ...rule,
            effects: newEffects,
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-balatro-blackshadow/80 flex items-center justify-center z-50 font-lexend">
      <div
        ref={modalRef}
        className="bg-black-darker rounded-lg w-full h-full overflow-hidden border-2 border-black-light flex flex-col"
      >
        <div className="flex justify-between items-center p-4 relative z-50">
          <h2 className="text-lg text-white-light font-extralight tracking-widest">
            Rule Builder for {joker.name}
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={resetCanvas}
              className="text-sm px-3 py-1 bg-black-dark text-white-darker border border-black-lighter rounded hover:bg-black-light transition-colors"
            >
              Reset View
            </button>
            <div className="text-xs text-white-darker">
              Zoom: {Math.round(canvasTransform.scale * 100)}% | Pan:{" "}
              {Math.round(canvasTransform.x)}, {Math.round(canvasTransform.y)}
            </div>
            <Button
              variant="primary"
              onClick={handleSaveAndClose}
              icon={<CheckCircleIcon className="h-5 w-5" />}
              className="text-sm"
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

          <div
            ref={canvasRef}
            className="flex-grow relative overflow-hidden border-t-2 border-black-light"
            style={{
              backgroundImage: `radial-gradient(circle, #26353B 1px, transparent 1px)`,
              backgroundSize: "20px 20px",
              backgroundColor: "#1E2B30",
            }}
            onMouseDown={handleCanvasMouseDown}
            onWheel={handleCanvasWheel}
          >
            <div
              className="absolute inset-0 origin-top-left transition-transform duration-75"
              style={{
                transform: `translate(${canvasTransform.x}px, ${canvasTransform.y}px) scale(${canvasTransform.scale})`,
                pointerEvents: isPanning ? "none" : "auto",
              }}
            >
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
                        className="relative"
                        style={{
                          zIndex: selectedItem?.ruleId === rule.id ? 30 : 20,
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
                          canvasScale={canvasTransform.scale}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

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
