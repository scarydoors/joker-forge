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
}

type SelectedItem = {
  type: "trigger" | "condition" | "effect";
  ruleId: string;
  itemId?: string;
  groupId?: string; // Added to track selected condition group
} | null;

const RuleBuilder: React.FC<RuleBuilderProps> = ({
  isOpen,
  onClose,
  onSave,
  existingRules = [],
  joker,
}) => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null);
  const modalRef = useRef<HTMLDivElement>(null);

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
      // Fixed: Allow adding conditions when an effect is selected
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
            // If a specific condition group is selected, add to that group
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

            // Otherwise, add to the first group or create a new group
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

      // Select the newly created condition with proper groupId
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

    // Select the new condition group
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

    // Clear selection if the deleted group was selected
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
        <div className="flex justify-between items-center p-4">
          <h2 className="text-lg text-white-light font-extralight tracking-widest">
            Rule Builder for {joker.name}
          </h2>
          <Button
            variant="primary"
            onClick={handleSaveAndClose}
            icon={<CheckCircleIcon className="h-5 w-5" />}
            className="text-sm"
          >
            Save & Close
          </Button>
        </div>

        <div className="flex-grow flex overflow-hidden">
          <LeftSidebar
            joker={joker}
            selectedRule={getSelectedRule()}
            onAddTrigger={addTrigger}
            onAddCondition={addCondition}
            onAddEffect={addEffect}
          />

          <div
            className="flex-grow relative overflow-y-auto custom-scrollbar border-t-2 border-black-light"
            style={{
              backgroundImage: `radial-gradient(circle, #26353B 1px, transparent 1px)`,
              backgroundSize: "20px 20px",
              backgroundColor: "#1E2B30",
            }}
          >
            {rules.length === 0 ? (
              <div className="flex items-center justify-center h-full">
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
            ) : (
              <div className="p-6">
                <div className="flex flex-wrap gap-6">
                  {rules.map((rule, index) => (
                    <RuleCard
                      key={rule.id}
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
                      isRuleSelected={selectedItem?.ruleId === rule.id}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <RightSidebar
            joker={joker}
            selectedRule={getSelectedRule()}
            selectedCondition={getSelectedCondition()}
            selectedEffect={getSelectedEffect()}
            onUpdateCondition={updateCondition}
            onUpdateEffect={updateEffect}
          />
        </div>
      </div>
    </div>
  );
};

export default RuleBuilder;
