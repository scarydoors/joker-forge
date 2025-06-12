import React from "react";

interface ParsedSegment {
  text: string;
  textColor?: string;
  backgroundColor?: string;
  scale?: number;
  motion?: number;
  tooltip?: string;
  isMultiplier?: boolean;
}

const COLOR_MAP: Record<string, string> = {
  white: "text-white-lighter",
  blue: "text-balatro-blue",
  red: "text-balatro-red",
  orange: "text-balatro-orange",
  green: "text-balatro-green",
  purple: "text-balatro-purple",
  attention: "text-balatro-planet",
  chips: "text-balatro-chips",
  mult: "text-balatro-mult",
  money: "text-balatro-money",
  gold: "text-balatro-money",
  black: "text-balatro-black",
  inactive: "text-gray-500",
  spades: "text-blue-600",
  hearts: "text-red-500",
  clubs: "text-green-600",
  diamonds: "text-orange-500",
  tarot: "text-purple-400",
  planet: "text-blue-400",
  spectral: "text-blue-500",
  common: "text-balatro-blue",
  uncommon: "text-balatro-green",
  rare: "text-balatro-red",
  legendary: "text-balatro-purple",
  enhanced: "text-indigo-400",
  default: "text-gray-600",
};

const BG_COLOR_MAP: Record<string, string> = {
  white: "bg-white-lighter",
  blue: "bg-balatro-blue",
  red: "bg-balatro-red",
  orange: "bg-balatro-orange",
  green: "bg-balatro-green",
  purple: "bg-balatro-purple",
  attention: "bg-balatro-planet",
  chips: "bg-balatro-chips",
  mult: "bg-balatro-mult",
  money: "bg-balatro-money",
  gold: "bg-balatro-money",
  black: "bg-balatro-black",
  spades: "bg-blue-600",
  hearts: "bg-red-500",
  clubs: "bg-green-600",
  diamonds: "bg-orange-500",
  tarot: "bg-purple-400",
  planet: "bg-blue-400",
  spectral: "bg-blue-500",
  enhanced: "bg-indigo-400",
};

// eslint-disable-next-line react-refresh/only-export-components
export const parseBalatroText = (
  text: string,
  locVars?: { colours?: string[] }
): ParsedSegment[] => {
  const segments: ParsedSegment[] = [];
  const regex = /\{([^}]+)\}([^{]*)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index) });
    }

    const modifiers = match[1];
    const content = match[2];

    if (modifiers === "") {
      if (content) segments.push({ text: content });
    } else {
      const segment: ParsedSegment = { text: content };
      const modifierList = modifiers.split(",");

      for (const mod of modifierList) {
        const [type, value] = mod.split(":");

        switch (type) {
          case "C":
            segment.textColor = COLOR_MAP[value] || "text-white-lighter";
            break;
          case "X":
            segment.backgroundColor = BG_COLOR_MAP[value] || "bg-black";
            segment.text = segment.text.replace(/\s/g, "");
            if (value === "mult" || value === "chips") {
              segment.isMultiplier = true;
            }
            break;
          case "V":
            if (locVars?.colours && locVars.colours[parseInt(value) - 1]) {
              const color = locVars.colours[parseInt(value) - 1];
              if (typeof color === "string" && color.startsWith("#")) {
                segment.textColor = `text-[${color}]`;
              }
            }
            break;
          case "B":
            if (locVars?.colours && locVars.colours[parseInt(value) - 1]) {
              const color = locVars.colours[parseInt(value) - 1];
              if (typeof color === "string" && color.startsWith("#")) {
                segment.backgroundColor = `bg-[${color}]`;
              }
            }
            break;
          case "E":
            segment.motion = parseInt(value);
            break;
          case "T":
            segment.tooltip = value;
            break;
          case "s":
            segment.scale = parseFloat(value);
            break;
        }
      }

      if (segment.text) segments.push(segment);
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex) });
  }

  return segments;
};

interface BalatroTextProps {
  text: string;
  locVars?: { colours?: string[] };
  className?: string;
}

export const BalatroText: React.FC<BalatroTextProps> = ({
  text,
  locVars,
  className = "",
}) => {
  const segments = parseBalatroText(text, locVars);

  return (
    <span className={className}>
      {segments.map((segment, index) => {
        let classes = segment.textColor || "";

        if (segment.backgroundColor) {
          classes += ` ${segment.backgroundColor} px-1 rounded`;
        }

        if (segment.scale) {
          const scaleClass =
            segment.scale === 0.8
              ? "text-xs"
              : segment.scale === 0.85
              ? "text-sm"
              : segment.scale === 1.1
              ? "text-lg"
              : "";
          classes += ` ${scaleClass}`;
        }

        if (segment.motion === 1) {
          classes += " animate-float";
        } else if (segment.motion === 2) {
          classes += " animate-bump";
        }

        if (segment.isMultiplier && segment.text.match(/^[X×]?\d/)) {
          segment.text = segment.text.replace(/^X?/, "×");
        }

        const content = <span className={classes.trim()}>{segment.text}</span>;

        if (segment.tooltip) {
          return (
            <span key={index} className="relative group cursor-help">
              {content}
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black-darker border border-black-lighter rounded text-xs text-white-light whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                {segment.tooltip}
              </span>
            </span>
          );
        }

        return <span key={index}>{content}</span>;
      })}
    </span>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const formatBalatroText = (
  text: string,
  locVars?: { colours?: string[] }
): string => {
  const segments = parseBalatroText(text, locVars);

  return segments
    .map((segment) => {
      let html = segment.text;

      if (segment.textColor) {
        html = `<span class="${segment.textColor}">${html}</span>`;
      }

      if (segment.backgroundColor) {
        const bgClass = segment.backgroundColor;
        const textClass = segment.textColor || "text-white-lighter";
        html = `<span class="${bgClass} ${textClass} px-1 rounded">${html}</span>`;
      }

      if (segment.scale) {
        const scaleClass =
          segment.scale === 0.8
            ? "text-xs"
            : segment.scale === 0.85
            ? "text-sm"
            : segment.scale === 1.1
            ? "text-lg"
            : "";
        html = `<span class="${scaleClass}">${html}</span>`;
      }

      if (segment.isMultiplier && html.match(/^[X×]?\d/)) {
        html = html.replace(/^X?/, "×");
      }

      return html;
    })
    .join("");
};
