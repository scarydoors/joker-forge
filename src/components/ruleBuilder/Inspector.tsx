import React from "react";
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
import Checkbox from "../generic/Checkbox";
import { EyeIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { ChartPieIcon } from "@heroicons/react/16/solid";

interface InspectorProps {
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
}

interface ParameterFieldProps {
  param: ConditionParameter | EffectParameter;
  value: unknown;
  onChange: (value: unknown) => void;
  parentValues?: Record<string, unknown>;
  availableVariables?: Array<{ value: string; label: string }>;
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
}) => {
  if (hasShowWhen(param)) {
    const { parameter, values } = param.showWhen;
    const parentValue = parentValues[parameter];
    if (!values.includes(parentValue as string)) {
      return null;
    }
  }

  if (param.id === "variable_name" && availableVariables.length > 0) {
    return (
      <div className="mb-3">
        <InputDropdown
          label={String(param.label)}
          labelPosition="center"
          value={(value as string) || ""}
          onChange={(newValue) => onChange(newValue)}
          options={availableVariables}
          className="bg-black-dark"
          size="sm"
        />
      </div>
    );
  }

  switch (param.type) {
    case "select":
      return (
        <div className="mb-3">
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
        </div>
      );

    case "number":
      return (
        <div className="mb-3">
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
            size="sm"
            labelPosition="center"
          />
        </div>
      );

    case "text":
      return (
        <div className="mb-3">
          <InputField
            label={String(param.label)}
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            className="text-sm"
            size="sm"
          />
        </div>
      );

    default:
      return null;
  }
};

const Inspector: React.FC<InspectorProps> = ({
  joker,
  selectedRule,
  selectedCondition,
  selectedEffect,
  onUpdateCondition,
  onUpdateEffect,
}) => {
  const availableVariables = getAllVariables(joker).map(
    (variable: { name: string }) => ({
      value: variable.name,
      label: variable.name,
    })
  );

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

    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-condition/20 to-transparent border border-condition/30 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-condition/20 rounded-lg flex items-center justify-center">
              <InformationCircleIcon className="h-5 w-5 text-condition" />
            </div>
            <div>
              <h4 className="text-condition font-medium text-lg">
                {conditionType.label}
              </h4>
              <span className="text-white-darker text-xs uppercase tracking-wider">
                Condition Logic
              </span>
            </div>
          </div>
          <p className="text-white-light text-sm leading-relaxed mb-3">
            {conditionType.description}
          </p>

          <div className="bg-black-darker border border-black-lighter rounded-lg p-3">
            <Checkbox
              id="negate"
              label="Negate this condition (NOT)"
              checked={selectedCondition.negate}
              onChange={(checked) =>
                onUpdateCondition(selectedRule.id, selectedCondition.id, {
                  negate: checked,
                })
              }
            />
          </div>
        </div>

        <div className="space-y-3">
          <h5 className="text-white-light font-medium text-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-condition rounded-full"></div>
            Parameters
          </h5>
          {conditionType.params.map((param) => (
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
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderEffectEditor = () => {
    if (!selectedEffect || !selectedRule) return null;
    const effectType = getEffectTypeById(selectedEffect.type);
    if (!effectType) return null;

    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-effect/20 to-transparent border border-effect/30 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-effect/20 rounded-lg flex items-center justify-center">
              <InformationCircleIcon className="h-5 w-5 text-effect" />
            </div>
            <div>
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
            Parameters
          </h5>
          {effectType.params.map((param) => (
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
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-black-dark border-l-2 border-t-1 border-black-lighter p-4 flex-grow overflow-y-auto">
      <span className="flex items-center justify-center mb-2 gap-2">
        <ChartPieIcon className="h-6 w-6 text-white-light" />
        <h3 className="text-white-light text-lg font-medium tracking-wider">
          Inspector
        </h3>
      </span>

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
  );
};

export default Inspector;
