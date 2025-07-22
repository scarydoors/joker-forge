import type { Rule, Condition, ConditionGroup } from "../../ruleBuilder/types";
import type { JokerData } from "../../JokerCard";
import { generatePokerHandConditionCode } from "./conditions/PokerHandCondition";
import {
  generateSuitCardConditionCode,
  generateDiscardedSuitConditionCode,
} from "./conditions/SuitCardCondition";
import {
  generateRankCardConditionCode,
  generateDiscardedRankConditionCode,
} from "./conditions/RankCardCondition";
import {
  generateCountCardConditionCode,
  generateDiscardedCardCountConditionCode,
} from "./conditions/CountHandCondition";
import { generatePlayerMoneyConditionCode } from "./conditions/PlayerMoneyCondition";
import { generateRemainingHandsConditionCode } from "./conditions/RemainingHandsCondition";
import { generateRemainingDiscardsConditionCode } from "./conditions/RemainingDiscardsCondition";
import { generateJokerCountConditionCode } from "./conditions/JokerCountCondition";
import { generateBlindTypeConditionCode } from "./conditions/BlindTypeCondition";
import { generateCardEnhancementConditionCode } from "./conditions/CardEnhancementCondition";
import { generateCardSealConditionCode } from "./conditions/CardSealCondition";
import { generateInternalVariableConditionCode } from "./conditions/InternalVariableCondition";
import { generateFirstPlayedHandConditionCode } from "./conditions/FirstHandPlayedCondition";
import { generateFirstDiscardedHandConditionCode } from "./conditions/FirstDiscardedHandCondition";
import { generateAnteLevelConditionCode } from "./conditions/AnteLevelCondition";
import { generateHandSizeConditionCode } from "./conditions/HandSizeCondition";
import { generateDeckSizeConditionCode } from "./conditions/DeckSizeCondition";
import { generateDeckCountConditionCode } from "./conditions/DeckCountCondition";
import { generateCardEditionConditionCode } from "./conditions/CardEditionCondition";
import { generateSpecificJokerConditionCode } from "./conditions/SpecificJokerCondition";
import { generateGenericCompareConditionCode } from "./conditions/GenericCompareCondition";
import { generateConsumableHeldConditionCode } from "./conditions/ConsumableHeldCondition";
import { generateCheckBlindRequirementsConditionCode } from "./conditions/BlindRequirementsCondition";
import { generateGlassCardDestroyedConditionCode } from "./conditions/GlassCardDestroyedCondition";
import { generateConsumableTypeConditionCode } from "./conditions/ConsumableTypeCondition";
import { generatePokerHandBeenPlayedConditionCode } from "./conditions/PokerHandBeenPlayedCondition";
import { generateTriggeredBossBlindConditionCode } from "./conditions/TriggeredBossBlindCondition";
import { generateLuckyCardTriggeredConditionCode } from "./conditions/LuckyCardTriggeredCondition";

export const generateConditionChain = (
  rule: Rule,
  joker?: JokerData
): string => {
  if (!rule.conditionGroups || rule.conditionGroups.length === 0) {
    return "";
  }

  const groupConditions: string[] = [];

  rule.conditionGroups.forEach((group) => {
    const conditions = generateConditionGroupCode(group, rule, joker);
    if (conditions) {
      groupConditions.push(conditions);
    }
  });

  if (groupConditions.length === 0) {
    return "";
  }

  if (groupConditions.length === 1) {
    return groupConditions[0];
  }

  let result = groupConditions[0];
  for (let i = 1; i < groupConditions.length; i++) {
    const prevGroup = rule.conditionGroups[i - 1];
    const operator = prevGroup.operator === "or" ? " or " : " and ";
    result += operator + groupConditions[i];
  }

  return `(${result})`;
};

const generateConditionGroupCode = (
  group: ConditionGroup,
  rule: Rule,
  joker?: JokerData
): string => {
  if (!group.conditions || group.conditions.length === 0) {
    return "";
  }

  const conditionCodes: string[] = [];

  group.conditions.forEach((condition) => {
    const code = generateSingleConditionCode(condition, rule, joker);
    if (code) {
      let finalCode = code;

      if (condition.negate) {
        finalCode = `not (${code})`;
      }

      conditionCodes.push(finalCode);
    }
  });

  if (conditionCodes.length === 0) {
    return "";
  }

  if (conditionCodes.length === 1) {
    return conditionCodes[0];
  }

  let result = conditionCodes[0];
  for (let i = 1; i < conditionCodes.length; i++) {
    const prevCondition = group.conditions[i - 1];
    const operator = prevCondition.operator === "or" ? " or " : " and ";
    result += operator + conditionCodes[i];
  }

  return `(${result})`;
};

const generateSingleConditionCode = (
  condition: Condition,
  rule: Rule,
  joker?: JokerData
): string | null => {
  const singleConditionRule = {
    ...rule,
    conditionGroups: [
      {
        ...rule.conditionGroups[0],
        conditions: [condition],
      },
    ],
  };

  switch (condition.type) {
    case "hand_type":
      return generatePokerHandConditionCode([singleConditionRule], joker);

    case "suit_count":
    case "card_suit":
      return generateSuitCardConditionCode([singleConditionRule], joker);

    case "discarded_suit_count":
      return generateDiscardedSuitConditionCode([singleConditionRule], joker);

    case "rank_count":
    case "card_rank":
      return generateRankCardConditionCode([singleConditionRule], joker);

    case "discarded_rank_count":
      return generateDiscardedRankConditionCode([singleConditionRule], joker);

    case "card_count":
      return generateCountCardConditionCode([singleConditionRule]);

    case "discarded_card_count":
      return generateDiscardedCardCountConditionCode([singleConditionRule]);

    case "card_enhancement":
      return generateCardEnhancementConditionCode([singleConditionRule]);

    case "card_seal":
      return generateCardSealConditionCode([singleConditionRule]);

    case "player_money":
      return generatePlayerMoneyConditionCode([singleConditionRule]);

    case "remaining_hands":
      return generateRemainingHandsConditionCode([singleConditionRule]);

    case "remaining_discards":
      return generateRemainingDiscardsConditionCode([singleConditionRule]);

    case "joker_count":
      return generateJokerCountConditionCode([singleConditionRule]);

    case "blind_type":
      return generateBlindTypeConditionCode([singleConditionRule]);

    case "internal_variable":
      return generateInternalVariableConditionCode([singleConditionRule]);

    case "first_played_hand":
      return generateFirstPlayedHandConditionCode();

    case "first_discarded_hand":
      return generateFirstDiscardedHandConditionCode();

    case "ante_level":
      return generateAnteLevelConditionCode([singleConditionRule]);

    case "hand_size":
      return generateHandSizeConditionCode([singleConditionRule]);

    case "deck_size":
      return generateDeckSizeConditionCode([singleConditionRule]);

    case "deck_count":
      return generateDeckCountConditionCode([singleConditionRule]);

    case "card_edition":
      return generateCardEditionConditionCode([singleConditionRule]);

    case "specific_joker":
      return generateSpecificJokerConditionCode([singleConditionRule]);

    case "generic_compare":
      return generateGenericCompareConditionCode([singleConditionRule]);

    case "consumable_held":
      return generateConsumableHeldConditionCode([singleConditionRule]);

    case "check_blind_requirements":
      return generateCheckBlindRequirementsConditionCode([singleConditionRule]);

    case "glass_card_destroyed":
      return generateGlassCardDestroyedConditionCode();

    case "consumable_type":
      return generateConsumableTypeConditionCode([singleConditionRule]);

    case "poker_hand_been_played":
      return generatePokerHandBeenPlayedConditionCode();

    case "triggered_boss_blind":
      return generateTriggeredBossBlindConditionCode();

    case "lucky_card_triggered":
      return generateLuckyCardTriggeredConditionCode();

    default:
      return null;
  }
};
