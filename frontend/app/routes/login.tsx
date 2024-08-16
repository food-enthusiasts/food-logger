import type { ActionFunctionArgs } from "@remix-run/node";

import { Form } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";

import { Button } from "../components/Button";
import { Stack } from "../components/Stack";
import { Input } from "../components/Input";

export async function action({ request }: ActionFunctionArgs) {
  console.log("getting a request", request);
  const body = await request.formData();

  console.log("the req body", body);

  return redirect("/");
}

export async function loader() {
  console.log("loading data!");
  return json({ thing: "this is a test" });
}

// referenced the following tailwind ui page extensively for implementation of this component
// https://tailwindui.com/components/application-ui/forms/sign-in-forms#component-766a0bf1b8800d383b6c5b77ef9c626c
export default function Login() {
  return (
    <Stack className="sm:mx-auto sm:w-full sm:max-w-sm py-8 shadow-lg rounded-md">
      <div className="py-6">
        {/* leading-* changes line-height, tracking-* changes letter-spacing */}
        <p className="text-center text-2xl leading-9 tracking-tight">
          Sign into your account
        </p>
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-sm px-4 py-6">
        <Form action="/login" method="post" className="flex flex-col gap-4">
          <Stack>
            <label htmlFor="email">Email</label>
            <Input
              name="email"
              type="email"
              id="email"
              autoComplete="email"
            ></Input>
          </Stack>
          <Stack>
            <label htmlFor="password">Password</label>
            <Input name="password" type="password" id="password"></Input>
          </Stack>
          {/* 
            because a flex col defaults to align-items: stretch, just placing the
            Button in a Stack will make the Button stretch to take up the full width
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
