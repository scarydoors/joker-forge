import React, { useState, useEffect } from "react";
import { TRIGGERS, getTriggerById } from "./Triggers";
import { getConditionTypeById, getConditionsForTrigger } from "./Conditions";
import { EFFECT_TYPES, getEffectTypeById } from "./Effects";
import { LOGICAL_OPERATORS } from "./types";
import type {
  Rule,
  ConditionGroup,
  Condition,
  Effect,
  ConditionParameter,
  EffectParameter,
  ShowWhenCondition,
} from "./types";

interface RuleBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rules: Rule[]) => void;
  existingRules: Rule[];
}

interface ParameterFieldProps {
  param: ConditionParameter | EffectParameter;
  value: unknown;
  onChange: (value: unknown) => void;
  showCondition?: boolean;
  parentValues?: Record<string, unknown>;
}

// Helper function to check if a parameter has showWhen property
function hasShowWhen(param: ConditionParameter | EffectParameter): param is (
  | ConditionParameter
  | EffectParameter
) & {
  showWhen: ShowWhenCondition;
} {
  return "showWhen" in param && param.showWhen !== undefined;
}

// Parameter Field Component for rendering different parameter types
const ParameterField: React.FC<ParameterFieldProps> = ({
  param,
  value,
  onChange,
  showCondition = true,
  parentValues = {},
}) => {
  // Check if this parameter should be shown based on the showWhen condition
  if (hasShowWhen(param) && showCondition) {
    const { parameter, values } = param.showWhen;
    const parentValue = parentValues[parameter];
    if (!values.includes(parentValue as string)) {
      return null;
    }
  }

  switch (param.type) {
    case "select":
      return (
        <div className="flex flex-col mb-2">
          <label className="text-white text-sm mb-1">
            {String(param.label)}:
          </label>
          <select
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            className="bg-balatro-black text-white px-2 py-1 pixel-corners-small"
          >
            {param.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );

    case "number":
      return (
        <div className="flex flex-col mb-2">
          <label className="text-white text-sm mb-1">{param.label}:</label>
          <input
            type="number"
            value={
              typeof value === "number"
                ? value
                : typeof param.default === "number"
                ? param.default
                : 0
            }
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              onChange(isNaN(val) ? 0 : val);
            }}
            min={param.min}
            max={param.max}
            step={
              param.id === "value" &&
              typeof value === "number" &&
              value > 0 &&
              value < 1
                ? 0.1
                : 1
            }
            className="bg-balatro-black text-white px-2 py-1 pixel-corners-small w-20"
          />
        </div>
      );

    case "range":
      return (
        <div className="flex flex-col mb-2">
          <label className="text-white text-sm mb-1">{param.label}:</label>
          <div className="flex items-center">
            <input
              type="range"
              value={
                typeof value === "number"
                  ? value
                  : typeof param.default === "number"
                  ? param.default
                  : 0
              }
              onChange={(e) => onChange(parseInt(e.target.value))}
              min={param.min || 0}
              max={param.max || 100}
              className="w-full mr-2"
            />
            <span className="text-white">{String(value)}</span>
          </div>
        </div>
      );

    case "text":
      return (
        <div className="flex flex-col mb-2">
          <label className="text-white text-sm mb-1">{param.label}:</label>
          <input
            type="text"
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            className="bg-balatro-black text-white px-2 py-1 pixel-corners-small"
          />
        </div>
      );

    default:
      return null;
  }
};

// Condition Editor Component
const ConditionEditor: React.FC<{
  condition: Condition;
  onUpdate: (updates: Partial<Condition>) => void;
  onDelete: () => void;
  onToggleNegate: () => void;
  currentTrigger: string;
}> = ({ condition, onUpdate, onDelete, onToggleNegate, currentTrigger }) => {
  const conditionType = getConditionTypeById(condition.type);

  // Get only applicable conditions for the current trigger
  const availableConditions = getConditionsForTrigger(currentTrigger);

  if (!conditionType) return null;

  return (
    <div className="bg-balatro-black p-2 pixel-corners-small flex flex-wrap items-center gap-2 mb-2">
      <div className="flex items-center space-x-2">
        <button
          className={`px-2 py-1 text-xs pixel-corners-small ${
            condition.negate
              ? "bg-balatro-red text-white"
              : "bg-balatro-grey text-white"
          }`}
          onClick={onToggleNegate}
        >
          {condition.negate ? "NOT" : "IS"}
        </button>

        <select
          value={condition.type}
          onChange={(e) => {
            onUpdate({ type: e.target.value });
          }}
          className="bg-balatro-grey text-white px-2 py-1 pixel-corners-small"
        >
          {availableConditions.map((type) => (
            <option key={type.id} value={type.id}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {conditionType.params.map((param) => (
          <ParameterField
            key={param.id}
            param={param}
            value={condition.params[param.id]}
            onChange={(value) => {
              const newParams = { ...condition.params, [param.id]: value };
              onUpdate({ params: newParams });
            }}
            parentValues={condition.params}
          />
        ))}
      </div>

      <button className="text-balatro-red ml-auto" onClick={onDelete}>
        ×
      </button>
    </div>
  );
};

// Condition Group Editor Component
const ConditionGroupEditor: React.FC<{
  group: ConditionGroup;
  groupIndex: number;
  onUpdateGroupOperator: (operator: string) => void;
  onAddCondition: () => void;
  onUpdateCondition: (
    conditionIndex: number,
    updates: Partial<Condition>
  ) => void;
  onDeleteCondition: (conditionIndex: number) => void;
  onDeleteGroup: () => void;
  isFirst: boolean;
  currentTrigger: string;
}> = ({
  group,
  groupIndex,
  onUpdateGroupOperator,
  onAddCondition,
  onUpdateCondition,
  onDeleteCondition,
  onDeleteGroup,
  isFirst,
  currentTrigger,
}) => {
  return (
    <div className="bg-balatro-grey p-3 pixel-corners-small mb-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <span className="text-white font-bold mr-2">
            Group {groupIndex + 1}
          </span>
          {!isFirst && (
            <select
              value={group.operator}
              onChange={(e) => onUpdateGroupOperator(e.target.value)}
              className="bg-balatro-black text-white px-2 py-1 pixel-corners-small"
            >
              {LOGICAL_OPERATORS.map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex space-x-2">
          <button
            className="bg-balatro-blue hover:bg-balatro-blueshadow text-white text-xs px-2 py-1 pixel-corners-small"
            onClick={onAddCondition}
          >
            + Add Condition
          </button>

          {!isFirst && (
            <button
              className="bg-balatro-red hover:bg-balatro-redshadow text-white text-xs px-2 py-1 pixel-corners-small"
              onClick={onDeleteGroup}
            >
              Delete Group
            </button>
          )}
        </div>
      </div>

      {group.conditions.length === 0 ? (
        <div className="italic text-balatro-black text-sm mb-2">
          No conditions in this group - add one to get started
        </div>
      ) : (
        <div className="space-y-2">
          {group.conditions.map((condition, condIndex) => (
            <ConditionEditor
              key={condition.id}
              condition={condition}
              onUpdate={(updates) => onUpdateCondition(condIndex, updates)}
              onDelete={() => onDeleteCondition(condIndex)}
              onToggleNegate={() => {
                onUpdateCondition(condIndex, { negate: !condition.negate });
              }}
              currentTrigger={currentTrigger}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Effect Editor Component
const EffectEditor: React.FC<{
  effect: Effect;
  onUpdate: (updates: Partial<Effect>) => void;
  onDelete: () => void;
}> = ({ effect, onUpdate, onDelete }) => {
  const effectType = getEffectTypeById(effect.type);

  if (!effectType) return null;

  return (
    <div className="bg-balatro-grey p-3 pixel-corners-small flex flex-wrap items-center gap-2 mb-2">
      <select
        value={effect.type}
        onChange={(e) => onUpdate({ type: e.target.value })}
        className="bg-balatro-black text-white px-2 py-1 mt-4 pixel-corners-small"
      >
        {EFFECT_TYPES.map((type) => (
          <option key={type.id} value={type.id}>
            {type.label}
          </option>
        ))}
      </select>

      {effectType.params.map((param) => (
        <ParameterField
          key={param.id}
          param={param}
          value={effect.params[param.id]}
          onChange={(value) => {
            const newParams = { ...effect.params, [param.id]: value };
            onUpdate({ params: newParams });
          }}
          parentValues={effect.params}
        />
      ))}

      <button className="text-balatro-red ml-auto" onClick={onDelete}>
        ×
      </button>
    </div>
  );
};

// Rule Editor Component
const RuleEditor: React.FC<{
  rule: Rule;
  onUpdateTrigger: (triggerId: string) => void;
  onAddConditionGroup: () => void;
  onUpdateConditionGroup: (
    groupIndex: number,
    updates: Partial<ConditionGroup>
  ) => void;
  onAddCondition: (groupIndex: number) => void;
  onUpdateCondition: (
    groupIndex: number,
    conditionIndex: number,
    updates: Partial<Condition>
  ) => void;
  onDeleteCondition: (groupIndex: number, conditionIndex: number) => void;
  onDeleteConditionGroup: (groupIndex: number) => void;
  onAddEffect: () => void;
  onUpdateEffect: (effectIndex: number, updates: Partial<Effect>) => void;
  onDeleteEffect: (effectIndex: number) => void;
}> = ({
  rule,
  onUpdateTrigger,
  onAddConditionGroup,
  onUpdateConditionGroup,
  onAddCondition,
  onUpdateCondition,
  onDeleteCondition,
  onDeleteConditionGroup,
  onAddEffect,
  onUpdateEffect,
  onDeleteEffect,
}) => {
  // Generate a dynamic description of the rule
  const generateRuleDescription = () => {
    const trigger = getTriggerById(rule.trigger);
    if (!trigger) return "Invalid rule";

    let description = `${trigger.label}`;

    // Add condition groups description
    if (rule.conditionGroups.length > 0) {
      description += ", if ";

      rule.conditionGroups.forEach((group, groupIndex) => {
        if (groupIndex > 0) {
          description += ` ${group.operator === "and" ? "AND" : "OR"} `;
        }

        if (group.conditions.length > 0) {
          if (group.conditions.length > 1 || rule.conditionGroups.length > 1) {
            description += "(";
          }

          group.conditions.forEach((condition, condIndex) => {
            const condType = getConditionTypeById(condition.type);
            if (condIndex > 0) {
              description += " AND ";
            }
            if (condition.negate) {
              description += "NOT ";
            }
            description += condType?.label || condition.type;
          });

          if (group.conditions.length > 1 || rule.conditionGroups.length > 1) {
            description += ")";
          }
        }
      });
    }

    // Add effects description
    if (rule.effects.length > 0) {
      description += ", then ";
      rule.effects.forEach((effect, index) => {
        const effectType = getEffectTypeById(effect.type);
        if (index > 0) {
          description += " + ";
        }
        description += effectType?.label || effect.type;
      });
    }

    return description;
  };

  return (
    <div>
      {/* Rule description */}
      <div className="bg-balatro-black p-3 pixel-corners-small mb-4">
        <h4 className="text-white font-bold mb-1">Rule Summary:</h4>
        <p className="text-balatro-lightgrey">{generateRuleDescription()}</p>
      </div>

      {/* Trigger selection */}
      <div className="mb-6">
        <label className="block text-white mb-2">Trigger (When)</label>
        <select
          value={rule.trigger}
          onChange={(e) => onUpdateTrigger(e.target.value)}
          className="w-full bg-balatro-grey text-white px-3 py-2 pixel-corners-small focus:outline-none"
        >
          {TRIGGERS.map((trigger) => (
            <option key={trigger.id} value={trigger.id}>
              {trigger.label}
            </option>
          ))}
        </select>
        <div className="mt-1 text-sm text-balatro-lightgrey">
          {getTriggerById(rule.trigger)?.description}
        </div>
      </div>

      {/* Condition Groups */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="text-white">Conditions (If)</label>
          <button
            className="bg-balatro-blue hover:bg-balatro-blueshadow text-white text-sm px-2 py-1 pixel-corners-small"
            onClick={onAddConditionGroup}
          >
            + Add Condition Group
          </button>
        </div>

        {rule.conditionGroups.length === 0 ? (
          <div className="italic text-balatro-lightgrey text-sm mb-2">
            No conditions - rule will trigger for all instances
          </div>
        ) : (
          <div className="space-y-4">
            {rule.conditionGroups.map((group, groupIndex) => (
              <ConditionGroupEditor
                key={group.id}
                group={group}
                groupIndex={groupIndex}
                onUpdateGroupOperator={(operator) => {
                  onUpdateConditionGroup(groupIndex, { operator });
                }}
                onAddCondition={() => onAddCondition(groupIndex)}
                onUpdateCondition={(conditionIndex, updates) => {
                  onUpdateCondition(groupIndex, conditionIndex, updates);
                }}
                onDeleteCondition={(conditionIndex) => {
                  onDeleteCondition(groupIndex, conditionIndex);
                }}
                onDeleteGroup={() => onDeleteConditionGroup(groupIndex)}
                isFirst={groupIndex === 0}
                currentTrigger={rule.trigger}
              />
            ))}
          </div>
        )}
      </div>

      {/* Effects */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-white">Effects (Then)</label>
          <button
            className="bg-balatro-green hover:bg-balatro-greenshadow text-white text-sm px-2 py-1 pixel-corners-small"
            onClick={onAddEffect}
          >
            + Add Effect
          </button>
        </div>

        {rule.effects.length === 0 ? (
          <div className="italic text-balatro-lightgrey text-sm">
            No effects added yet
          </div>
        ) : (
          <div className="space-y-3">
            {rule.effects.map((effect, effectIndex) => (
              <EffectEditor
                key={effect.id}
                effect={effect}
                onUpdate={(updates) => onUpdateEffect(effectIndex, updates)}
                onDelete={() => onDeleteEffect(effectIndex)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Main Rule Builder Component
const RuleBuilder: React.FC<RuleBuilderProps> = ({
  isOpen,
  onClose,
  onSave,
  existingRules = [],
}) => {
  const [rules, setRules] = useState<Rule[]>(existingRules);
  const [activeRuleIndex, setActiveRuleIndex] = useState<number | null>(
    existingRules.length > 0 ? 0 : null
  );

  // Reset state when opening with new rules
  useEffect(() => {
    if (isOpen) {
      setRules(existingRules);
      setActiveRuleIndex(existingRules.length > 0 ? 0 : null);
    }
  }, [isOpen, existingRules]);

  // Create a new rule
  const addRule = () => {
    const newRule: Rule = {
      id: crypto.randomUUID(),
      trigger: "hand_played",
      conditionGroups: [
        {
          id: crypto.randomUUID(),
          operator: "and",
          conditions: [
            {
              id: crypto.randomUUID(),
              type: "hand_type",
              negate: false,
              params: {
                operator: "equals",
                value: "Flush",
              },
            },
          ],
        },
      ],
      effects: [
        {
          id: crypto.randomUUID(),
          type: "add_chips",
          params: {
            value: 10,
          },
        },
      ],
    };
    setRules([...rules, newRule]);
    setActiveRuleIndex(rules.length);
  };

  // Delete a rule
  const deleteRule = (index: number) => {
    const newRules = [...rules];
    newRules.splice(index, 1);
    setRules(newRules);
    if (activeRuleIndex === index) {
      setActiveRuleIndex(newRules.length > 0 ? 0 : null);
    } else if (activeRuleIndex !== null && activeRuleIndex > index) {
      setActiveRuleIndex(activeRuleIndex - 1);
    }
  };

  // Update trigger
  const updateTrigger = (triggerId: string) => {
    if (activeRuleIndex === null) return;
    const newRules = [...rules];
    newRules[activeRuleIndex].trigger = triggerId;
    setRules(newRules);
  };

  // Add a condition group
  const addConditionGroup = () => {
    if (activeRuleIndex === null) return;
    const newRules = [...rules];
    newRules[activeRuleIndex].conditionGroups.push({
      id: crypto.randomUUID(),
      operator: "and",
      conditions: [],
    });
    setRules(newRules);
  };

  // Update condition group
  const updateConditionGroup = (
    groupIndex: number,
    updates: Partial<ConditionGroup>
  ) => {
    if (activeRuleIndex === null) return;
    const newRules = [...rules];
    newRules[activeRuleIndex].conditionGroups[groupIndex] = {
      ...newRules[activeRuleIndex].conditionGroups[groupIndex],
      ...updates,
    };
    setRules(newRules);
  };

  // Delete condition group
  const deleteConditionGroup = (groupIndex: number) => {
    if (activeRuleIndex === null) return;
    const newRules = [...rules];
    newRules[activeRuleIndex].conditionGroups.splice(groupIndex, 1);
    setRules(newRules);
  };

  // Add a condition to a group
  const addCondition = (groupIndex: number) => {
    if (activeRuleIndex === null) return;
    const newRules = [...rules];
    newRules[activeRuleIndex].conditionGroups[groupIndex].conditions.push({
      id: crypto.randomUUID(),
      type: "hand_type",
      negate: false,
      params: {
        operator: "equals",
        value: "Flush",
      },
    });
    setRules(newRules);
  };

  // Update a condition
  const updateCondition = (
    groupIndex: number,
    conditionIndex: number,
    updates: Partial<Condition>
  ) => {
    if (activeRuleIndex === null) return;
    const newRules = [...rules];
    const condition =
      newRules[activeRuleIndex].conditionGroups[groupIndex].conditions[
        conditionIndex
      ];

    // For type change, reset params to match the new type
    if (updates.type && updates.type !== condition.type) {
      const conditionType = getConditionTypeById(updates.type);
      if (conditionType) {
        const newParams: Record<string, unknown> = {};
        conditionType.params.forEach((param) => {
          if (param.default !== undefined) {
            newParams[param.id] = param.default;
          } else if (
            param.type === "select" &&
            param.options &&
            param.options.length > 0
          ) {
            newParams[param.id] = param.options[0].value;
          } else if (param.type === "number") {
            newParams[param.id] = 0;
          }
        });
        updates.params = newParams;
      }
    }

    // Update the condition
    newRules[activeRuleIndex].conditionGroups[groupIndex].conditions[
      conditionIndex
    ] = {
      ...condition,
      ...updates,
    };

    setRules(newRules);
  };

  // Delete a condition
  const deleteCondition = (groupIndex: number, conditionIndex: number) => {
    if (activeRuleIndex === null) return;
    const newRules = [...rules];
    newRules[activeRuleIndex].conditionGroups[groupIndex].conditions.splice(
      conditionIndex,
      1
    );
    setRules(newRules);
  };

  // Add an effect
  const addEffect = () => {
    if (activeRuleIndex === null) return;
    const newRules = [...rules];
    newRules[activeRuleIndex].effects.push({
      id: crypto.randomUUID(),
      type: "add_chips",
      params: {
        value: 10,
      },
    });
    setRules(newRules);
  };

  // Update an effect
  const updateEffect = (effectIndex: number, updates: Partial<Effect>) => {
    if (activeRuleIndex === null) return;
    const newRules = [...rules];
    const effect = newRules[activeRuleIndex].effects[effectIndex];

    // For type change, reset params to match the new type
    if (updates.type && updates.type !== effect.type) {
      const effectType = getEffectTypeById(updates.type);
      if (effectType) {
        const newParams: Record<string, unknown> = {};
        effectType.params.forEach((param) => {
          if (param.default !== undefined) {
            newParams[param.id] = param.default;
          } else if (param.type === "number") {
            newParams[param.id] = 0;
          }
        });
        updates.params = newParams;
      }
    }

    newRules[activeRuleIndex].effects[effectIndex] = {
      ...effect,
      ...updates,
    };

    setRules(newRules);
  };

  // Delete an effect
  const deleteEffect = (effectIndex: number) => {
    if (activeRuleIndex === null) return;
    const newRules = [...rules];
    newRules[activeRuleIndex].effects.splice(effectIndex, 1);
    setRules(newRules);
  };

  // Generate a human-readable description of the rule (for sidebar)
  const getRuleDisplayName = (rule: Rule) => {
    const trigger = getTriggerById(rule.trigger);
    if (!trigger) return "Unknown Rule";

    // Simple display - just show the trigger and first effect
    let displayName = trigger.label;

    if (rule.effects.length > 0) {
      const firstEffect = getEffectTypeById(rule.effects[0].type);
      if (firstEffect) {
        displayName += `: ${firstEffect.label}`;

        // Add a value if available
        if (rule.effects[0].params.value !== undefined) {
          const value = rule.effects[0].params.value;
          displayName += ` ${value}`;
        }
      }
    }

    return displayName;
  };

  // Save rules and close
  const handleSave = () => {
    onSave(rules);
    onClose();
  };

  // Only render if modal is open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-20 flex items-center justify-center z-50 font-game tracking-wider">
      <div className="bg-balatro-black pixel-corners-medium p-6 max-w-7xl w-full h-[90vh] overflow-hidden flex flex-col">
        <h2 className="text-2xl text-white text-shadow-pixel mb-4 tracking-widest">
          Rule Builder
        </h2>

        <div className="flex-grow flex gap-4 overflow-hidden">
          {/* Rules List Sidebar */}
          <div className="w-1/4 bg-balatro-transparentblack pixel-corners-small p-4 overflow-y-auto custom-scrollbar">
            <h3 className="text-lg text-white text-shadow-pixel mb-2 tracking-widest">
              Rules
            </h3>

            <div className="space-y-2">
              {rules.map((rule, index) => (
                <div
                  key={rule.id}
                  className={`px-3 py-2 cursor-pointer pixel-corners-small ${
                    activeRuleIndex === index
                      ? "bg-balatro-blue"
                      : "bg-balatro-grey"
                  }`}
                  onClick={() => setActiveRuleIndex(index)}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-white text-shadow-pixel">
                      {getRuleDisplayName(rule)}
                    </span>
                    <button
                      className="text-balatro-red hover:text-balatro-redshadow"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteRule(index);
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="mt-4 w-full bg-balatro-green hover:bg-balatro-greenshadow text-white py-1 pixel-corners-small"
              onClick={addRule}
            >
              <span className="relative z-10 text-shadow-pixel">
                + Add Rule
              </span>
            </button>
          </div>

          {/* Rule Editor */}
          <div className="flex-grow bg-balatro-transparentblack pixel-corners-small p-4 overflow-y-auto custom-scrollbar">
            {activeRuleIndex !== null && rules[activeRuleIndex] ? (
              <RuleEditor
                rule={rules[activeRuleIndex]}
                onUpdateTrigger={updateTrigger}
                onAddConditionGroup={addConditionGroup}
                onUpdateConditionGroup={updateConditionGroup}
                onAddCondition={addCondition}
                onUpdateCondition={updateCondition}
                onDeleteCondition={deleteCondition}
                onDeleteConditionGroup={deleteConditionGroup}
                onAddEffect={addEffect}
                onUpdateEffect={updateEffect}
                onDeleteEffect={deleteEffect}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-balatro-lightgrey">
                  Select a rule to edit or create a new one
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex space-x-4">
          <button
            className="flex-1 bg-balatro-red hover:bg-balatro-redshadow text-white py-2 pixel-corners-small transition-colors"
            onClick={onClose}
          >
            <span className="relative z-10 text-shadow-pixel">Cancel</span>
          </button>
          <button
            className="flex-1 bg-balatro-green hover:bg-balatro-greenshadow text-white py-2 pixel-corners-small transition-colors relative"
            onClick={handleSave}
          >
            <span className="relative z-10 text-shadow-pixel">Save Rules</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RuleBuilder;
