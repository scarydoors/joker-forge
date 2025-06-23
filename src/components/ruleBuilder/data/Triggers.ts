import { TriggerDefinition } from "../types";

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
    id: "hand_discarded",
    label: "When a Hand is Discarded",
    description:
      "Triggers when the player discards a hand of cards (before the discard happens). Different from 'When a Card is Discarded' which triggers per individual card.",
  },
  {
    id: "card_discarded",
    label: "When a Card is Discarded",
    description:
      "Triggers whenever a card is discarded. Use conditions to check properties of the discarded card.",
  },
  {
    id: "card_held_in_hand",
    label: "When a Card is Held in Hand",
    description:
      "Triggers for each individual card currently held in your hand. Perfect for effects that scale with specific cards you're holding, like gaining money for each Ace or mult for each face card.",
  },
  {
    id: "round_end",
    label: "When the Round Ends",
    description:
      "Triggers at the end of each round, after all hands have been played and the blind is completed. Perfect for gaining money, upgrading the joker, or resetting states.",
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
    id: "shop_reroll",
    label: "When Shop is Rerolled",
    description:
      "Triggers whenever the player rerolls the shop to get new items. Perfect for gaining benefits from spending money or building up values through shop interaction.",
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
      "Permanent effects that modify game rules or state while the joker is in play.",
  },
];

// Helper function to get a specific trigger by ID
export function getTriggerById(id: string): TriggerDefinition | undefined {
  return TRIGGERS.find((trigger) => trigger.id === id);
}
