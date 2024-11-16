// kind of just copying from material ui typography source without really understanding intention behind it
// https://github.com/mui/material-ui/blob/v6.1.6/packages/mui-material/src/Typography/Typography.js
class InvalidTypographyError extends Error {}

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
  component?: // the underlying html element
  "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "span" | "p";
  variant?: // the "style" of the element indpendent of the actual html
  | "paragraph"
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "subtitle1"
    | "subtitle2"
    | "body1"
    | "body2"
    | "button";
}

// using material design typographic scale font sizes here https://m2.material.io/design/typography/the-type-system.html#type-scale
// honestly don't understand font design very much so I'm just copying values and
// translating them to tailwind classes. In cases where tailwind doesn't provide an
// exact value to match the material design value, I'll use the closes tw class and note it down
// as a comment
// also noticed that the material design page doesn't mention line-height while tw classes do apply some
// so that will probably cause some visual differences
const defaultVariantMappingStyles = {
  h1: "text-8xl font-light",
  h2: "text-6xl font-light",
  h3: "text-5xl font-normal",
  h4: "text-3xl font-normal", // material design specifies 34px, but text-3xl is 36px
  h5: "text-2xl font-normal",
  h6: "text-xl font-medium",
  subtitle1: "text-base font-normal",
  subtitle2: "text-sm font-medium",
  body1: "text-base font-normal",
  body2: "text-sm font-normal",
  button: "text-sm font-medium",
  paragraph: "text-base font-normal",
};

// I'm sure there's a better way to decide which html tag to use, but I want to use this component sooner than later so will
// just go with straightforward implementation of a swtich statement
export function Typography({
  children,
  className,
  component = "p",
  variant = "paragraph",
}: TypographyProps) {
  // choose default styles based on the variant chosen
  const defaultStyles = defaultVariantMappingStyles[variant];

  switch (component) {
    case "p":
      return (
        <p
          className={
            className !== undefined
              ? `${defaultStyles} ${className.trim()}`
              : defaultStyles
          }
        >
          {children}
        </p>
      );
    case "span":
      return (
        <span
          className={
            className !== undefined
              ? `${defaultStyles} ${className.trim()}`
              : defaultStyles
          }
        >
          {children}
        </span>
      );
    case "h1":
      return (
        <h1
          className={
            className !== undefined
              ? `${defaultStyles} ${className.trim()}`
              : defaultStyles
          }
        >
          {children}
        </h1>
      );
    case "h2":
      return (
        <h2
          className={
            className !== undefined
              ? `${defaultStyles} ${className.trim()}`
              : defaultStyles
          }
        >
          {children}
        </h2>
      );
    case "h3":
      return (
        <h3
          className={
            className !== undefined
              ? `${defaultStyles} ${className.trim()}`
              : defaultStyles
          }
        >
          {children}
        </h3>
      );
    case "h4":
      return (
        <h4
          className={
            className !== undefined
              ? `${defaultStyles} ${className.trim()}`
              : defaultStyles
          }
        >
          {children}
        </h4>
      );
    case "h5":
      return (
        <h5
          className={
            className !== undefined
              ? `${defaultStyles} ${className.trim()}`
              : defaultStyles
          }
        >
          {children}
        </h5>
      );
    case "h6":
      return (
        <h6
          className={
            className !== undefined
              ? `${defaultStyles} ${className.trim()}`
              : defaultStyles
          }
        >
          {children}
        </h6>
      );
    default:
      throw new InvalidTypographyError(
        `invalid typography component passed: ${component}`
      );
  }
}
