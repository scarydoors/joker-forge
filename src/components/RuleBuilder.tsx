import React, { useState, useEffect } from "react";
import {
  TRIGGERS,
  CONDITION_TYPES,
  EFFECT_TYPES,
  LOGICAL_OPERATORS,
  getTriggerById,
  getConditionTypeById,
  getEffectTypeById,
} from "./RuleBuilderTCO";

// Rule structure according to the design doc: Trigger -> Condition(s) -> Effect(s)
export interface Rule {
  id: string;
  trigger: string;
  conditionGroups: ConditionGroup[];
  effects: Effect[];
}

// A group of conditions with a logical operator
export interface ConditionGroup {
  id: string;
  operator: string; // "and" or "or"
  conditions: Condition[];
}

// A single condition with parameters
export interface Condition {
  id: string;
  type: string;
  negate: boolean; // For NOT logic
  params: Record<string, any>;
}

// An effect with parameters
export interface Effect {
  id: string;
  type: string;
  params: Record<string, any>;
}

interface RuleBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rules: Rule[]) => void;
  existingRules: Rule[];
}

const RuleBuilder: React.FC<RuleBuilderProps> = ({
  isOpen,
  onClose,
  onSave,
  existingRules,
}) => {
  const [rules, setRules] = useState<Rule[]>(existingRules || []);
  const [activeRuleIndex, setActiveRuleIndex] = useState<number | null>(
    existingRules && existingRules.length > 0 ? 0 : null
  );
  const [activeGroupIndex, setActiveGroupIndex] = useState<number>(0);

  // Create a new rule
  const addRule = () => {
    const newRule: Rule = {
      id: crypto.randomUUID(),
      trigger: "poker_hand_played",
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
    setActiveGroupIndex(0);
  };

  // Delete a rule
  const deleteRule = (index: number) => {
    const newRules = [...rules];
    newRules.splice(index, 1);
    setRules(newRules);
    if (activeRuleIndex === index) {
      setActiveRuleIndex(newRules.length > 0 ? 0 : null);
      setActiveGroupIndex(0);
    } else if (activeRuleIndex !== null && activeRuleIndex > index) {
      setActiveRuleIndex(activeRuleIndex - 1);
    }
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
    setActiveGroupIndex(newRules[activeRuleIndex].conditionGroups.length - 1);
  };

  // Update condition group operator
  const updateConditionGroupOperator = (
    groupIndex: number,
    operator: string
  ) => {
    if (activeRuleIndex === null) return;

    const newRules = [...rules];
    newRules[activeRuleIndex].conditionGroups[groupIndex].operator = operator;
    setRules(newRules);
  };

  // Delete condition group
  const deleteConditionGroup = (groupIndex: number) => {
    if (activeRuleIndex === null) return;

    const newRules = [...rules];
    newRules[activeRuleIndex].conditionGroups.splice(groupIndex, 1);
    setRules(newRules);
    if (groupIndex === activeGroupIndex) {
      setActiveGroupIndex(
        Math.max(0, newRules[activeRuleIndex].conditionGroups.length - 1)
      );
    } else if (groupIndex < activeGroupIndex) {
      setActiveGroupIndex(activeGroupIndex - 1);
    }
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
        const newParams: Record<string, any> = {};
        conditionType.params.forEach((param) => {
          if (
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

  // Update a condition parameter
  const updateConditionParam = (
    groupIndex: number,
    conditionIndex: number,
    paramId: string,
    value: any
  ) => {
    if (activeRuleIndex === null) return;

    const newRules = [...rules];
    const condition =
      newRules[activeRuleIndex].conditionGroups[groupIndex].conditions[
        conditionIndex
      ];

    newRules[activeRuleIndex].conditionGroups[groupIndex].conditions[
      conditionIndex
    ] = {
      ...condition,
      params: {
        ...condition.params,
        [paramId]: value,
      },
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

  // Toggle negation for a condition (NOT)
  const toggleNegation = (groupIndex: number, conditionIndex: number) => {
    if (activeRuleIndex === null) return;

    const newRules = [...rules];
    const condition =
      newRules[activeRuleIndex].conditionGroups[groupIndex].conditions[
        conditionIndex
      ];
    condition.negate = !condition.negate;
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
        const newParams: Record<string, any> = {};
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

  // Update an effect parameter
  const updateEffectParam = (
    effectIndex: number,
    paramId: string,
    value: any
  ) => {
    if (activeRuleIndex === null) return;

    const newRules = [...rules];
    const effect = newRules[activeRuleIndex].effects[effectIndex];

    newRules[activeRuleIndex].effects[effectIndex] = {
      ...effect,
      params: {
        ...effect.params,
        [paramId]: value,
      },
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

  // Update the trigger for a rule
  const updateTrigger = (triggerId: string) => {
    if (activeRuleIndex === null) return;

    const newRules = [...rules];
    newRules[activeRuleIndex].trigger = triggerId;
    setRules(newRules);
  };

  // Get a human-readable description of the rule
  const getRuleDisplayName = (rule: Rule) => {
    const trigger = getTriggerById(rule.trigger);
    if (!trigger) return "Unknown Rule";

    return trigger.label;
  };

  // Save rules and close
  const handleSave = () => {
    onSave(rules);
    onClose();
  };

  // Only render if modal is open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-balatro-black pixel-corners-medium p-6 max-w-5xl w-full h-[90vh] overflow-hidden flex flex-col">
        <h2 className="text-2xl text-white text-shadow-pixel mb-4">
          Rule Builder
        </h2>

        <div className="flex-grow flex gap-4 overflow-hidden">
          {/* Rules List Sidebar */}
          <div className="w-1/4 bg-balatro-transparentblack pixel-corners-small p-4 overflow-y-auto custom-scrollbar">
            <h3 className="text-lg text-white text-shadow-pixel mb-2">Rules</h3>

            <div className="space-y-2">
              {rules.map((rule, index) => (
                <div
                  key={rule.id}
                  className={`px-3 py-2 cursor-pointer pixel-corners-small ${
                    activeRuleIndex === index
                      ? "bg-balatro-blue"
                      : "bg-balatro-grey"
                  }`}
                  onClick={() => {
                    setActiveRuleIndex(index);
                    setActiveGroupIndex(0);
                  }}
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
              className="mt-4 w-full bg-balatro-green hover:bg-balatro-greenshadow text-white py-1 pixel-corners-small transition-colors relative"
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
              <div>
                <h3 className="text-lg text-white text-shadow-pixel mb-4">
                  Edit Rule
                </h3>

                {/* Trigger Selection */}
                <div className="mb-6">
                  <label className="block text-white mb-2">
                    Trigger (When)
                  </label>
                  <select
                    value={rules[activeRuleIndex].trigger}
                    onChange={(e) => updateTrigger(e.target.value)}
                    className="w-full bg-balatro-grey text-white px-3 py-2 pixel-corners-small focus:outline-none"
                  >
                    {TRIGGERS.map((trigger) => (
                      <option key={trigger.id} value={trigger.id}>
                        {trigger.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Condition Groups */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-white">Conditions (If)</label>
                    <button
                      className="bg-balatro-blue hover:bg-balatro-blueshadow text-white text-sm px-2 py-1 pixel-corners-small"
                      onClick={addConditionGroup}
                    >
                      + Add Condition Group
                    </button>
                  </div>

                  {rules[activeRuleIndex].conditionGroups.length === 0 ? (
                    <div className="italic text-balatro-lightgrey text-sm mb-2">
                      No conditions - rule will trigger for all instances
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {rules[activeRuleIndex].conditionGroups.map(
                        (group, groupIndex) => (
                          <div
                            key={group.id}
                            className={`bg-balatro-grey p-3 pixel-corners-small ${
                              groupIndex === activeGroupIndex
                                ? "border-2 border-balatro-blue"
                                : ""
                            }`}
                            onClick={() => setActiveGroupIndex(groupIndex)}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center">
                                <span className="text-white font-bold mr-2">
                                  Group {groupIndex + 1}
                                </span>
                                {groupIndex > 0 && (
                                  <select
                                    value={group.operator}
                                    onChange={(e) =>
                                      updateConditionGroupOperator(
                                        groupIndex,
                                        e.target.value
                                      )
                                    }
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addCondition(groupIndex);
                                  }}
                                >
                                  + Add Condition
                                </button>

                                {rules[activeRuleIndex].conditionGroups.length >
                                  1 && (
                                  <button
                                    className="bg-balatro-red hover:bg-balatro-redshadow text-white text-xs px-2 py-1 pixel-corners-small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteConditionGroup(groupIndex);
                                    }}
                                  >
                                    Delete Group
                                  </button>
                                )}
                              </div>
                            </div>

                            {group.conditions.length === 0 ? (
                              <div className="italic text-balatro-black text-sm mb-2">
                                No conditions in this group - add one to get
                                started
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {group.conditions.map(
                                  (condition, condIndex) => {
                                    const conditionType = getConditionTypeById(
                                      condition.type
                                    );
                                    return (
                                      <div
                                        key={condition.id}
                                        className="bg-balatro-black p-2 pixel-corners-small flex flex-wrap items-center gap-2"
                                      >
                                        <div className="flex items-center space-x-2">
                                          <button
                                            className={`px-2 py-1 text-xs pixel-corners-small ${
                                              condition.negate
                                                ? "bg-balatro-red text-white"
                                                : "bg-balatro-grey text-white"
                                            }`}
                                            onClick={() =>
                                              toggleNegation(
                                                groupIndex,
                                                condIndex
                                              )
                                            }
                                          >
                                            {condition.negate ? "NOT" : "IS"}
                                          </button>

                                          <select
                                            value={condition.type}
                                            onChange={(e) =>
                                              updateCondition(
                                                groupIndex,
                                                condIndex,
                                                { type: e.target.value }
                                              )
                                            }
                                            className="bg-balatro-grey text-white px-2 py-1 pixel-corners-small"
                                          >
                                            {CONDITION_TYPES.map((type) => (
                                              <option
                                                key={type.id}
                                                value={type.id}
                                              >
                                                {type.label}
                                              </option>
                                            ))}
                                          </select>
                                        </div>

                                        {conditionType &&
                                          conditionType.params.map((param) => (
                                            <div
                                              key={param.id}
                                              className="flex-grow"
                                            >
                                              {param.type === "select" && (
                                                <select
                                                  value={
                                                    condition.params[
                                                      param.id
                                                    ] || ""
                                                  }
                                                  onChange={(e) =>
                                                    updateConditionParam(
                                                      groupIndex,
                                                      condIndex,
                                                      param.id,
                                                      e.target.value
                                                    )
                                                  }
                                                  className="bg-balatro-grey text-white px-2 py-1 pixel-corners-small"
                                                >
                                                  {param.options.map(
                                                    (option) => (
                                                      <option
                                                        key={option.value}
                                                        value={option.value}
                                                      >
                                                        {option.label}
                                                      </option>
                                                    )
                                                  )}
                                                </select>
                                              )}

                                              {param.type === "number" && (
                                                <input
                                                  type="number"
                                                  value={
                                                    condition.params[
                                                      param.id
                                                    ] || 0
                                                  }
                                                  onChange={(e) => {
                                                    const value = parseInt(
                                                      e.target.value
                                                    );
                                                    updateConditionParam(
                                                      groupIndex,
                                                      condIndex,
                                                      param.id,
                                                      isNaN(value) ? 0 : value
                                                    );
                                                  }}
                                                  className="bg-balatro-grey text-white px-2 py-1 pixel-corners-small w-20"
                                                />
                                              )}
                                            </div>
                                          ))}

                                        <button
                                          className="text-balatro-red"
                                          onClick={() =>
                                            deleteCondition(
                                              groupIndex,
                                              condIndex
                                            )
                                          }
                                        >
                                          ×
                                        </button>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* Effects */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-white">Effects (Then)</label>
                    <button
                      className="bg-balatro-green hover:bg-balatro-greenshadow text-white text-sm px-2 py-1 pixel-corners-small"
                      onClick={addEffect}
                    >
                      + Add Effect
                    </button>
                  </div>

                  {rules[activeRuleIndex].effects.length === 0 ? (
                    <div className="italic text-balatro-lightgrey text-sm">
                      No effects added yet
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {rules[activeRuleIndex].effects.map(
                        (effect, effectIndex) => {
                          const effectType = getEffectTypeById(effect.type);
                          return (
                            <div
                              key={effect.id}
                              className="bg-balatro-grey p-3 pixel-corners-small flex flex-wrap items-center gap-2"
                            >
                              <select
                                value={effect.type}
                                onChange={(e) =>
                                  updateEffect(effectIndex, {
                                    type: e.target.value,
                                  })
                                }
                                className="bg-balatro-black text-white px-2 py-1 pixel-corners-small"
                              >
                                {EFFECT_TYPES.map((type) => (
                                  <option key={type.id} value={type.id}>
                                    {type.label}
                                  </option>
                                ))}
                              </select>

                              {effectType &&
                                effectType.params.map((param) => (
                                  <div
                                    key={param.id}
                                    className="flex items-center"
                                  >
                                    <label className="text-white text-sm mr-2">
                                      {param.label}:
                                    </label>
                                    <input
                                      type="number"
                                      value={effect.params[param.id] || 0}
                                      onChange={(e) => {
                                        const value = parseFloat(
                                          e.target.value
                                        );
                                        updateEffectParam(
                                          effectIndex,
                                          param.id,
                                          isNaN(value) ? 0 : value
                                        );
                                      }}
                                      className="bg-balatro-black text-white px-2 py-1 pixel-corners-small w-20"
                                      min="0"
                                      step={
                                        param.id === "value" &&
                                        effect.type === "apply_x_mult"
                                          ? "0.1"
                                          : "1"
                                      }
                                    />
                                  </div>
                                ))}

                              <button
                                className="text-balatro-red"
                                onClick={() => deleteEffect(effectIndex)}
                              >
                                ×
                              </button>
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>
              </div>
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
