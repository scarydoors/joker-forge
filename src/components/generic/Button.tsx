import React, { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  className?: string;
  icon?: React.ReactNode;
  height?: string;
  width?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  disabled = false,
  icon,
  height,
  width,
  ...props
}) => {
  const baseStyles =
    "relative tracking-widest focus:outline-none transition-colors duration-200 font-lexend rounded-lg";

  // Check if it's an icon-only button
  const isIconOnly = icon && !children;

  // Adjust size styles for icon-only buttons
  const sizeStyles = {
    sm: isIconOnly ? "p-1 text-sm border-2" : "px-3 py-1 text-sm border-2",
    md: isIconOnly ? "p-2 text-base border-3" : "px-4 py-2 text-base border-3",
    lg: isIconOnly ? "p-3 text-lg border-3" : "px-6 py-3 text-lg border-3",
  }[size];

  const variantStyles = {
    primary:
      "bg-black-dark text-mint-light border-mint hover:text-mint-lighter hover:border-mint-lighter transition-colors",
    secondary:
      "bg-black-dark text-white-light border-black-lighter hover:bg-black-lighter",
    danger:
      "bg-black-darker text-balatro-red border-balatro-redshadow hover:bg-balatro-redshadow hover:border-balatro-red hover:text-white-light",
  }[variant];

  const disabledStyles = disabled
    ? "opacity-50 cursor-not-allowed hover:bg-mint"
    : "cursor-pointer";

  const widthStyle = fullWidth ? "w-full" : width ? "" : "";

  // Custom inline styles for height and width
  const customStyles: React.CSSProperties = {};
  if (height) {
    customStyles["height"] = height;
  }
  if (width && !fullWidth) {
    customStyles["width"] = width;
  }

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${disabledStyles} ${widthStyle} ${className} flex items-center justify-center`}
      style={customStyles}
      disabled={disabled}
      {...props}
    >
      {icon && <span className={isIconOnly ? "" : "mr-2"}>{icon}</span>}
      {children && <span>{children}</span>}
    </button>
  );
};

export default Button;
