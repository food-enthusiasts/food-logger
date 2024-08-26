import { render, screen } from "@testing-library/react";
import { Button } from "./Button";

describe("Testing a Button component", () => {
  test("it should render", () => {
    render(<Button>Hello</Button>);

    const button = screen.getByRole("button", { name: /hello/i });

    expect(button).toBeDefined();
  });
});
