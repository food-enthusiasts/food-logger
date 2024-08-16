import { ReactNode } from "react";
// using Kyle Shevlin's blog Button implementation as inspiration aka reading it and trying to understand it

interface ButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  type?: HTMLButtonElement["type"];
  disabled?: boolean;
}

export function Button({
  children,
  className = "",
  onClick,
  type = "button",
  disabled = false,
}: ButtonProps) {
  return (
    <button
      className={`px-4 py-2 bg-buttonPrimary hover:bg-primary-200 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none ${
        className ?? ""
      }`}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
