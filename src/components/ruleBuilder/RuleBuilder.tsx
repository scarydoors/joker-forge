import React, { useState, useEffect, useRef } from "react";
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

// Import generic components
import Button from "../generic/Button";
import InputField from "../generic/InputField";
import InputDropdown from "../generic/InputDropdown";

// Import icons
import {
  PlusIcon,
  TrashIcon,
  BeakerIcon,
  BoltIcon,
  PlusCircleIcon,
  ArchiveBoxXMarkIcon,
  XCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

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
        <div className="flex-1 min-w-40">
          <InputDropdown
            label={String(param.label)}
            labelPosition="left"
            value={(value as string) || ""}
            onChange={(newValue) => onChange(newValue)}
            options={
              param.options?.map((option) => ({
                value: option.value,
                label: option.label,
              })) || []
            }
            className="bg-black-dark"
            size="sm"
          />
        </div>
      );

    case "number":
      return (
        <div className="flex-1 min-w-24">
          <InputField
            label={String(param.label)}
            type="number"
            value={
              typeof value === "number"
                ? value.toString()
                : typeof param.default === "number"
                ? param.default.toString()
                : "0"
            }
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              onChange(isNaN(val) ? 0 : val);
            }}
            min={param.min?.toString()}
            max={param.max?.toString()}
            step={
              param.id === "value" &&
              typeof value === "number" &&
              value > 0 &&
              value < 1
                ? "0.1"
                : "1"
            }
            className="text-sm py-1 px-2 h-8"
          />
        </div>
      );

    case "text":
      return (
        <div className="flex-1 min-w-32">
          <InputField
            label={String(param.label)}
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            className="text-sm py-1 px-2 h-8"
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
    <div className="bg-black-dark border-2 border-black-lighter p-3 rounded-lg mb-3">
      <div className="mb-2">
        <InputDropdown
          label="Type"
          labelPosition="left"
          value={condition.type}
          onChange={(newValue) => {
            onUpdate({ type: newValue });
          }}
          options={
            availableConditions.map((type) => ({
              value: type.id,
              label: type.label,
            })) || []
          }
          size="sm"
        />
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
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

      <div className="flex justify-between mt-3">
        <Button
          variant={condition.negate ? "danger" : "secondary"}
          size="sm"
          onClick={onToggleNegate}
          className="text-xs py-1 h-8"
        >
          {condition.negate ? "NOT" : "IS"}
        </Button>

        <Button
          variant="danger"
          size="sm"
          onClick={onDelete}
          icon={<TrashIcon className="h-4 w-4" />}
          className="text-xs py-1 h-8 w-8 flex items-center justify-center"
        />
      </div>
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
    <div className="bg-black border-2 border-black-lighter rounded-lg p-3 mb-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-white-light text-sm font-light tracking-wider">
            Group {groupIndex + 1}
          </h3>

          {!isFirst && (
            <InputDropdown
              value={group.operator}
              onChange={onUpdateGroupOperator}
              options={LOGICAL_OPERATORS.map((op) => ({
                value: op.value,
                label: op.label,
              }))}
              className="w-24"
              size="sm"
            />
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onAddCondition}
            icon={<PlusCircleIcon className="h-4 w-4" />}
            className="text-xs py-1"
          >
            Add
          </Button>

          {!isFirst && (
            <Button
              variant="danger"
              size="sm"
              onClick={onDeleteGroup}
              icon={<ArchiveBoxXMarkIcon className="h-4 w-4" />}
              className="text-xs py-1"
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {group.conditions.length === 0 ? (
        <div className="text-white-darker text-xs p-3 text-center border-2 border-dashed border-black-lighter rounded-lg">
          No conditions defined. Add a condition to get started.
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
    <div className="bg-black-dark border-2 border-black-lighter p-3 rounded-lg mb-3">
      <div className="mb-2">
        <InputDropdown
          label="Type"
          labelPosition="left"
          value={effect.type}
          onChange={(newValue) => onUpdate({ type: newValue })}
          options={EFFECT_TYPES.map((type) => ({
            value: type.id,
            label: type.label,
          }))}
          size="sm"
        />
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
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
      </div>

      <div className="flex justify-end mt-3">
        <Button
          variant="danger"
          size="sm"
          onClick={onDelete}
          icon={<TrashIcon className="h-4 w-4" />}
          className="text-xs py-1 h-8 w-8 flex items-center justify-center"
        />
      </div>
    </div>
  );
};

// Formats a parameter for display in a rule description
const formatParameterForDescription = (
  param: string,
  value: unknown
): string => {
  if (param === "operator") {
    // Format operator for display
    switch (value) {
      case "equals":
        return "=";
      case "not_equals":
        return "≠";
      case "greater_than":
        return ">";
      case "less_than":
        return "<";
      case "greater_equals":
        return "≥";
      case "less_equals":
        return "≤";
      default:
        return String(value);
    }
  }

  return String(value);
};

// Generates a detailed rule description
const generateDetailedRuleDescription = (rule: Rule): string => {
  const trigger = getTriggerById(rule.trigger);
  if (!trigger) return "Invalid rule";

  let description = `${trigger.label}`;

  // Add condition groups description
  if (rule.conditionGroups.length > 0) {
    description += ", If ";

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

          // Start building detailed condition description
          let conditionDesc = "";
          if (condition.negate) {
            conditionDesc += "NOT ";
          }

          // Add scope prefix for card-related conditions
          if (condition.params.card_scope) {
            const scope =
              condition.params.card_scope === "scoring" ? "Scoring " : "Any ";
            conditionDesc += scope;
          }

          conditionDesc += condType?.label || condition.type;

          // Add specific parameters for more detail
          if (condition.params) {
            const relevantParams = [
              "operator",
              "value",
              "specific_rank",
              "specific_suit",
            ];
            const displayParams = relevantParams.filter(
              (param) => condition.params[param] !== undefined
            );

            if (displayParams.length > 0) {
              conditionDesc += " ";
              displayParams.forEach((param, i) => {
                if (i > 0 && param !== "value") {
                  conditionDesc += " ";
                }

                // Format based on parameter type
                if (param === "operator") {
                  conditionDesc += formatParameterForDescription(
                    param,
                    condition.params[param]
                  );
                } else if (param === "value") {
                  // Only add the value if there's an operator before it
                  if (condition.params.operator) {
                    conditionDesc += ` ${condition.params[param]}`;
                  } else {
                    conditionDesc += `is ${condition.params[param]}`;
                  }
                } else {
                  conditionDesc += `${condition.params[param]}`;
                }
              });
            }
          }

          description += conditionDesc;
        });

        if (group.conditions.length > 1 || rule.conditionGroups.length > 1) {
          description += ")";
        }
      }
    });
  }

  // Add effects description
  if (rule.effects.length > 0) {
    description += ", Then ";
    rule.effects.forEach((effect, index) => {
      const effectType = getEffectTypeById(effect.type);
      if (index > 0) {
        description += " + ";
      }

      let effectDesc = effectType?.label || effect.type;

      // Add value for more detail
      if (effect.params.value !== undefined) {
        effectDesc += `: ${effect.params.value}`;
      }

      description += effectDesc;
    });
  }

  return description;
};

// Shortened version for sidebar
const generateShortRuleDescription = (rule: Rule): string => {
  const trigger = getTriggerById(rule.trigger);
  if (!trigger) return "Unknown Rule";

  // Keep full trigger text with "When"
  let displayName = trigger.label;

  if (
    rule.conditionGroups.length > 0 &&
    rule.conditionGroups[0].conditions.length > 0
  ) {
    const firstCondition = rule.conditionGroups[0].conditions[0];
    const condType = getConditionTypeById(firstCondition.type);

    if (condType) {
      let conditionText = "";

      // Add value details if available
      if (firstCondition.params.value !== undefined) {
        if (firstCondition.params.operator) {
          // Format operator
          const operator = formatParameterForDescription(
            "operator",
            firstCondition.params.operator
          );
          conditionText = ` (${operator} ${firstCondition.params.value})`;
        } else {
          conditionText = ` (${firstCondition.params.value})`;
        }
      }

      displayName += `: ${condType.label}${conditionText}`;
    }
  }

  if (rule.effects.length > 0) {
    const firstEffect = getEffectTypeById(rule.effects[0].type);
    if (firstEffect) {
      displayName += ` → ${firstEffect.label}`;

      // Add a value if available
      if (rule.effects[0].params.value !== undefined) {
        const value = rule.effects[0].params.value;
        displayName += ` ${value}`;
      }
    }
  }

  return displayName;
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
  return (
    <div>
      {/* Rule description */}
      <div className="bg-black-dark border-2 border-black-light rounded-lg p-3 mb-4">
        <h3 className="text-white-light text-sm font-light tracking-wider mb-2 flex items-center">
          <BoltIcon className="h-4 w-4 text-mint mr-2" />
          Rule Description
        </h3>
        <p className="text-white-darker text-sm font-light tracking-wide">
          {generateDetailedRuleDescription(rule)}
        </p>
      </div>

      {/* Trigger selection */}
      <div className="mb-4">
        <InputDropdown
          label="When (Trigger)"
          labelPosition="left"
          value={rule.trigger}
          onChange={onUpdateTrigger}
          options={TRIGGERS.map((trigger) => ({
            value: trigger.id,
            label: trigger.label,
          }))}
          icon={<BoltIcon className="h-5 w-5 text-mint" />}
          separator={true}
          size="sm"
        />
        <div className="mt-1 text-xs text-white-darker pl-4">
          {getTriggerById(rule.trigger)?.description}
        </div>
      </div>

      {/* Condition Groups */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <BeakerIcon className="h-4 w-4 text-mint" />
            <h3 className="text-white-light text-sm font-light tracking-wider">
              Conditions (If)
            </h3>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={onAddConditionGroup}
            icon={<PlusIcon className="h-3 w-3" />}
            className="text-xs py-1"
          >
            Add Group
          </Button>
        </div>

        {rule.conditionGroups.length === 0 ? (
          <div className="text-white-darker text-xs p-4 text-center border-2 border-dashed border-black-lighter rounded-lg">
            No conditions defined. This rule will trigger for all instances.
          </div>
        ) : (
          <div className="space-y-3">
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
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <BoltIcon className="h-4 w-4 text-mint" />
            <h3 className="text-white-light text-sm font-light tracking-wider">
              Effects (Then)
            </h3>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={onAddEffect}
            icon={<PlusIcon className="h-3 w-3" />}
            className="text-xs py-1"
          >
            Add Effect
          </Button>
        </div>

        {rule.effects.length === 0 ? (
          <div className="text-white-darker text-xs p-4 text-center border-2 border-dashed border-black-lighter rounded-lg">
            No effects added. Add an effect to make the rule do something.
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
  const [saveStatus, setSaveStatus] = useState("");

  // Auto-save timer
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset state when opening with new rules
  useEffect(() => {
    if (isOpen) {
      setRules(existingRules);
      setActiveRuleIndex(existingRules.length > 0 ? 0 : null);
      setSaveStatus("");
    }
  }, [isOpen, existingRules]);

  const autoSave = (updatedRules: Rule[]) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setSaveStatus("Saving...");
    saveTimeoutRef.current = setTimeout(() => {
      onSave(updatedRules);
      setSaveStatus("Changes saved");

      // Clear the message after a few seconds
      setTimeout(() => {
        setSaveStatus("");
      }, 3000);
    }, 1000);
  };

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
                card_scope: "scoring",
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
    const updatedRules = [...rules, newRule];
    setRules(updatedRules);
    setActiveRuleIndex(updatedRules.length - 1);
    autoSave(updatedRules);
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

    autoSave(newRules);
  };

  // Update trigger
  const updateTrigger = (triggerId: string) => {
    if (activeRuleIndex === null) return;
    const newRules = [...rules];
    newRules[activeRuleIndex].trigger = triggerId;
    setRules(newRules);
    autoSave(newRules);
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
    autoSave(newRules);
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
    autoSave(newRules);
  };

  // Delete condition group
  const deleteConditionGroup = (groupIndex: number) => {
    if (activeRuleIndex === null) return;
    const newRules = [...rules];
    newRules[activeRuleIndex].conditionGroups.splice(groupIndex, 1);
    setRules(newRules);
    autoSave(newRules);
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
        card_scope: "scoring",
        operator: "equals",
        value: "Flush",
      },
    });
    setRules(newRules);
    autoSave(newRules);
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
    autoSave(newRules);
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
    autoSave(newRules);
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
    autoSave(newRules);
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
    autoSave(newRules);
  };

  // Delete an effect
  const deleteEffect = (effectIndex: number) => {
    if (activeRuleIndex === null) return;
    const newRules = [...rules];
    newRules[activeRuleIndex].effects.splice(effectIndex, 1);
    setRules(newRules);
    autoSave(newRules);
  };

  // Only render if modal is open
  if (!isOpen) return null;

  const renderEmptyEditor = () => (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="text-white-darker text-lg mb-3">No rule selected</div>
      <p className="text-white-darker text-sm max-w-md">
        Select a rule from the sidebar or create a new rule to get started.
      </p>
      <Button
        variant="primary"
        onClick={addRule}
        icon={<PlusIcon className="h-4 w-4" />}
        className="mt-4 text-sm"
      >
        Create New Rule
      </Button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50 font-lexend">
      <div className="bg-black-darker rounded-lg p-4 w-[90vw] h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl text-white-light font-extralight tracking-widest">
            RULE BUILDER
          </h2>

          {saveStatus && (
            <div className="flex items-center text-sm text-mint">
              {saveStatus === "Changes saved" ? (
                <CheckCircleIcon className="h-4 w-4 mr-1" />
              ) : null}
              {saveStatus}
            </div>
          )}

          <button
            onClick={onClose}
            className="text-white-darker hover:text-white transition-colors"
          >
            <XCircleIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-grow flex gap-4 overflow-hidden">
          {/* Rules List Sidebar */}
          <div className="w-1/5 bg-black border-2 border-black-lighter rounded-lg p-3 overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white-light text-sm font-light tracking-wider">
                RULES
              </h3>
              <Button
                variant="primary"
                size="sm"
                onClick={addRule}
                icon={<PlusIcon className="h-3 w-3" />}
                className="text-xs py-1"
              >
                New
              </Button>
            </div>

            <div className="space-y-1">
              {rules.map((rule, index) => (
                <div
                  key={rule.id}
                  className={`p-2 cursor-pointer rounded-lg transition-colors ${
                    activeRuleIndex === index
                      ? "bg-black-dark border-2 border-mint"
                      : "bg-black-dark border-2 border-black-lighter hover:border-black-light"
                  }`}
                  onClick={() => setActiveRuleIndex(index)}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-white-light text-xs tracking-wide pr-2">
                      {generateShortRuleDescription(rule)}
                    </span>
                    <button
                      className="text-balatro-red hover:text-balatro-redshadow flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteRule(index);
                      }}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {rules.length === 0 && (
                <div className="text-white-darker text-xs p-3 text-center">
                  No rules defined.
                </div>
              )}
            </div>
          </div>

          {/* Rule Editor */}
          <div className="flex-grow bg-black border-2 border-black-lighter rounded-lg p-4 overflow-y-auto h-full">
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
              renderEmptyEditor()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RuleBuilder;
