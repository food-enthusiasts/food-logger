import type { ReactNode } from "react";

interface RowProps {
  children: ReactNode;
  className?: string;
}

export function Row({ children, className }: RowProps) {
  const componentClassname = `flex ${className ?? ""}`.trim();

  return <div className={componentClassname}>{children}</div>;
}
