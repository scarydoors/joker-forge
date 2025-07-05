import React from "react";

interface CheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  labelClassName?: string;
  disabled?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
  id,
  label,
  checked,
  onChange,
  className = "",
  labelClassName = "",
  disabled = false,
}) => {
  return (
    <div className={`flex items-center select-none ${className}`}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className={`mr-2 h-5 w-5 rounded border-black-lighter accent-mint ${
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
        }`}
      />
      <label
        htmlFor={id}
        className={`text-white ${
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
        } ${labelClassName}`}
      >
        {label}
      </label>
    </div>
  );
};

export default Checkbox;
