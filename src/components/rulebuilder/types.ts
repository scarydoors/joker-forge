// Rule structure for the Rule Builder: Trigger -> Condition(s) -> Effect(s)
export interface Rule {
  id: string;
  trigger: string;
  conditionGroups: ConditionGroup[];
  effects: Effect[];
}

// A group of conditions with a logical operator (AND/OR)
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

// Interface for trigger definitions
export interface TriggerDefinition {
  id: string;
  label: string;
  description: string;
}

// Interface for condition type definitions
export interface ConditionTypeDefinition {
  id: string;
  label: string;
  description: string;
  params: ConditionParameter[];
}

// Interface for condition parameters
export interface ConditionParameter {
  id: string;
  type: "select" | "number" | "range";
  label: string;
  description?: string;
  options?: ConditionParameterOption[];
  min?: number;
  max?: number;
  default?: any;
  // When this parameter should be shown based on other parameter values
  showWhen?: {
    parameter: string;
    values: string[];
  };
}

// Interface for condition parameter options
export interface ConditionParameterOption {
  value: string;
  label: string;
}

// Interface for effect type definitions
export interface EffectTypeDefinition {
  id: string;
  label: string;
  description: string;
  params: EffectParameter[];
}

// Interface for effect parameters
export interface EffectParameter {
  id: string;
  type: "select" | "number" | "range" | "text";
  label: string;
  description?: string;
  options?: EffectParameterOption[];
  min?: number;
  max?: number;
  default?: any;
}

// Interface for effect parameter options
export interface EffectParameterOption {
  value: string;
  label: string;
}

// Interface for logical operators
export interface LogicalOperator {
  value: string;
  label: string;
}

// Export logical operators
export const LOGICAL_OPERATORS: LogicalOperator[] = [
  { value: "and", label: "AND" },
  { value: "or", label: "OR" },
];
