import React from "react";
import { JokerData } from "../JokerCard";
import { getVariableNamesFromJoker } from "../codeGeneration/VariableUtils";
import { CommandLineIcon } from "@heroicons/react/16/solid";

interface VariablesProps {
  joker: JokerData;
}

const Variables: React.FC<VariablesProps> = ({ joker }) => {
  const variableNames = getVariableNamesFromJoker(joker);

  const getVariableInfo = (name: string) => {
    const defaultValues: Record<
      string,
      { type: string; initial: number; description: string }
    > = {
      chips: { type: "number", initial: 10, description: "Chips to add" },
      mult: { type: "number", initial: 5, description: "Mult to add" },
      Xmult: { type: "number", initial: 1.5, description: "X Mult multiplier" },
      dollars: { type: "number", initial: 5, description: "Money to add" },
      repetitions: {
        type: "number",
        initial: 1,
        description: "Card repetitions",
      },
      hands: { type: "number", initial: 1, description: "Hands to modify" },
      discards: {
        type: "number",
        initial: 1,
        description: "Discards to modify",
      },
      levels: { type: "number", initial: 1, description: "Hand levels to add" },
    };

    return (
      defaultValues[name] || {
        type: "number",
        initial: 0,
        description: "Custom variable",
      }
    );
  };

  return (
    <div className="bg-black border-l-2 border-t-2 border-black-light p-4">
      <span className="flex items-center justify-center mb-2 gap-2">
        <CommandLineIcon className="h-6 w-6 text-white-light" />
        <h3 className="text-white-light text-lg font-medium tracking-wider">
          Variables
        </h3>
      </span>

      <div className="w-1/4 h-[1px] bg-black-lighter mx-auto mb-4"></div>

      {variableNames.length === 0 ? (
        <div className="text-white-darker text-xs text-center">
          No variables defined yet.
          <br />
          Variables will appear here when you create effects that use them.
        </div>
      ) : (
        <div className="space-y-3">
          {variableNames.map((variableName) => {
            const info = getVariableInfo(variableName);
            return (
              <div
                key={variableName}
                className="bg-black-dark border border-black-lighter rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-mint text-sm font-medium tracking-wide">
                    {variableName}
                  </span>
                  <span className="text-white-darker text-xs uppercase">
                    {info.type}
                  </span>
                </div>

                <div className="text-white-darker text-xs mb-2">
                  {info.description}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white-darker text-xs">
                    Initial Value:
                  </span>
                  <span className="text-white text-sm font-mono">
                    {info.initial}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Variables;
