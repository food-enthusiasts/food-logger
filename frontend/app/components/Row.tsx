import type { ReactNode } from "react";

interface RowProps {
  children: ReactNode;
  className?: string;
}

export function Row({ children, className }: RowProps) {
  return <div className={`flex ${className}`}>{children}</div>;
}
