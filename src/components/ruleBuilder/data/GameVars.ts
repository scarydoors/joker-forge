export interface GameVariable {
  id: string;
  label: string;
  description: string;
  category: string;
  code: string;
}

export interface GameVariableCategory {
  id: string;
  label: string;
  variables: GameVariable[];
}

export const GAME_VARIABLE_CATEGORIES: GameVariableCategory[] = [
  {
    id: "deck",
    label: "Deck",
    variables: [
      {
        id: "cards_in_deck",
        label: "Cards in Deck",
        description: "Number of cards currently in the deck pile",
        category: "deck",
        code: "#G.deck.cards",
      },
      {
        id: "total_playing_cards",
        label: "Total Playing Cards",
        description: "Total playing cards in the game",
        category: "deck",
        code: "#G.playing_cards",
      },
      {
        id: "current_hand_size",
        label: "Current Hand Size",
        description: "Current hand size",
        category: "deck",
        code: "G.hand.config.card_limit",
      },
      {
        id: "cards_removed_from_deck",
        label: "Cards Removed From Deck",
        description: "Number of cards removed from starting deck",
        category: "deck",
        code: "(G.GAME.starting_deck_size - #G.playing_cards)",
      },
      {
        id: "cards_in_hand",
        label: "Cards in Hand",
        description: "Number of cards currently in hand",
        category: "deck",
        code: "#G.hand.cards",
      },
      {
        id: "cards_in_discard",
        label: "Cards in Discard",
        description: "Number of cards in discard pile",
        category: "deck",
        code: "#G.discard.cards",
      },
    ],
  },
  {
    id: "consumables",
    label: "Consumables",
    variables: [
      {
        id: "consumables_held",
        label: "Consumables Held",
        description: "Number of consumables currently held",
        category: "consumables",
        code: "#G.consumeables.cards",
      },
      {
        id: "consumable_slots",
        label: "Consumable Slots",
        description: "Total number of consumable slots available",
        category: "consumables",
        code: "G.consumeables.config.card_limit",
      },
      {
        id: "free_consumable_slots",
        label: "Free Consumable Slots",
        description: "Number of empty consumable slots",
        category: "consumables",
        code: "(G.consumeables.config.card_limit - #G.consumeables.cards)",
      },
      {
        id: "tarot_cards_used",
        label: "Tarot Cards Used",
        description: "Total number of Tarot cards used this run",
        category: "consumables",
        code: "(G.GAME.consumeable_usage_total and G.GAME.consumeable_usage_total.tarot or 0)",
      },
      {
        id: "spectral_cards_used",
        label: "Spectral Cards Used",
        description: "Total number of Spectral cards used this run",
        category: "consumables",
        code: "(G.GAME.consumeable_usage_total and G.GAME.consumeable_usage_total.spectral or 0)",
      },
      {
        id: "planet_cards_used",
        label: "Planet Cards Used",
        description: "Total number of Planet cards used this run",
        category: "consumables",
        code: "(G.GAME.consumeable_usage_total and G.GAME.consumeable_usage_total.planet or 0)",
      },
    ],
  },
  {
    id: "jokers",
    label: "Jokers",
    variables: [
      {
        id: "joker_count",
        label: "Joker Count",
        description: "Number of jokers currently held",
        category: "jokers",
        code: "#G.jokers.cards",
      },
      {
        id: "joker_slots",
        label: "Total Joker Slots",
        description: "Total number of joker slots available",
        category: "jokers",
        code: "G.jokers.config.card_limit",
      },
      {
        id: "free_joker_slots",
        label: "Free Joker Slots",
        description: "Number of empty joker slots",
        category: "jokers",
        code: "(G.jokers.config.card_limit - #G.jokers.cards)",
      },
    ],
  },
  {
    id: "game_state",
    label: "Game State",
    variables: [
      {
        id: "current_ante",
        label: "Current Ante",
        description: "Current ante level",
        category: "game_state",
        code: "G.GAME.round_resets.ante",
      },
      {
        id: "current_money",
        label: "Current Money",
        description: "Current amount of money",
        category: "game_state",
        code: "G.GAME.dollars",
      },
      {
        id: "hands_remaining",
        label: "Hands Remaining",
        description: "Number of hands left this round",
        category: "game_state",
        code: "G.GAME.current_round.hands_left",
      },
      {
        id: "discards_remaining",
        label: "Discards Remaining",
        description: "Number of discards left this round",
        category: "game_state",
        code: "G.GAME.current_round.discards_left",
      },
      {
        id: "hands_played_this_round",
        label: "Hands Played This Round",
        description: "Number of hands played this round",
        category: "game_state",
        code: "G.GAME.current_round.hands_played",
      },
      {
        id: "discards_used_this_round",
        label: "Discards Used This Round",
        description: "Number of discards used this round",
        category: "game_state",
        code: "G.GAME.current_round.discards_used",
      },
      {
        id: "blinds_skipped",
        label: "Blinds Skipped",
        description: "Total number of blinds skipped this run",
        category: "game_state",
        code: "G.GAME.skips",
      },
      {
        id: "base_hands_per_round",
        label: "Base Hands Per Round",
        description: "Base number of hands per round",
        category: "game_state",
        code: "G.GAME.round_resets.hands",
      },
      {
        id: "base_discards_per_round",
        label: "Base Discards Per Round",
        description: "Base number of discards per round",
        category: "game_state",
        code: "G.GAME.round_resets.discards",
      },
    ],
  },
];

export const getAllGameVariables = (): GameVariable[] => {
  return GAME_VARIABLE_CATEGORIES.flatMap((category) => category.variables);
};

export const getGameVariableById = (id: string): GameVariable | undefined => {
  return getAllGameVariables().find((variable) => variable.id === id);
};

export const getGameVariablesByCategory = (
  categoryId: string
): GameVariable[] => {
  const category = GAME_VARIABLE_CATEGORIES.find(
    (cat) => cat.id === categoryId
  );
  return category ? category.variables : [];
};
