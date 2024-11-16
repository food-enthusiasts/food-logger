// kind of just copying from material ui typography source without really understanding intention behind it
// https://github.com/mui/material-ui/blob/v6.1.6/packages/mui-material/src/Typography/Typography.js

class InvalidTypographyError extends Error {}

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
  component?: // the underlying html element
  | "p"
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "subtitle1"
    | "subtitle2"
    | "body1"
    | "body2";
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

// using material design typographic scale font sizes here
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
  component,
  variant,
}: TypographyProps) {
  // if component prop is not passed in (aka is undefined) default to "p"
  component = component ?? "p";
  // try to match variant to component unless compoent is p, in which case map p component
  // to paragraph variant. If no variant passed in, default to paragraph
  variant = component === "p" ? "paragraph" : component;
  console.log(`the component ${component}, and the variant ${variant}`);

  // choose default styles based on the variant chosen
  const defaultStyles = defaultVariantMappingStyles[variant];
  switch (component) {
    case "p":
      return <p className={className ?? defaultStyles}>{children}</p>;
    case "body1":
      return <p className={className ?? defaultStyles}>{children}</p>;
    case "body2":
      return <p className={className ?? defaultStyles}>{children}</p>;
    case "h1":
      return <h1 className={className ?? defaultStyles}>{children}</h1>;
    case "h2":
      return <h2 className={className ?? defaultStyles}>{children}</h2>;
    case "h3":
      return <h3 className={className ?? defaultStyles}>{children}</h3>;
    case "h4":
      return <h4 className={className ?? defaultStyles}>{children}</h4>;
    case "h5":
      return <h5 className={className ?? defaultStyles}>{children}</h5>;
    case "h6":
      return <h6 className={className ?? defaultStyles}>{children}</h6>;
    case "subtitle1":
      return <h6 className={className ?? defaultStyles}>{children}</h6>;
    case "subtitle2":
      return <h6 className={className ?? defaultStyles}>{children}</h6>;
    default:
      throw new InvalidTypographyError(
        `invalid typography component passed: ${component}`
      );
  }
}
