import { Link } from "@remix-run/react";

import { Stack } from "~/components/Stack";

export default function HomeMeals() {
  return (
    <div>
      <Stack>
        <Link to="/home">Back to home</Link>
        <h1>Hello Meals</h1>
      </Stack>
    </div>
  );
}
