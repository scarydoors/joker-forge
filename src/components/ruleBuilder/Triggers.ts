import { TriggerDefinition } from "./types";

// Trigger definitions
export const TRIGGERS: TriggerDefinition[] = [
  {
    id: "hand_played",
    label: "When a Hand is Played",
    description:
      "Triggers when any hand is played. Use conditions to specify whether to check scoring cards, all played cards, or specific hand types.",
  },
  {
    id: "card_scored",
    label: "When a Card is Scored",
    description:
      "Triggers for each individual card during scoring. Use this for card-specific properties like suit, rank, or enhancements.",
  },
  {
    id: "card_discarded",
    label: "When a Card is Discarded",
    description:
      "Triggers whenever a card is discarded. Use conditions to check properties of the discarded card.",
  },
  {
    id: "blind_selected",
    label: "When a Blind is Selected",
    description:
      "Triggers when the player selects a new blind at the start of each ante.",
  },
  {
    id: "blind_skipped",
    label: "When a Blind is Skipped",
    description: "Triggers when the player chooses to skip a blind.",
  },
  {
    id: "boss_defeated",
    label: "When a Boss is Defeated",
    description: "Triggers after defeating a boss blind.",
  },
  {
    id: "booster_opened",
    label: "When a Booster is Opened",
    description: "Triggers when the player opens a booster pack.",
  },
  {
    id: "booster_skipped",
    label: "When a Booster is Skipped",
    description: "Triggers when the player chooses to skip a booster pack.",
  },
  {
    id: "consumable_used",
    label: "When a Consumable is Used",
    description:
      "Triggers when the player uses a Tarot, Planet, or Spectral card.",
  },
  {
    id: "hand_drawn",
    label: "When a Hand is Drawn",
    description: "Triggers when the player draws a new hand of cards.",
  },
  {
    id: "first_hand_drawn",
    label: "When First Hand is Drawn",
    description: "Triggers only for the first hand drawn in each round.",
  },
  {
    id: "shop_exited",
    label: "When Shop is Exited",
    description: "Triggers when the player exits the shop.",
  },
  {
    id: "passive",
    label: "Passive (Always Active)",
    description:
      "This joker's effect is always active and checked during scoring. Use for constant bonuses based on conditions.",
  },
];

// Helper function to get a specific trigger by ID
export function getTriggerById(id: string): TriggerDefinition | undefined {
  return TRIGGERS.find((trigger) => trigger.id === id);
}
