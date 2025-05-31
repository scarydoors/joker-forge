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
} | null;

const RuleBuilder: React.FC<RuleBuilderProps> = ({
  isOpen,
  onClose,
  onSave,
  existingRules = [],
  joker,
}) => {
  const [rules, setRules] = useState<Rule[]>(existingRules);
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
  }, [isOpen, existingRules, handleSaveAndClose]);

  const addTrigger = (triggerId: string) => {
    const newRule: Rule = {
      id: crypto.randomUUID(),
      trigger: triggerId,
      conditionGroups: [],
      effects: [],
    };
    const updatedRules = [...rules, newRule];
    setRules(updatedRules);
    setSelectedItem({ type: "trigger", ruleId: newRule.id });
  };

  const addCondition = (conditionType: string) => {
    if (!selectedItem || selectedItem.type === "effect") return;

    const newCondition: Condition = {
      id: crypto.randomUUID(),
      type: conditionType,
      negate: false,
      params: {},
    };

    const updatedRules = rules.map((rule) => {
      if (rule.id === selectedItem.ruleId) {
        if (rule.conditionGroups.length === 0) {
          rule.conditionGroups = [
            {
              id: crypto.randomUUID(),
              operator: "and",
              conditions: [newCondition],
            },
          ];
        } else {
          rule.conditionGroups[0].conditions.push(newCondition);
        }
      }
      return rule;
    });

    setRules(updatedRules);
    setSelectedItem({
      type: "condition",
      ruleId: selectedItem.ruleId,
      itemId: newCondition.id,
    });
  };

  const addEffect = (effectType: string) => {
    if (!selectedItem) return;

    const newEffect: Effect = {
      id: crypto.randomUUID(),
      type: effectType,
      params: {},
    };

    const updatedRules = rules.map((rule) => {
      if (rule.id === selectedItem.ruleId) {
        rule.effects.push(newEffect);
      }
      return rule;
    });

    setRules(updatedRules);
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
    const updatedRules = rules.map((rule) => {
      if (rule.id === ruleId) {
        rule.conditionGroups = rule.conditionGroups.map((group) => ({
          ...group,
          conditions: group.conditions.map((condition) =>
            condition.id === conditionId
              ? { ...condition, ...updates }
              : condition
          ),
        }));
      }
      return rule;
    });
    setRules(updatedRules);
  };

  const updateEffect = (
    ruleId: string,
    effectId: string,
    updates: Partial<Effect>
  ) => {
    const updatedRules = rules.map((rule) => {
      if (rule.id === ruleId) {
        rule.effects = rule.effects.map((effect) =>
          effect.id === effectId ? { ...effect, ...updates } : effect
        );
      }
      return rule;
    });
    setRules(updatedRules);
  };

  const deleteRule = (ruleId: string) => {
    const updatedRules = rules.filter((rule) => rule.id !== ruleId);
    setRules(updatedRules);
    if (selectedItem && selectedItem.ruleId === ruleId) {
      setSelectedItem(null);
    }
  };

  const deleteCondition = (ruleId: string, conditionId: string) => {
    const updatedRules = rules.map((rule) => {
      if (rule.id === ruleId) {
        rule.conditionGroups = rule.conditionGroups
          .map((group) => ({
            ...group,
            conditions: group.conditions.filter(
              (condition) => condition.id !== conditionId
            ),
          }))
          .filter((group) => group.conditions.length > 0);
      }
      return rule;
    });
    setRules(updatedRules);
    if (selectedItem && selectedItem.itemId === conditionId) {
      setSelectedItem({ type: "trigger", ruleId });
    }
  };

  const deleteEffect = (ruleId: string, effectId: string) => {
    const updatedRules = rules.map((rule) => {
      if (rule.id === ruleId) {
        rule.effects = rule.effects.filter((effect) => effect.id !== effectId);
      }
      return rule;
    });
    setRules(updatedRules);
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
            className="flex-grow relative overflow-y-auto custom-scrollbar"
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {rules.map((rule, index) => (
                    <RuleCard
                      key={rule.id}
                      rule={rule}
                      ruleIndex={index}
                      selectedItem={selectedItem}
                      onSelectItem={setSelectedItem}
                      onDeleteRule={deleteRule}
                      onDeleteCondition={deleteCondition}
                      onDeleteEffect={deleteEffect}
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
