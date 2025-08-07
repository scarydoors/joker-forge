import { TriggerDefinition } from "../../ruleBuilder/types";
import { HandRaisedIcon, SparklesIcon } from "@heroicons/react/24/outline";

export interface CategoryDefinition {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const CARD_TRIGGER_CATEGORIES: CategoryDefinition[] = [
  {
    label: "Scoring",
    icon: SparklesIcon,
  },
  {
    label: "Hand State",
    icon: HandRaisedIcon,
  },
];

export const CARD_TRIGGERS: TriggerDefinition[] = [
  {
    id: "card_scored",
    label: "When Card is Scored",
    description: "Triggers when this card is part of a scoring hand",
    category: "Scoring",
  },
  {
    id: "card_held",
    label: "When Card is Held in Hand",
    description: "Triggers when this card is in the player's hand",
    category: "Hand State",
  },
];

export function getCardTriggerById(id: string): TriggerDefinition | undefined {
  return CARD_TRIGGERS.find((trigger) => trigger.id === id);
}
