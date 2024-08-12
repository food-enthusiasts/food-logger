import type { ActionFunctionArgs } from "@remix-run/node";

import { Form, useLoaderData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";

import { Stack } from "../components/Stack";
import { Button } from "../components/Button";

export async function action({ request }: ActionFunctionArgs) {
  console.log("getting a register request", request);
  const body = await request.formData();

  console.log("the req body", body);

  return redirect("/");
}

export async function loader() {
  console.log("loading register data!");
  return json({ thing: "this is a test" });
}

export default function RegisterPage() {
  const data = useLoaderData();
  console.log("we have data?", data);

  return (
    <Stack className="sm:mx-auto sm:w-full sm:max-w-sm py-8 shadow-lg rounded-md">
      <div className="py-6">
        {/* leading-* changes line-height, tracking-* changes letter-spacing */}
        <h2 className="text-center text-2xl leading-9 tracking-tight">
          Sign up for an account
        </h2>
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-sm px-4 py-6">
        <Form action="/register" method="post" className="flex flex-col gap-4">
          <Stack>
            <label htmlFor="email">Username</label>
            <input
              name="username"
              type="text"
              id="username"
              className="px-1.5 py-1 border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
            ></input>
          </Stack>
          <Stack>
            <label htmlFor="email">Email</label>
            <input
              name="email"
              type="email"
              id="email"
              autoComplete="email"
              className="px-1.5 py-1 border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
            ></input>
          </Stack>
          <Stack>
            <label htmlFor="password">Password</label>
            <input
              name="password"
              type="password"
              id="password"
              className="px-1.5 py-1 border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-400 sm:text-sm"
            ></input>
          </Stack>
          {/* 
            because a flex col defaults to align-items: stretch, just placing the
            Button in a Stack will make the Button stretch to take up the full width
            - alternatively, could give the button 100% width through className w-full
          */}
          <Stack className="pt-4">
            <Button className="bg-primary-300" type="submit">
              Submit
            </Button>
          </Stack>
        </Form>
      </div>
    </Stack>
  );
}
