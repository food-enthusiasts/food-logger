import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { Form, useActionData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";

import { z } from "zod";

import { getUserIdFromSession, createUserSession } from "~/session.server";
import { UserService } from "~/services/user.server";

import { Button } from "~/components/Button";
import { Stack } from "~/components/Stack";
import { Input } from "~/components/Input";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = Object.fromEntries(await request.formData());
    const loginFormSchema = z
      .object({
        email: z.string().email(),
        password: z.string(),
      })
      .strict();

    // this would throw if the email string we receive from the front end
    // is not formatted as asd@domain.com, default html email validation would
    // allow asd@domain for example
    const coercedFormData = loginFormSchema.parse(formData);

    const userService = new UserService();
    const verifiedUser = userService.verifyLogin({ ...coercedFormData });

    if (!verifiedUser)
      return json(
        {
          errors: {
            email: "Invalid email or password",
            password: null,
            unknown: null,
          },
        },
        { status: 400 }
      );

    return createUserSession({ request, userId: 1, redirectTo: "/home" });
  } catch (err) {
    // this would handle cases where zod throws a validation error, e.g. for
    // email format
    if (
      err instanceof z.ZodError &&
      err.issues[0].message === "Invalid email"
    ) {
      return json(
        {
          errors: {
            email: "Email is not in a valid format",
            password: null,
            unknown: null,
          },
        },
        { status: 400 }
      );
    }

    return json(
      {
        errors: {
          email: null,
          password: null,
          unknown: "Could not process request",
        },
      },
      { status: 500 }
    );
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  // attempt to read a userId from the session. If it exists, means we have a logged in user and should redirect
  // them to their home page
  const userId = await getUserIdFromSession(request);
  if (userId) return redirect("/home");
  return json({});
}

// referenced the following tailwind ui page extensively for implementation of this component
// https://tailwindui.com/components/application-ui/forms/sign-in-forms#component-766a0bf1b8800d383b6c5b77ef9c626c
export default function Login() {
  const actionData = useActionData<typeof action>();

  return (
    <>
      {actionData?.errors.email ? (
        <Stack>{actionData?.errors.email}</Stack>
      ) : null}
      {actionData?.errors.password ? (
        <Stack>{actionData?.errors.password}</Stack>
      ) : null}
      {actionData?.errors.unknown ? (
        <Stack>{actionData?.errors.unknown}</Stack>
      ) : null}
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
    </>
  );
}
