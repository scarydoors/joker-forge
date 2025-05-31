import React from "react";
import type {
  Rule,
  Condition,
  Effect,
  ConditionParameter,
  EffectParameter,
  ShowWhenCondition,
} from "./types";
import { getTriggerById } from "./Triggers";
import { getConditionTypeById } from "./Conditions";
import { getEffectTypeById } from "./Effects";
import InputField from "../generic/InputField";
import InputDropdown from "../generic/InputDropdown";
import Checkbox from "../generic/Checkbox";
import { EyeIcon } from "@heroicons/react/24/outline";
import { ChartPieIcon } from "@heroicons/react/16/solid";

interface InspectorProps {
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
}) => {
  if (hasShowWhen(param)) {
    const { parameter, values } = param.showWhen;
    const parentValue = parentValues[parameter];
    if (!values.includes(parentValue as string)) {
      return null;
    }
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
            className="text-sm"
            size="sm"
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
  selectedRule,
  selectedCondition,
  selectedEffect,
  onUpdateCondition,
  onUpdateEffect,
}) => {
  const renderTriggerInfo = () => {
    if (!selectedRule) return null;
    const trigger = getTriggerById(selectedRule.trigger);
    if (!trigger) return null;

    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <EyeIcon className="h-4 w-4 text-mint" />
          <span className="text-white text-sm font-medium">
            Trigger Properties
          </span>
        </div>

        <div className="bg-black-dark border border-black-lighter rounded-lg p-3">
          <div className="text-mint text-sm font-medium mb-2">
            {trigger.label}
          </div>
          <div className="text-white-darker text-xs leading-relaxed">
            {trigger.description}
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
      <div>
        <div className="flex items-center gap-2 mb-3">
          <EyeIcon className="h-4 w-4 text-balatro-blue" />
          <span className="text-white text-sm font-medium">
            Condition Properties
          </span>
        </div>

        <div className="bg-black-dark border border-black-lighter rounded-lg p-3 mb-3">
          <div className="text-balatro-blue text-sm font-medium mb-2">
            {conditionType.label}
          </div>
          <div className="text-white-darker text-xs leading-relaxed mb-3">
            {conditionType.description}
          </div>

          <div className="mb-3">
            <Checkbox
              id="negate"
              label="Negate (NOT)"
              checked={selectedCondition.negate}
              onChange={(checked) =>
                onUpdateCondition(selectedRule.id, selectedCondition.id, {
                  negate: checked,
                })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          {conditionType.params.map((param) => (
            <ParameterField
              key={param.id}
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
            />
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
      <div>
        <div className="flex items-center gap-2 mb-3">
          <EyeIcon className="h-4 w-4 text-balatro-orange" />
          <span className="text-white text-sm font-medium">
            Effect Properties
          </span>
        </div>

        <div className="bg-black-dark border border-black-lighter rounded-lg p-3 mb-3">
          <div className="text-balatro-orange text-sm font-medium mb-2">
            {effectType.label}
          </div>
          <div className="text-white-darker text-xs leading-relaxed">
            {effectType.description}
          </div>
        </div>

        <div className="space-y-2">
          {effectType.params.map((param) => (
            <ParameterField
              key={param.id}
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
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-black-dark border-l-2 border-t-1 border-black-lighter p-4 flex-grow">
      <span className="flex items-center justify-center mb-2 gap-2">
        <ChartPieIcon className="h-6 w-6 text-white-light" />
        <h3 className="text-white-light text-lg font-medium tracking-wider">
          Inspector
        </h3>
      </span>

      <div className="w-1/4 h-[1px] bg-black-lighter mx-auto mb-4"></div>

      {!selectedRule && (
        <div className="text-white-darker text-sm text-center py-8">
          Select a rule to view its properties
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
