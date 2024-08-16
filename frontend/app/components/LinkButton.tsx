import { Link } from "@remix-run/react";
import { ReactNode } from "react";

interface LinkButtonProps {
  children: ReactNode;
  className?: string;
  toHref: string;
  type: "filled" | "text";
}

export function LinkButton({
  children,
  toHref,
  className = "",
  type = "text",
}: LinkButtonProps) {
  switch (type) {
    case "filled":
      return (
        <Link
          className={`bg-buttonPrimary hover:bg-primary-200 focus:ring-2 focus:ring-blue-500 rounded text-sm px-5 py-2.5 focus:outline-none ${
            className ?? ""
          }`}
          to={toHref}
        >
          {children}
        </Link>
      );
    case "text":
      return (
        <Link
          className={`focus:ring-2 hover:underline focus:ring-blue-500 rounded text-sm px-5 py-2.5 focus:outline-none ${
            className ?? ""
          }`}
          to={toHref}
        >
          {children}
        </Link>
      );
    default:
      return (
        <Link
          className={`focus:ring-2 hover:underline focus:ring-blue-500 rounded text-sm px-5 py-2.5 focus:outline-none ${
            className ?? ""
          }`}
          to={toHref}
        >
          {children}
        </Link>
      );
  }

  return (
    <Link
      className={`bg-buttonPrimary hover:bg-primary-200 focus:ring-2 focus:ring-blue-500 rounded text-sm px-5 py-2.5 focus:outline-none ${
        className ?? ""
      }`}
      to={toHref}
    >
      {children}
    </Link>
  );
}
