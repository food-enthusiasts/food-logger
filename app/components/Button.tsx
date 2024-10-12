// using Kyle Shevlin's blog Button implementation as inspiration aka reading it and trying to understand it

import { ButtonBase } from "./ButtonBase";
import type { ButtonBaseProps } from "./ButtonBase";

interface ButtonProps extends ButtonBaseProps {}

// todo - add different variants, at the moment just have primary button
export function Button({
  children,
  className = "",
  onClick,
  type = "button",
  disabled = false,
}: ButtonProps) {
  return (
    <ButtonBase
      className={`px-4 py-2 bg-buttonPrimary hover:bg-primary-200 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none ${
        className ?? ""
      }`}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </ButtonBase>
  );
}
