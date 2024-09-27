import type { ComponentProps } from "react";

// article explaining how to extend base html component props in react:
// https://www.sitepoint.com/html-element-extend-properties-typescript/
interface InputProps extends ComponentProps<"input"> {}

export function Input({ ...props }: InputProps) {
  return (
    <input
      className={`px-2 py-2 border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm focus:outline-none ${
        props.className ?? ""
      }`}
      {...props}
    ></input>
  );
}
