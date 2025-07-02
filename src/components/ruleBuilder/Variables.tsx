import React, { useState, useMemo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { JokerData, UserVariable } from "../JokerCard";
import { getVariableUsageDetails } from "../codeGeneration/variableUtils";
import {
  CommandLineIcon,
  XMarkIcon,
  Bars3Icon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { PlusIcon, TrashIcon, PencilIcon } from "@heroicons/react/24/solid";
import InputField from "../generic/InputField";
import Button from "../generic/Button";
import { validateVariableName } from "../generic/validationUtils";

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
  const [nameValidationError, setNameValidationError] = useState<string>("");
  const [editValidationError, setEditValidationError] = useState<string>("");
  const [editingName, setEditingName] = useState("");
  const [editingValue, setEditingValue] = useState(0);

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

  const validateNewVariableName = (name: string) => {
    const validation = validateVariableName(name.trim());
    if (!validation.isValid) {
      setNameValidationError(validation.error || "Invalid variable name");
      return false;
    }

    const existingNames = userVariables.map((v) => v.name.toLowerCase());
    if (existingNames.includes(name.trim().toLowerCase())) {
      setNameValidationError("Variable name already exists");
      return false;
    }

    setNameValidationError("");
    return true;
  };

  const validateEditVariableName = (
    name: string,
    currentVariableId: string
  ) => {
    const validation = validateVariableName(name);
    if (!validation.isValid) {
      setEditValidationError(validation.error || "Invalid variable name");
      return false;
    }

    const existingNames = userVariables
      .filter((v) => v.id !== currentVariableId)
      .map((v) => v.name.toLowerCase());

    if (existingNames.includes(name.toLowerCase())) {
      setEditValidationError("Variable name already exists");
      return false;
    }

    setEditValidationError("");
    return true;
  };

  const handleAddVariable = () => {
    if (!validateNewVariableName(newVariableName)) {
      return;
    }

    const newVariable: UserVariable = {
      id: crypto.randomUUID(),
      name: newVariableName.trim(),
      initialValue: parseFloat(newVariableValue) || 0,
    };

    const updatedVariables = [...userVariables, newVariable];
    onUpdateJoker({ userVariables: updatedVariables });

    setNewVariableName("");
    setNewVariableValue("0");
    setNameValidationError("");
    setShowAddForm(false);
  };

  const handleDeleteVariable = (variableId: string) => {
    const updatedVariables = userVariables.filter((v) => v.id !== variableId);
    onUpdateJoker({ userVariables: updatedVariables });
  };

  const handleStartEdit = (variable: UserVariable) => {
    setEditingVariable(variable.id);
    setEditingName(variable.name);
    setEditingValue(variable.initialValue);
    setEditValidationError("");
  };

  const handleSaveEdit = (variableId: string) => {
    if (!validateEditVariableName(editingName, variableId)) {
      return;
    }

    const updatedVariables = userVariables.map((v) =>
      v.id === variableId
        ? { ...v, name: editingName, initialValue: editingValue }
        : v
    );
    onUpdateJoker({ userVariables: updatedVariables });
    setEditingVariable(null);
    setEditValidationError("");
  };

  const handleCancelEdit = () => {
    setEditingVariable(null);
    setEditValidationError("");
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-80 bg-black-dark backdrop-blur-md border-2 border-black-lighter rounded-lg shadow-2xl z-40"
    >
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
                      <div>
                        <InputField
                          value={editingName}
                          onChange={(e) => {
                            setEditingName(e.target.value);
                            if (editValidationError) {
                              validateEditVariableName(
                                e.target.value,
                                variable.id
                              );
                            }
                          }}
                          label="Name"
                          size="sm"
                        />
                        {editValidationError && (
                          <div className="flex items-center gap-2 mt-1 text-balatro-red text-sm">
                            <ExclamationTriangleIcon className="h-4 w-4" />
                            <span>{editValidationError}</span>
                          </div>
                        )}
                      </div>
                      <InputField
                        value={editingValue.toString()}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          setEditingValue(value);
                        }}
                        type="number"
                        label="Initial Value"
                        size="sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleSaveEdit(variable.id)}
                          disabled={!!editValidationError}
                          className="cursor-pointer flex-1"
                        >
                          Save
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleCancelEdit}
                          className="cursor-pointer"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-mint text-sm font-mono font-medium">
                          ${variable.name}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleStartEdit(variable)}
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

          {showAddForm && (
            <div className="bg-black-darker border-2 border-mint/50 rounded-lg p-3">
              <div className="space-y-3">
                <div>
                  <InputField
                    value={newVariableName}
                    onChange={(e) => {
                      setNewVariableName(e.target.value);
                      validateNewVariableName(e.target.value);
                    }}
                    placeholder="myVariable"
                    label="Name"
                    size="sm"
                  />
                  {nameValidationError && (
                    <div className="flex items-center gap-2 mt-1 text-balatro-red text-sm">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      <span>{nameValidationError}</span>
                    </div>
                  )}
                </div>
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
                    disabled={!newVariableName.trim() || !!nameValidationError}
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
                      setNameValidationError("");
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
