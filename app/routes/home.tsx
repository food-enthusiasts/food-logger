import type { ActionFunctionArgs } from "@remix-run/node";

// import { Form } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";

// import { Button } from "../components/Button";
import { Stack } from "../components/Stack";
// import { Input } from "../components/Input";

export async function action({ request }: ActionFunctionArgs) {
  console.log("getting a request from /home", request);
  const body = await request.formData();

  console.log("the home req body", body);

  return redirect("/home");
}

export async function loader() {
  console.log("loading data for /home!");
  return json({ thing: "this is a home test" });
}

export default function Home() {
  return <Stack>Hello World</Stack>;
}
