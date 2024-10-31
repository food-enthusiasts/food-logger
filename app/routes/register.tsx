import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { Form, useActionData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";

import { z } from "zod";

import { createUserSession, getUserIdFromSession } from "~/session.server";

import { Stack } from "~/components/Stack";
import { Button } from "~/components/Button";
import { Input } from "~/components/Input";

import {
  UserService,
  ExistingUsernameOrEmailError,
} from "~/services/user.server";

// steps
// 1. call method from session module to ensure user we're not dealing with a logged in user, redirect to home if logged in
// 2. validate data with zod to make sure working with correct shape
// 3. pass validated data to user service to create the user, perform validations here?
// 3a. user service calls user repo to actually interact with db and persist user to the db
// 4. after getting back returned user id from the user service call, save user to session and redirect to /home
// or some other route (haven't made this yet) representing user's home page
// to consider: error handling? what if zod throws? what if user service throws? what if user repo throws?
export async function action({ request }: ActionFunctionArgs) {
  try {
    const isLoggedIn = (await getUserIdFromSession(request)) !== undefined;

    if (isLoggedIn) {
      return redirect("/home");
    }

    const formData = Object.fromEntries(await request.formData());
    const registerUserSchema = z
      .object({
        username: z.string(),
        email: z.string().email(),
        password: z.string(),
      })
      // use strict() call here to ensure we only handle the fields defined above. If the form sends another field
      // that isn't mentioned above, this will throw a ZodError
      // by default, however, if we receive an unexpected field then zod would silently drop it from the parsed object
      .strict();

    // html input validation for email allows for a string like 'asd@example', but zod throws an error here when
    // trying to parse it as an email so this can potentially throw when using default html email validation (which
    // is what I am doing currently)
    const coercedFormData = registerUserSchema.parse(formData);

    // some password validations
    if (
      typeof coercedFormData.password !== "string" ||
      coercedFormData.password.length === 0
    )
      // using this error response structure from https://github.com/remix-run/examples/blob/main/_official-blog-tutorial/app/routes/login.tsx
      // feels a little clunky but I just want to standardize on something for now, come back to later
      return json(
        {
          errors: {
            email: null,
            password: "Password is required",
            unknown: null,
          },
        },
        { status: 400 }
      );
    if (coercedFormData.password.length < 8)
      return json(
        {
          errors: {
            email: null,
            password: "Password is too short",
            unknown: null,
          },
        },
        { status: 400 }
      );

    const userService = new UserService();
    const newUserId = await userService.registerUser({
      ...coercedFormData,
    });

    console.log("id?", newUserId);

    return await createUserSession({
      request,
      userId: newUserId,
      redirectTo: "/home",
    });
  } catch (err) {
    console.error("Dealing with err in register action", err);

    // do some logic to try to extract zod validation errors. For now just assuming zod will only fail to parse emails
    // and not passwords or usernames
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

    if (err instanceof ExistingUsernameOrEmailError) {
      return json(
        {
          errors: {
            email: "Email or username already in use",
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
export default function RegisterPage() {
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
          <h2 className="text-center text-2xl leading-9 tracking-tight">
            Sign up for an account
          </h2>
        </div>
        <div className="sm:mx-auto sm:w-full sm:max-w-sm px-4 py-6">
          <Form
            action="/register"
            method="post"
            className="flex flex-col gap-4"
          >
            <Stack>
              <label htmlFor="username">Username</label>
              <Input name="username" type="text" id="username"></Input>
            </Stack>
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
    </>
  );
}
