import type { LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";

import { json, redirect } from "@remix-run/node";

import { getUserIdFromSession } from "~/session.server";

import { Stack } from "~/components/Stack";

export async function loader({ request }: LoaderFunctionArgs) {
  // we're already getting userId from loader in home.tsx, can we share it somehow?
  // based on this github discussion, doesn't seem possible to share data between loaders
  // https://github.com/remix-run/remix/discussions/2115
  const userId = await getUserIdFromSession(request);

  // we're already doing this check in home.tsx, is this necessary to repeat here?
  if (!userId) return redirect("/login");

  return json({ data: "whoah" }, { status: 200 });
}

export default function HomeRecipes() {
  const data = useLoaderData<typeof loader>();
  data;

  return (
    <div>
      <Stack>
        <Link to="/home">Back to home</Link>
        <h1>Hello recipes</h1>
        <Outlet />
      </Stack>
    </div>
  );
}
