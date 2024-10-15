import type { ReactNode } from "react";

interface BoxProps {
  children: ReactNode;
  className?: string;
}

// my idea behind Box component is I want a generic container element with basically no styles applied by default
// so in cases where I'm not sure if I don't specifically want to use flex box or grid and associated
// components (e.g. <Stack>, <Row>, etc) I can use a Box and apply styles as I see fit

// realistically, having a Box probably makes more sense in the context of an actual design system than whatever I'm doing right now
// (basically just creating reusable components that aren't actually part of a design system), but I see this as more
// of an exercise in creating my own generic components and maybe learning actual design system patterns as I fumble along

// TOOD: the Atlassian docs below mention a Box as being theme aware, so maybe I can implement that here somehow

// Atlassian design system docs for their Box component - https://atlassian.design/components/primitives/box/examples
// Material UI docs for their Box component - https://mui.com/material-ui/react-box/
export function Box({ children, className }: BoxProps) {
  return <div className={`${className ?? ""}`}>{children}</div>;
}
