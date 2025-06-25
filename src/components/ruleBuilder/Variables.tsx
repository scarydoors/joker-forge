import React, { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { JokerData, UserVariable } from "../JokerCard";
import {
  getVariableUsageDetails,
  getAllVariables,
} from "../codeGeneration/variableUtils";
import {
  CommandLineIcon,
  XMarkIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import { PlusIcon, TrashIcon, PencilIcon } from "@heroicons/react/24/solid";
import InputField from "../generic/InputField";
import Button from "../generic/Button";

interface VariablesProps {
  position: { x: number; y: number };
  joker: JokerData;
  onUpdateJoker: (updates: Partial<JokerData>) => void;
  onClose: () => void;
  onPositionChange: (position: { x: number; y: number }) => void;
}

const Variables: React.FC<VariablesProps> = ({
  position,
  joker,
  onUpdateJoker,
  onClose,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVariable, setEditingVariable] = useState<string | null>(null);
  const [newVariableName, setNewVariableName] = useState("");
  const [newVariableValue, setNewVariableValue] = useState("0");
  const [newVariableDescription, setNewVariableDescription] = useState("");

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: "panel-variables",
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

  const usageDetails = getVariableUsageDetails(joker);
  const allVariables = getAllVariables(joker);
  const userVariables = joker.userVariables || [];

  const getUsageInfo = (variableName: string) => {
    const usages = usageDetails.filter(
      (usage) => usage.variableName === variableName
    );
    const ruleNumbers = [...new Set(usages.map((usage) => usage.ruleIndex))];
    return {
      count: usages.length,
      rules: ruleNumbers,
    };
  };

  const handleAddVariable = () => {
    if (!newVariableName.trim()) return;

    const newVariable: UserVariable = {
      id: crypto.randomUUID(),
      name: newVariableName.trim(),
      initialValue: parseFloat(newVariableValue) || 0,
      description: newVariableDescription.trim() || undefined,
    };

    const updatedVariables = [...userVariables, newVariable];
    onUpdateJoker({ userVariables: updatedVariables });

    setNewVariableName("");
    setNewVariableValue("0");
    setNewVariableDescription("");
    setShowAddForm(false);
  };

  const handleDeleteVariable = (variableId: string) => {
    const updatedVariables = userVariables.filter((v) => v.id !== variableId);
    onUpdateJoker({ userVariables: updatedVariables });
  };

  const handleUpdateVariable = (
    variableId: string,
    updates: Partial<UserVariable>
  ) => {
    const updatedVariables = userVariables.map((v) =>
      v.id === variableId ? { ...v, ...updates } : v
    );
    onUpdateJoker({ userVariables: updatedVariables });
    setEditingVariable(null);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-80 bg-black-dark backdrop-blur-md border-2 border-black-lighter rounded-lg shadow-2xl z-40"
    >
      <div
        className="flex items-center justify-between p-3 border-b border-black-lighter cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <div className="flex items-center gap-2">
          <Bars3Icon className="h-4 w-4 text-white-darker" />
          <CommandLineIcon className="h-5 w-5 text-white-light" />
          <h3 className="text-white-light text-sm font-medium tracking-wider">
            Variables
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-white-darker hover:text-white transition-colors cursor-pointer"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4">
        <div className="w-1/4 h-[1px] bg-black-lighter mx-auto mb-4"></div>

        <div className="max-h-80 overflow-y-auto custom-scrollbar space-y-3">
          {allVariables.map((variable) => {
            const usageInfo = getUsageInfo(variable.name);
            const isUserDefined = userVariables.some(
              (uv) => uv.id === variable.id
            );
            const isEditing = editingVariable === variable.id;

            return (
              <div
                key={variable.id}
                className={`rounded-lg p-3 border-2 ${
                  isUserDefined
                    ? "bg-mint/10 border-mint/30"
                    : "bg-black-darker border-black-lighter"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-mint text-sm font-medium tracking-wide">
                      {variable.name}
                    </span>
                    {usageInfo.count > 0 && (
                      <span className="bg-mint/20 text-mint text-xs px-2 py-1 rounded">
                        {usageInfo.count} uses
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {isUserDefined && (
                      <>
                        <button
                          onClick={() =>
                            setEditingVariable(isEditing ? null : variable.id)
                          }
                          className="p-1 text-white-darker hover:text-white transition-colors cursor-pointer"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteVariable(variable.id)}
                          className="p-1 text-balatro-red hover:text-white transition-colors cursor-pointer"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {variable.description && (
                  <div className="text-white-darker text-xs mb-2">
                    {variable.description}
                  </div>
                )}

                {isEditing ? (
                  <div className="space-y-2">
                    <InputField
                      value={variable.initialValue.toString()}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        handleUpdateVariable(variable.id, {
                          initialValue: value,
                        });
                      }}
                      type="number"
                      size="sm"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-white-darker text-xs">
                      Initial Value:
                    </span>
                    <span className="text-white text-sm font-mono">
                      {variable.initialValue}
                    </span>
                  </div>
                )}

                {usageInfo.rules.length > 0 && (
                  <div className="mt-2 text-white-darker text-xs">
                    Used in rule{usageInfo.rules.length > 1 ? "s" : ""}:{" "}
                    {usageInfo.rules.join(", ")}
                  </div>
                )}
              </div>
            );
          })}

          {showAddForm && (
            <div className="bg-black-darker border-2 border-mint/50 rounded-lg p-3">
              <div className="space-y-3">
                <InputField
                  value={newVariableName}
                  onChange={(e) => setNewVariableName(e.target.value)}
                  placeholder="Variable name"
                  label="Name"
                  size="sm"
                />
                <InputField
                  value={newVariableValue}
                  onChange={(e) => setNewVariableValue(e.target.value)}
                  placeholder="0"
                  label="Initial Value"
                  type="number"
                  size="sm"
                />
                <InputField
                  value={newVariableDescription}
                  onChange={(e) => setNewVariableDescription(e.target.value)}
                  placeholder="Description (optional)"
                  label="Description"
                  size="sm"
                />
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAddVariable}
                    disabled={!newVariableName.trim()}
                    className="cursor-pointer"
                  >
                    Add
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewVariableName("");
                      setNewVariableValue("0");
                      setNewVariableDescription("");
                    }}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {allVariables.length === 0 && !showAddForm && (
            <div className="text-white-darker text-xs text-center py-4">
              No variables defined yet.
            </div>
          )}
        </div>

        <div className="mt-4">
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            onClick={() => setShowAddForm(true)}
            icon={<PlusIcon className="h-4 w-4" />}
            disabled={showAddForm}
            className="cursor-pointer"
          >
            Add Variable
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Variables;
