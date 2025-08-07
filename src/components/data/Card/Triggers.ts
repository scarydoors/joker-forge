import { TriggerDefinition } from "../../ruleBuilder/types";
import { HandRaisedIcon } from "@heroicons/react/24/outline";

export interface CategoryDefinition {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const GENERIC_TRIGGERS = ["card_scored", "card_held", "card_discarded"];

export const CARD_TRIGGER_CATEGORIES: CategoryDefinition[] = [
  {
    label: "Card",
    icon: HandRaisedIcon,
  },
];

export const CARD_TRIGGERS: TriggerDefinition[] = [
  {
    id: "card_scored",
    label: "When Card is Scored",
    description: "Triggers when this card is part of a scoring hand",
    category: "Card",
  },
  {
    id: "card_held",
    label: "When Card is Held in Hand",
    description: "Triggers when this card is in the player's hand",
    category: "Card",
  },
  {
    id: "card_discarded",
    label: "When Card is Discarded",
    description:
      "Triggers whenever a card is discarded. Use conditions to check properties of the discarded card.",
    category: "Card",
  },
];

export function getCardTriggerById(id: string): TriggerDefinition | undefined {
  return CARD_TRIGGERS.find((trigger) => trigger.id === id);
}
