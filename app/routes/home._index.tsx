import { Link } from "@remix-run/react";

import { Row } from "~/components/Row";
import { Stack } from "~/components/Stack";

export default function HomeIndex() {
  return (
    <div>
      <Stack>
        <Row className="justify-around">
          <Link to="./recipes">Recipes</Link>
          <Link to="./meals">Cooked Meals</Link>
        </Row>
      </Stack>
      <Stack>Top X Recipes</Stack>
      <Stack>Top X Meals</Stack>
    </div>
  );
}
