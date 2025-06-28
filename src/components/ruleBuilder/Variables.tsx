import React, { useState, useMemo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { JokerData, UserVariable } from "../JokerCard";
import { getVariableUsageDetails } from "../codeGeneration/variableUtils";
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

  // Memoize usage details to ensure they update when joker changes
  const usageDetails = useMemo(() => getVariableUsageDetails(joker), [joker]);
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
    };

    const updatedVariables = [...userVariables, newVariable];
    onUpdateJoker({ userVariables: updatedVariables });

    setNewVariableName("");
    setNewVariableValue("0");
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
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b border-black-lighter cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <div className="flex items-center gap-3">
          <Bars3Icon className="h-4 w-4 text-white-darker" />
          <CommandLineIcon className="h-5 w-5 text-white-light" />
          <div>
            <h3 className="text-white-light text-sm font-medium tracking-wider">
              Variables
            </h3>
            <p className="text-white-darker text-xs">
              {userVariables.length} variable
              {userVariables.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-white-darker hover:text-white transition-colors cursor-pointer"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4">
        {/* Variables List */}
        <div className="max-h-96 overflow-y-auto custom-scrollbar space-y-2 mb-4">
          {userVariables.length === 0 && !showAddForm ? (
            <div className="text-center py-8">
              <CommandLineIcon className="h-12 w-12 text-white-darker mx-auto mb-3 opacity-50" />
              <p className="text-white-darker text-sm">
                No variables created yet
              </p>
              <p className="text-white-darker text-xs mt-1">
                Create variables to store and modify values in your joker
              </p>
            </div>
          ) : (
            userVariables.map((variable) => {
              const usageInfo = getUsageInfo(variable.name);
              const isEditing = editingVariable === variable.id;

              return (
                <div
                  key={variable.id}
                  className="bg-black-darker border border-black-lighter rounded-lg p-3"
                >
                  {isEditing ? (
                    <div className="space-y-3">
                      <InputField
                        value={variable.name}
                        onChange={(e) => {
                          handleUpdateVariable(variable.id, {
                            name: e.target.value,
                          });
                        }}
                        label="Name"
                        size="sm"
                      />
                      <InputField
                        value={variable.initialValue.toString()}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          handleUpdateVariable(variable.id, {
                            initialValue: value,
                          });
                        }}
                        type="number"
                        label="Initial Value"
                        size="sm"
                      />
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setEditingVariable(null)}
                        className="cursor-pointer"
                        fullWidth
                      >
                        Done
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-mint text-sm font-mono font-medium">
                          ${variable.name}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingVariable(variable.id)}
                            className="p-1 text-white-darker hover:text-white transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <PencilIcon className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteVariable(variable.id)}
                            className="p-1 text-balatro-red hover:text-white transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <TrashIcon className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white-darker">
                          Initial: {variable.initialValue}
                        </span>
                        {usageInfo.count > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="text-white-darker text-xs">
                              Used in:
                            </span>
                            {usageInfo.rules.map((ruleNum) => (
                              <span
                                key={ruleNum}
                                className="bg-mint/20 text-mint text-xs px-1.5 py-0.5 rounded"
                              >
                                {ruleNum + 1}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Add Form */}
          {showAddForm && (
            <div className="bg-black-darker border-2 border-mint/50 rounded-lg p-3">
              <div className="space-y-3">
                <InputField
                  value={newVariableName}
                  onChange={(e) => setNewVariableName(e.target.value)}
                  placeholder="myVariable"
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
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAddVariable}
                    disabled={!newVariableName.trim()}
                    className="cursor-pointer flex-1"
                  >
                    Create
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewVariableName("");
                      setNewVariableValue("0");
                    }}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add Button */}
        {!showAddForm && (
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            onClick={() => setShowAddForm(true)}
            icon={<PlusIcon className="h-4 w-4" />}
            className="cursor-pointer"
          >
            Add Variable
          </Button>
        )}
      </div>
    </div>
  );
};

export default Variables;
