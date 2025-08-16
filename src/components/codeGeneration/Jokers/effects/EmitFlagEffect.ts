import type { EffectReturn } from "../effectUtils";
import type { Effect } from "../../../ruleBuilder/types";

export const generateEmitFlagReturn = (
  effect: Effect,
  modprefix: string
): EffectReturn => {
  const flagName = (effect.params?.flag_name as string) || "custom_flag";
  const change = (effect.params?.change as string) || "true";
  const customMessage = effect.customMessage;

  const safeFlagName = flagName.trim().replace(/[^a-zA-Z0-9_]/g, '_'); // replace non-alphanumeric charactes with underscore
  const changeCode = change === "invert" ? `not (G.GAME.pool_flags.${modprefix}_${safeFlagName} or false)` : change

  return {
    statement: `__PRE_RETURN_CODE__
                G.GAME.pool_flags.${modprefix}_${safeFlagName} = ${changeCode}
                __PRE_RETURN_CODE_END__`,
    message: customMessage ? `"${customMessage}"` : `"${safeFlagName}"`,
    colour: "G.C.BLUE"
  }
};
