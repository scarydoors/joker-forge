import React, { InputHTMLAttributes, ReactNode, useState } from "react";
import { PencilIcon } from "@heroicons/react/24/outline";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  error?: string;
  useGameFont?: boolean;
  separator?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  icon,
  error,
  useGameFont = false,
  separator = false, // Default to false
  className = "",
  value,
  onChange,
  ...props
}) => {
  const [inputValue, setInputValue] = useState(value || "");
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (onChange) {
      onChange(e);
    }
  };

  // Default to PencilIcon if no icon provided
  const renderIcon = () => {
    if (icon) {
      return icon;
    }
    return <PencilIcon className="h-6 w-6 text-mint stroke-2" />;
  };

  // Determine the separator color based on focus state and error
  const getSeparatorColor = () => {
    if (error) return "bg-balatro-red";
    if (isFocused) return "bg-mint";
    return "bg-black-lighter";
  };

  return (
    <div className="flex flex-col w-full">
      {/* Only render label if provided */}
      {label && (
        <div className="px-6 py-1 -mb-1 text-center inline-block mx-auto bg-black border-black-light border-3 rounded">
          <span className="text-white-light font-lexend text-sm tracking-widest font-light">
            {label}
          </span>
        </div>
      )}

      <div className="relative flex items-center">
        {/* Icon container */}
        <div className="absolute left-3 flex items-center justify-center z-10">
          {renderIcon()}
        </div>

        {/* Separator - only render if separator prop is true */}
        {separator && (
          <div
            className={`
              absolute left-11 h-[60%] w-px 
              ${getSeparatorColor()}
              transition-colors
            `}
          />
        )}

        {/* Input field */}
        <input
          value={inputValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            bg-black-dark text-white-light px-3 py-2 tracking-wide font-light text-xl
            ${useGameFont ? "font-game" : "font-lexend"}
            ${separator ? "pl-14" : "pl-11"}s
            focus:outline-none rounded-lg
            border-2 border-black-lighter focus:border-mint transition-colors w-full
            ${error ? "border-balatro-red" : ""}
            ${className}
          `}
          {...props}
        />
      </div>

      {/* Error message */}
      {error && <p className="text-balatro-red text-xs mt-1">{error}</p>}
    </div>
  );
};

export default InputField;
