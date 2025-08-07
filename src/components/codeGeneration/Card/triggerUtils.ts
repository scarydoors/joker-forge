import type { Rule } from "../../ruleBuilder/types";

interface TriggerDefinition {
  condition: string;
  context: string;
  description: string;
}

const TRIGGER_DEFINITIONS: Record<string, TriggerDefinition> = {
  card_scored: {
    condition: "context.main_scoring and context.cardarea == G.play",
    context: "scoring context",
    description: "When this card is part of a scoring hand",
  },
  card_held: {
    condition: "context.cardarea == G.hand and context.individual",
    context: "hand context",
    description: "When this card is held in the player's hand",
  },
  card_discarded: {
    condition: "context.discard",
    context: "discard context",
    description:
      "Triggers whenever a card is discarded. Use conditions to check properties of the discarded card.",
  },
};

export const generateTriggerCondition = (trigger: string): string => {
  return TRIGGER_DEFINITIONS[trigger]?.condition || "";
};

export const getTriggerContext = (trigger: string): string => {
  return TRIGGER_DEFINITIONS[trigger]?.context || "general context";
};

export const getTriggerDescription = (trigger: string): string => {
  return TRIGGER_DEFINITIONS[trigger]?.description || "";
};

export const isValidCardTrigger = (trigger: string): boolean => {
  return trigger in TRIGGER_DEFINITIONS;
};

export const getValidCardTriggers = (): string[] => {
  return Object.keys(TRIGGER_DEFINITIONS);
};

export const getAllTriggerDefinitions = (): Record<
  string,
  TriggerDefinition
> => {
  return { ...TRIGGER_DEFINITIONS };
};

// Convenience function for rules
export const generateTriggerCheck = (rule: Rule): string => {
  return generateTriggerCondition(rule.trigger);
};
