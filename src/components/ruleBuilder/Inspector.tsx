import React from "react";
import { useDraggable } from "@dnd-kit/core";
import type {
  Rule,
  Condition,
  Effect,
  ConditionParameter,
  EffectParameter,
  ShowWhenCondition,
} from "./types";
import { JokerData } from "../JokerCard";
import { getAllVariables } from "../codeGeneration/VariableUtils";
import { getTriggerById } from "./data/Triggers";
import { getConditionTypeById } from "./data/Conditions";
import { getEffectTypeById } from "./data/Effects";
import InputField from "../generic/InputField";
import InputDropdown from "../generic/InputDropdown";
import Button from "../generic/Button";
import {
  EyeIcon,
  InformationCircleIcon,
  VariableIcon,
  XMarkIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import { ChartPieIcon, PercentBadgeIcon } from "@heroicons/react/16/solid";

interface InspectorProps {
  position: { x: number; y: number };
  joker: JokerData;
  selectedRule: Rule | null;
  selectedCondition: Condition | null;
  selectedEffect: Effect | null;
  onUpdateCondition: (
    ruleId: string,
    conditionId: string,
    updates: Partial<Condition>
  ) => void;
  onUpdateEffect: (
    ruleId: string,
    effectId: string,
    updates: Partial<Effect>
  ) => void;
  onUpdateJoker: (updates: Partial<JokerData>) => void;
  onClose: () => void;
  onPositionChange: (position: { x: number; y: number }) => void;
}

interface ParameterFieldProps {
  param: ConditionParameter | EffectParameter;
  value: unknown;
  onChange: (value: unknown) => void;
  parentValues?: Record<string, unknown>;
  availableVariables?: Array<{ value: string; label: string }>;
  onCreateVariable?: (name: string, initialValue: number) => void;
}

function hasShowWhen(param: ConditionParameter | EffectParameter): param is (
  | ConditionParameter
  | EffectParameter
) & {
  showWhen: ShowWhenCondition;
} {
  return "showWhen" in param && param.showWhen !== undefined;
}

const ParameterField: React.FC<ParameterFieldProps> = ({
  param,
  value,
  onChange,
  parentValues = {},
  availableVariables = [],
  onCreateVariable,
}) => {
  const [isVariableMode, setIsVariableMode] = React.useState(false);
  const [newVariableName, setNewVariableName] = React.useState("");

  if (hasShowWhen(param)) {
    const { parameter, values } = param.showWhen;
    const parentValue = parentValues[parameter];
    if (!values.includes(parentValue as string)) {
      return null;
    }
  }

  if (param.id === "variable_name" && availableVariables.length > 0) {
    return (
      <InputDropdown
        label={String(param.label)}
        labelPosition="center"
        value={(value as string) || ""}
        onChange={(newValue) => onChange(newValue)}
        options={availableVariables}
        className="bg-black-dark"
        size="sm"
      />
    );
  }

  switch (param.type) {
    case "select":
      return (
        <InputDropdown
          label={String(param.label)}
          labelPosition="center"
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
      );

    case "number": {
      const numericValue =
        typeof value === "number"
          ? value
          : typeof param.default === "number"
          ? param.default
          : 0;

      return (
        <>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-white-light text-sm">
              {String(param.label)}
            </span>
            <button
              onClick={() => setIsVariableMode(!isVariableMode)}
              className={`p-1 rounded transition-colors cursor-pointer ${
                isVariableMode
                  ? "bg-mint/20 text-mint"
                  : "bg-black-lighter text-white-darker hover:text-mint"
              }`}
              title="Toggle variable mode"
            >
              <VariableIcon className="h-4 w-4" />
            </button>
          </div>

          {isVariableMode ? (
            <div className="space-y-2">
              {availableVariables.length > 0 ? (
                <InputDropdown
                  value={(value as string) || ""}
                  onChange={(newValue) => onChange(newValue)}
                  options={availableVariables}
                  placeholder="Select variable"
                  className="bg-black-dark"
                  size="sm"
                />
              ) : (
                <div className="text-white-darker text-xs">
                  No variables available
                </div>
              )}

              <div className="border-t border-black-lighter pt-2">
                <div className="flex gap-2">
                  <InputField
                    value={newVariableName}
                    onChange={(e) => setNewVariableName(e.target.value)}
                    placeholder="Variable name"
                    size="sm"
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      if (newVariableName.trim() && onCreateVariable) {
                        onCreateVariable(newVariableName.trim(), numericValue);
                        onChange(newVariableName.trim());
                        setNewVariableName("");
                      }
                    }}
                    disabled={!newVariableName.trim()}
                    className="cursor-pointer"
                  >
                    Create
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <InputField
                type="number"
                value={numericValue.toString()}
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
                size="sm"
                labelPosition="center"
              />
            </>
          )}
        </>
      );
    }

    case "text":
      return (
        <InputField
          label={String(param.label)}
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          className="text-sm"
          size="sm"
        />
      );

    default:
      return null;
  }
};

const Inspector: React.FC<InspectorProps> = ({
  position,
  joker,
  selectedRule,
  selectedCondition,
  selectedEffect,
  onUpdateCondition,
  onUpdateEffect,
  onUpdateJoker,
  onClose,
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: "panel-inspector",
  });

  const style = transform
    ? {
        position: "absolute" as const,
        left: position.x + transform.x,
        top: position.y + transform.y,
      }
    : {
        position: "absolute" as const,
        left: position.x,
        top: position.y,
      };

  const availableVariables = getAllVariables(joker).map(
    (variable: { name: string }) => ({
      value: variable.name,
      label: variable.name,
    })
  );

  const handleCreateVariable = (name: string, initialValue: number) => {
    const newVariable = {
      id: crypto.randomUUID(),
      name,
      initialValue,
    };

    const updatedVariables = [...(joker.userVariables || []), newVariable];
    onUpdateJoker({ userVariables: updatedVariables });
  };

  const renderTriggerInfo = () => {
    if (!selectedRule) return null;
    const trigger = getTriggerById(selectedRule.trigger);
    if (!trigger) return null;

    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-trigger/20 to-transparent border border-trigger/30 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-trigger/20 rounded-lg flex items-center justify-center">
              <EyeIcon className="h-5 w-5 text-trigger" />
            </div>
            <div>
              <h4 className="text-trigger font-medium text-lg">
                {trigger.label}
              </h4>
              <span className="text-white-darker text-xs uppercase tracking-wider">
                Trigger Event
              </span>
            </div>
          </div>
          <p className="text-white-light text-sm leading-relaxed">
            {trigger.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-black-darker border border-black-lighter rounded-lg p-3">
            <div className="text-white-light text-sm font-medium mb-1">
              Conditions
            </div>
            <div className="text-mint text-2xl font-bold">
              {selectedRule.conditionGroups.reduce(
                (total, group) => total + group.conditions.length,
                0
              )}
            </div>
          </div>
          <div className="bg-black-darker border border-black-lighter rounded-lg p-3">
            <div className="text-white-light text-sm font-medium mb-1">
              Effects
            </div>
            <div className="text-mint text-2xl font-bold">
              {selectedRule.effects.length}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderConditionEditor = () => {
    if (!selectedCondition || !selectedRule) return null;
    const conditionType = getConditionTypeById(selectedCondition.type);
    if (!conditionType) return null;

    const paramsToRender = conditionType.params.filter((param) => {
      if (!hasShowWhen(param)) return true;
      const { parameter, values } = param.showWhen;
      const parentValue = selectedCondition.params[parameter];
      return values.includes(parentValue as string);
    });

    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-condition/20 to-transparent border border-condition/30 rounded-lg p-4 relative">
          <button
            onClick={() =>
              onUpdateCondition(selectedRule.id, selectedCondition.id, {
                negate: !selectedCondition.negate,
              })
            }
            className={`absolute top-4 right-4 p-2 rounded-lg border-2 transition-colors cursor-pointer z-10 ${
              selectedCondition.negate
                ? "bg-balatro-red/20 border-balatro-red text-balatro-red"
                : "bg-black-darker border-black-lighter text-white-darker hover:border-balatro-red hover:text-balatro-red"
            }`}
            title={
              selectedCondition.negate ? "Remove negation" : "Negate condition"
            }
          >
            <XMarkIcon className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-condition/20 rounded-lg flex items-center justify-center">
              <InformationCircleIcon className="h-5 w-5 text-condition" />
            </div>
            <div className="flex-1 pr-12">
              <h4 className="text-condition font-medium text-lg">
                {conditionType.label}
              </h4>
              <span className="text-white-darker text-xs uppercase tracking-wider">
                Condition Logic
              </span>
            </div>
          </div>
          <p className="text-white-light text-sm leading-relaxed">
            {conditionType.description}
          </p>
        </div>

        {paramsToRender.length > 0 && (
          <div className="space-y-3">
            <h5 className="text-white-light font-medium text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-condition rounded-full"></div>
              Parameters
            </h5>
            {paramsToRender.map((param) => (
              <div
                key={param.id}
                className="bg-black-darker border border-black-lighter rounded-lg p-3"
              >
                <ParameterField
                  param={param}
                  value={selectedCondition.params[param.id]}
                  onChange={(value) => {
                    const newParams = {
                      ...selectedCondition.params,
                      [param.id]: value,
                    };
                    onUpdateCondition(selectedRule.id, selectedCondition.id, {
                      params: newParams,
                    });
                  }}
                  parentValues={selectedCondition.params}
                  availableVariables={availableVariables}
                  onCreateVariable={handleCreateVariable}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const ChanceInput: React.FC<{
    label: string;
    value: string | number | undefined;
    onChange: (value: string | number) => void;
    availableVariables: Array<{ value: string; label: string }>;
    onCreateVariable: (name: string, initialValue: number) => void;
  }> = ({ label, value, onChange, availableVariables, onCreateVariable }) => {
    const [isVariableMode, setIsVariableMode] = React.useState(
      typeof value === "string"
    );
    const [newVariableName, setNewVariableName] = React.useState("");
    const numericValue = typeof value === "number" ? value : 1;
    const actualValue = value || numericValue;

    return (
      <div className="flex flex-col gap-2 items-center">
        <div className="flex items-center gap-2">
          <span className="text-white-light text-sm">{label}</span>
          <button
            onClick={() => setIsVariableMode(!isVariableMode)}
            className={`p-1 rounded transition-colors cursor-pointer ${
              isVariableMode
                ? "bg-mint/20 text-mint"
                : "bg-black-lighter text-white-darker hover:text-mint"
            }`}
            title="Toggle variable mode"
          >
            <VariableIcon className="h-3 w-3" />
          </button>
        </div>

        {isVariableMode ? (
          <div className="space-y-2 w-full">
            {availableVariables.length > 0 ? (
              <InputDropdown
                value={(actualValue as string) || ""}
                onChange={(newValue) => onChange(newValue)}
                options={availableVariables}
                placeholder="Select variable"
                className="bg-black-dark"
                size="sm"
              />
            ) : (
              <div className="text-white-darker text-xs text-center">
                No variables available
              </div>
            )}

            <div className="border-t border-black-lighter pt-2">
              <div className="flex gap-2">
                <InputField
                  value={newVariableName}
                  onChange={(e) => setNewVariableName(e.target.value)}
                  placeholder="Variable name"
                  size="sm"
                  className="flex-1"
                />
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    if (newVariableName.trim() && onCreateVariable) {
                      onCreateVariable(newVariableName.trim(), numericValue);
                      onChange(newVariableName.trim());
                      setNewVariableName("");
                    }
                  }}
                  disabled={!newVariableName.trim()}
                  className="cursor-pointer"
                >
                  Create
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <InputField
            type="number"
            value={numericValue.toString()}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              onChange(isNaN(val) ? 1 : val);
            }}
            min="1"
            size="sm"
            className="w-20"
          />
        )}
      </div>
    );
  };

  const renderEffectEditor = () => {
    if (!selectedEffect || !selectedRule) return null;
    const effectType = getEffectTypeById(selectedEffect.type);
    if (!effectType) return null;

    const hasRandomChance = selectedEffect.params.has_random_chance === "true";

    const paramsToRender = effectType.params.filter((param) => {
      if (!hasShowWhen(param)) return true;
      const { parameter, values } = param.showWhen;
      const parentValue = selectedEffect.params[parameter];
      return values.includes(parentValue as string);
    });

    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-effect/20 to-transparent border border-effect/30 rounded-lg p-4 relative">
          <button
            onClick={() => {
              if (hasRandomChance) {
                const newParams = { ...selectedEffect.params };
                delete newParams.has_random_chance;
                delete newParams.chance_numerator;
                delete newParams.chance_denominator;
                onUpdateEffect(selectedRule.id, selectedEffect.id, {
                  params: newParams,
                });
              } else {
                const newParams = {
                  ...selectedEffect.params,
                  has_random_chance: "true",
                  chance_numerator: 1,
                  chance_denominator: 4,
                };
                onUpdateEffect(selectedRule.id, selectedEffect.id, {
                  params: newParams,
                });
              }
            }}
            className={`absolute top-4 right-4 p-2 rounded-lg border-2 transition-colors cursor-pointer z-10 ${
              hasRandomChance
                ? "bg-mint/20 border-mint text-mint"
                : "bg-black-darker border-black-lighter text-white-darker hover:border-mint hover:text-mint"
            }`}
            title={
              hasRandomChance ? "Remove random chance" : "Add random chance"
            }
          >
            <PercentBadgeIcon className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-effect/20 rounded-lg flex items-center justify-center">
              <InformationCircleIcon className="h-5 w-5 text-effect" />
            </div>
            <div className="flex-1 pr-12">
              <h4 className="text-effect font-medium text-lg">
                {effectType.label}
              </h4>
              <span className="text-white-darker text-xs uppercase tracking-wider">
                Effect Action
              </span>
            </div>
          </div>
          <p className="text-white-light text-sm leading-relaxed">
            {effectType.description}
          </p>

          {hasRandomChance && (
            <div className="mt-3 bg-mint/10 border border-mint/30 rounded-lg p-3">
              <div className="flex flex-col items-center gap-4">
                <ChanceInput
                  label="Numerator"
                  value={
                    selectedEffect.params.chance_numerator as
                      | string
                      | number
                      | undefined
                  }
                  onChange={(value) => {
                    const newParams = {
                      ...selectedEffect.params,
                      chance_numerator: value,
                    };
                    onUpdateEffect(selectedRule.id, selectedEffect.id, {
                      params: newParams,
                    });
                  }}
                  availableVariables={availableVariables}
                  onCreateVariable={handleCreateVariable}
                />
                <span className="text-white-light text-sm">in</span>
                <ChanceInput
                  label="Denominator"
                  value={
                    selectedEffect.params.chance_denominator as
                      | string
                      | number
                      | undefined
                  }
                  onChange={(value) => {
                    const newParams = {
                      ...selectedEffect.params,
                      chance_denominator: value,
                    };
                    onUpdateEffect(selectedRule.id, selectedEffect.id, {
                      params: newParams,
                    });
                  }}
                  availableVariables={availableVariables}
                  onCreateVariable={handleCreateVariable}
                />
              </div>
            </div>
          )}
        </div>

        {paramsToRender.length > 0 && (
          <div className="space-y-3">
            <h5 className="text-white-light font-medium text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-effect rounded-full"></div>
              Parameters
            </h5>
            {paramsToRender.map((param) => (
              <div
                key={param.id}
                className="bg-black-darker border border-black-lighter rounded-lg p-3"
              >
                <ParameterField
                  param={param}
                  value={selectedEffect.params[param.id]}
                  onChange={(value) => {
                    const newParams = {
                      ...selectedEffect.params,
                      [param.id]: value,
                    };
                    onUpdateEffect(selectedRule.id, selectedEffect.id, {
                      params: newParams,
                    });
                  }}
                  parentValues={selectedEffect.params}
                  availableVariables={availableVariables}
                  onCreateVariable={handleCreateVariable}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-96 bg-black-dark backdrop-blur-md border-2 border-black-lighter rounded-lg shadow-2xl z-40"
    >
      <div
        className="flex items-center justify-between p-3 border-b border-black-lighter cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <div className="flex items-center gap-2">
          <Bars3Icon className="h-4 w-4 text-white-darker" />
          <ChartPieIcon className="h-5 w-5 text-white-light" />
          <h3 className="text-white-light text-sm font-medium tracking-wider">
            Inspector
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-white-darker hover:text-white transition-colors cursor-pointer"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4 max-h-[calc(100vh-12rem)] overflow-y-auto custom-scrollbar">
        <div className="w-1/4 h-[1px] bg-black-lighter mx-auto mb-6"></div>

        {!selectedRule && (
          <div className="flex items-center justify-center h-40">
            <div className="text-center">
              <InformationCircleIcon className="h-12 w-12 text-white-darker mx-auto mb-3 opacity-50" />
              <p className="text-white-darker text-sm">
                Select a rule to view its properties
              </p>
            </div>
          </div>
        )}

        {selectedRule &&
          !selectedCondition &&
          !selectedEffect &&
          renderTriggerInfo()}
        {selectedCondition && renderConditionEditor()}
        {selectedEffect && renderEffectEditor()}
      </div>
    </div>
  );
};

export default Inspector;
