import { getUserIdFromSession } from "~/session.server";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";

import { json, redirect } from "@remix-run/node";

import { Stack } from "../components/Stack";

export async function action({ request }: ActionFunctionArgs) {
  console.log("getting a request from /home", request);
  const body = await request.formData();

  console.log("the home req body", body);

  return redirect("/home");
}

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserIdFromSession(request);

  if (!userId) return redirect("/login");

  // fetch data for user's recipes and created dishes
  // use zod here for formatting and typing?

  console.log("loading data for /home!");
  return json({ thing: "this is a home test" });
}

export default function Home() {
  const data = useLoaderData<typeof loader>();
  data;
  return (
    <Stack>
      <Outlet />
    </Stack>
  );
}
