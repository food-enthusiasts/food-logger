import type { ReactNode } from "react";

// like Button, but with less styles applied by default
export interface ButtonBaseProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  type?: HTMLButtonElement["type"];
  disabled?: boolean;
}

export function ButtonBase({
  children,
  className = "",
  onClick,
  type = "button",
  disabled = false,
}: ButtonBaseProps) {
  return (
    <button
      className={` ${className ?? ""}`}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
