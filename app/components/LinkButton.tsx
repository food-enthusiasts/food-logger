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
  let componentClassName = "";
  switch (type) {
    case "filled":
      componentClassName =
        `bg-buttonPrimary hover:bg-primary-200 focus:ring-2 focus:ring-blue-500 rounded px-5 py-2.5 focus:outline-none ${
          className ?? ""
        }`.trim();
      return (
        <Link className={componentClassName} to={toHref}>
          {children}
        </Link>
      );
    case "text":
      componentClassName =
        `focus:ring-2 hover:underline focus:ring-blue-500 rounded px-5 py-2.5 focus:outline-none ${
          className ?? ""
        }`.trim();
      return (
        <Link className={componentClassName} to={toHref}>
          {children}
        </Link>
      );

    default:
      componentClassName =
        `focus:ring-2 hover:underline focus:ring-blue-500 rounded px-5 py-2.5 focus:outline-none ${
          className ?? ""
        }`.trim();
      return (
        <Link className={componentClassName} to={toHref}>
          {children}
        </Link>
      );
  }
}
