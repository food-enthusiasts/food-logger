import type { ReactNode } from "react";

interface StackProps {
  children: ReactNode;
  className?: string;
}

// thinking of Stack as a base component that has minimal styles, and I derive more specific styles, gaps, etc for specific use cases
export function Stack({ children, className }: StackProps) {
  const componentClassname = `flex flex-col ${className ?? ""}`.trim();

  return <div className={componentClassname}>{children}</div>;
}

// for example, I intend to use StackedInputs to contain Inputs used in forms, and would like to maintain consistent
// styles such as gap throughout any forms I create
export function StackedInputs({ children, className }: StackProps) {
  const componentClassname = `gap-y-4 ${className ?? ""}`.trim();

  return <Stack className={componentClassname}>{children}</Stack>;
}
