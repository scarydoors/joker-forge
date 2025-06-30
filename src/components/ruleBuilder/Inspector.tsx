import React from "react";
import { useDraggable } from "@dnd-kit/core";
import type {
  Rule,
  Condition,
  Effect,
  RandomGroup,
  ConditionParameter,
  EffectParameter,
  ShowWhenCondition,
} from "./types";
import { JokerData } from "../JokerCard";
import { getAllVariables } from "../codeGeneration/variableUtils";
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
  PlusIcon,
} from "@heroicons/react/24/outline";
import { ChartPieIcon, PercentBadgeIcon } from "@heroicons/react/16/solid";

interface InspectorProps {
  position: { x: number; y: number };
  joker: JokerData;
  selectedRule: Rule | null;
  selectedCondition: Condition | null;
  selectedEffect: Effect | null;
  selectedRandomGroup: RandomGroup | null;
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
  onUpdateRandomGroup: (
    ruleId: string,
    randomGroupId: string,
    updates: Partial<RandomGroup>
  ) => void;
  onUpdateJoker: (updates: Partial<JokerData>) => void;
  onClose: () => void;
  onPositionChange: (position: { x: number; y: number }) => void;
  onToggleVariablesPanel: () => void;
  onCreateRandomGroupFromEffect: (ruleId: string, effectId: string) => void;
}

interface ParameterFieldProps {
  param: ConditionParameter | EffectParameter;
  value: unknown;
  onChange: (value: unknown) => void;
  parentValues?: Record<string, unknown>;
  availableVariables?: Array<{ value: string; label: string }>;
  onCreateVariable?: (name: string, initialValue: number) => void;
  onOpenVariablesPanel?: () => void;
}

const ChanceInput: React.FC<{
  label: string;
  value: string | number | undefined;
  onChange: (value: string | number) => void;
  availableVariables: Array<{ value: string; label: string }>;
  onCreateVariable: (name: string, initialValue: number) => void;
  onOpenVariablesPanel: () => void;
}> = React.memo(
  ({ label, value, onChange, availableVariables, onOpenVariablesPanel }) => {
    const [isVariableMode, setIsVariableMode] = React.useState(
      typeof value === "string"
    );
    const numericValue = typeof value === "number" ? value : 1;
    const actualValue = value || numericValue;

    React.useEffect(() => {
      setIsVariableMode(typeof value === "string");
    }, [value]);

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
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={onOpenVariablesPanel}
                icon={<PlusIcon className="h-4 w-4" />}
                className="cursor-pointer"
              >
                Create Variable
              </Button>
            )}
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
  }
);

ChanceInput.displayName = "ChanceInput";

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
  onOpenVariablesPanel,
}) => {
  const [isVariableMode, setIsVariableMode] = React.useState(
    typeof value === "string"
  );

  React.useEffect(() => {
    setIsVariableMode(typeof value === "string");
  }, [value]);

  if (hasShowWhen(param)) {
    const { parameter, values } = param.showWhen;
    const parentValue = parentValues[parameter];
    if (!values.includes(parentValue as string)) {
      return null;
    }
  }

  if (param.id === "variable_name") {
    if (availableVariables.length > 0) {
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
    } else {
      return (
        <div>
          <span className="text-white-light text-sm mb-2 block">
            {String(param.label)}
          </span>
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            onClick={onOpenVariablesPanel}
            icon={<PlusIcon className="h-4 w-4" />}
            className="cursor-pointer"
          >
            Create Variable
          </Button>
        </div>
      );
    }
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
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth
                  onClick={onOpenVariablesPanel}
                  icon={<PlusIcon className="h-4 w-4" />}
                  className="cursor-pointer"
                >
                  Create Variable
                </Button>
              )}
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
  selectedRandomGroup,
  onUpdateCondition,
  onUpdateEffect,
  onUpdateRandomGroup,
  onUpdateJoker,
  onClose,
  onToggleVariablesPanel,
  onCreateRandomGroupFromEffect,
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

        <div className="grid grid-cols-3 gap-3">
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
              {selectedRule.effects.length +
                selectedRule.randomGroups.reduce(
                  (sum, group) => sum + group.effects.length,
                  0
                )}
            </div>
          </div>
          <div className="bg-black-darker border border-black-lighter rounded-lg p-3">
            <div className="text-white-light text-sm font-medium mb-1">
              Random Groups
            </div>
            <div className="text-mint text-2xl font-bold">
              {selectedRule.randomGroups.length}
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
                  onOpenVariablesPanel={onToggleVariablesPanel}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderRandomGroupEditor = () => {
    if (!selectedRandomGroup || !selectedRule) return null;

    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-mint/20 to-transparent border border-mint/30 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-mint/20 rounded-lg flex items-center justify-center">
              <PercentBadgeIcon className="h-5 w-5 text-mint" />
            </div>
            <div>
              <h4 className="text-mint font-medium text-lg">Random Group</h4>
              <span className="text-white-darker text-xs uppercase tracking-wider">
                Chance-Based Effects
              </span>
            </div>
          </div>
          <p className="text-white-light text-sm leading-relaxed">
            Effects in this group will all be triggered together if the random
            chance succeeds.
          </p>
        </div>

        <div className="space-y-3">
          <h5 className="text-white-light font-medium text-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-mint rounded-full"></div>
            Chance Configuration
          </h5>

          <div className="bg-mint/10 border border-mint/30 rounded-lg p-4">
            <div className="flex flex-col items-center gap-4">
              <ChanceInput
                key="numerator"
                label="Numerator"
                value={selectedRandomGroup.chance_numerator}
                onChange={(value) => {
                  onUpdateRandomGroup(selectedRule.id, selectedRandomGroup.id, {
                    chance_numerator: typeof value === "number" ? value : 1,
                  });
                }}
                availableVariables={availableVariables}
                onCreateVariable={handleCreateVariable}
                onOpenVariablesPanel={onToggleVariablesPanel}
              />
              <span className="text-white-light text-sm">in</span>
              <ChanceInput
                key="denominator"
                label="Denominator"
                value={selectedRandomGroup.chance_denominator}
                onChange={(value) => {
                  onUpdateRandomGroup(selectedRule.id, selectedRandomGroup.id, {
                    chance_denominator: typeof value === "number" ? value : 4,
                  });
                }}
                availableVariables={availableVariables}
                onCreateVariable={handleCreateVariable}
                onOpenVariablesPanel={onToggleVariablesPanel}
              />
            </div>
          </div>

          <div className="bg-black-darker border border-black-lighter rounded-lg p-3">
            <div className="text-white-light text-sm font-medium mb-2">
              Effects in this group
            </div>
            <div className="text-mint text-lg font-bold">
              {selectedRandomGroup.effects.length}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEffectEditor = () => {
    if (!selectedEffect || !selectedRule) return null;
    const effectType = getEffectTypeById(selectedEffect.type);
    if (!effectType) return null;

    const paramsToRender = effectType.params.filter((param) => {
      if (!hasShowWhen(param)) return true;
      const { parameter, values } = param.showWhen;
      const parentValue = selectedEffect.params[parameter];
      return values.includes(parentValue as string);
    });

    const isInRandomGroup = selectedRule.randomGroups.some((group) =>
      group.effects.some((effect) => effect.id === selectedEffect.id)
    );

    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-effect/20 to-transparent border border-effect/30 rounded-lg p-4 relative">
          {!isInRandomGroup && (
            <button
              onClick={() =>
                onCreateRandomGroupFromEffect(
                  selectedRule.id,
                  selectedEffect.id
                )
              }
              className="absolute top-4 right-4 p-2 rounded-lg border-2 transition-colors cursor-pointer z-10 bg-black-darker border-mint text-mint hover:bg-mint/20"
              title="Create Random Group"
            >
              <PercentBadgeIcon className="h-4 w-4" />
            </button>
          )}

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
        </div>

        <div className="space-y-3">
          <h5 className="text-white-light font-medium text-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-effect rounded-full"></div>
            Custom Message
          </h5>
          <div className="bg-black-darker border border-black-lighter rounded-lg p-3">
            <InputField
              label="Message"
              value={selectedEffect.customMessage || ""}
              onChange={(e) => {
                onUpdateEffect(selectedRule.id, selectedEffect.id, {
                  customMessage: e.target.value || undefined,
                });
              }}
              placeholder="Leave blank for default message"
              size="sm"
            />
          </div>
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
                  onOpenVariablesPanel={onToggleVariablesPanel}
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
      className="w-96 bg-black-dark backdrop-blur-md border-2 border-black-lighter rounded-lg shadow-2xl max-h-[calc(100vh-6rem)] z-40 flex flex-col"
    >
      <div
        className="flex items-center justify-between p-3 border-b border-black-lighter cursor-grab active:cursor-grabbing flex-shrink-0"
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

      <div className="p-4 overflow-y-auto custom-scrollbar min-h-0 flex-1">
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
          !selectedRandomGroup &&
          renderTriggerInfo()}
        {selectedCondition && renderConditionEditor()}
        {selectedEffect && renderEffectEditor()}
        {selectedRandomGroup && renderRandomGroupEditor()}
      </div>
    </div>
  );
};

export default Inspector;
