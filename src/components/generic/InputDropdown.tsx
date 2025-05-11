import React, { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

interface DropdownOption {
  value: string;
  label: string;
}

interface InputDropdownProps {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  useGameFont?: boolean;
  separator?: boolean;
  className?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
}

const InputDropdown: React.FC<InputDropdownProps> = ({
  label,
  icon,
  error,
  useGameFont = false,
  separator = false,
  className = "",
  placeholder = "Select an option",
  value,
  onChange,
  options,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const renderIcon = () => {
    if (icon) {
      return icon;
    }
    return (
      <ChevronDownIcon
        className={`h-6 w-6 text-mint stroke-2 transition-transform ${
          isOpen ? "rotate-180" : ""
        }`}
      />
    );
  };

  const selectedOption = options.find((option) => option.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  const getSeparatorColor = () => {
    if (error) return "bg-balatro-red";
    if (isFocused || isOpen) return "bg-mint";
    return "bg-black-lighter";
  };

  return (
    <div className="flex flex-col w-full select-none" ref={dropdownRef}>
      {label && (
        <div className="flex justify-center">
          <div className="bg-black border-2 border-black-light rounded-md px-4 pb-2 -mb-2 relative">
            <span className="text-white-light text-sm">{label}</span>
          </div>
        </div>
      )}

      <div className="relative">
        <div
          className={`
            relative flex items-center bg-black-dark text-white-light px-3 py-2 
            ${
              useGameFont ? "font-game" : "font-lexend"
            } tracking-wide font-light text-xl
            focus:outline-none rounded-lg cursor-pointer
            border-2 ${
              error
                ? "border-balatro-red"
                : isOpen
                ? "border-mint"
                : "border-black-lighter"
            } 
            hover:border-mint transition-colors w-full
            ${className}
          `}
          onClick={() => {
            setIsOpen(!isOpen);
            setIsFocused(!isFocused);
          }}
        >
          <div className="absolute left-3 flex items-center justify-center z-10">
            {renderIcon()}
          </div>

          {separator && (
            <div
              className={`
                absolute left-11 h-[60%] w-px 
                ${getSeparatorColor()}
                transition-colors
              `}
            />
          )}

          <div className={`w-full truncate ${separator ? "pl-14" : "pl-11"}`}>
            {displayText}
          </div>
        </div>

        {isOpen && (
          <div className="absolute z-20 w-full mt-1 bg-black-dark border-2 border-black-lighter rounded-lg shadow-lg max-h-60 overflow-y-auto custom-scrollbar">
            {options.map((option) => (
              <div
                key={option.value}
                className={`
                  px-3 py-2 cursor-pointer 
                  ${
                    useGameFont ? "font-game" : "font-lexend"
                  } text-white-light text-lg
                  ${
                    value === option.value
                      ? "bg-mint-dark"
                      : "hover:bg-black-lighter"
                  }
                  ${value === option.value ? "font-medium" : "font-light"}
                `}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-balatro-red text-xs mt-1">{error}</p>}
    </div>
  );
};

export default InputDropdown;
