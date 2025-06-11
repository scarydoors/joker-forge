import React, { ReactNode } from "react";

interface TooltipProps {
  children: ReactNode;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
  contentClassName?: string;
  show?: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = "top",
  className = "",
  contentClassName = "",
  show = false,
}) => {
  const getPositionStyles = () => {
    switch (position) {
      case "top":
        return "bottom-full left-1/2 -translate-x-1/2 mb-2";
      case "bottom":
        return "top-full left-1/2 -translate-x-1/2 mt-2";
      case "left":
        return "right-full top-1/2 -translate-y-1/2 mr-2";
      case "right":
        return "left-full top-1/2 -translate-y-1/2 ml-2";
      default:
        return "bottom-full left-1/2 -translate-x-1/2 mb-2";
    }
  };

  return (
    <div className={`relative ${className}`}>
      {children}
      {show && (
        <div
          className={`absolute ${getPositionStyles()} px-3 py-2 bg-black-darker border border-black-lighter rounded text-xs text-white-light whitespace-nowrap z-50 shadow-lg ${contentClassName}`}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
