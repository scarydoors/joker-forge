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
    condition: "context.cardarea == G.hand and context.main_scoring",
    context: "hand context",
    description: "When this card is held in the player's hand",
  },
  card_held_in_hand_end_of_round: {
    condition:
      "context.end_of_round and context.cardarea == G.hand and context.other_card == card and context.individual",
    context: "end of round context",
    description: "When this card is held in hand at the end of the round",
  },
  card_discarded: {
    condition: "context.discard and context.other_card == card",
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
