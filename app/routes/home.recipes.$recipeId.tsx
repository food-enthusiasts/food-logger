import { redirect, json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";

import { requireUserId } from "~/session.server";

import { RecipeService } from "~/services/recipe.server";

import { Stack } from "~/components/Stack";
import { ButtonBase } from "~/components/ButtonBase";
import { LinkButton } from "~/components/LinkButton";
import { Row } from "~/components/Row";
import { Typography } from "~/components/Typography";
import { HorizontalDivider } from "~/components/HorizontalDivider";

// error boundary remix docs - https://remix.run/docs/ja/main/guides/errors
// and sample code - https://github.com/kentcdodds/onewheel-blog/blob/main/app/routes/posts/admin/%24slug.tsx
// export function ErrorBoundary() {
//   const error = useRouteError() as { message: string };

//   return <div>{error.message}</div>;
// }

export async function loader({ request, params }: LoaderFunctionArgs) {
  console.log("loading in home.recipes.$recipeId");
  try {
    // requireUserId() returns a userId as a number, but we don't need it here
    // simply calling it to make sure a logged in user is visiting this page
    await requireUserId(request);

    // need to call function to get user session from request?
    const recipeId = params.recipeId;

    // can Number() throw?
    // need to try parsing recipeId from url
    // maybe use zod for this instead?
    if (Number.isNaN(Number(recipeId))) throw redirect("/");
    const parsedRecipeId = Number(recipeId);

    if (parsedRecipeId === undefined) throw redirect("/login");

    const recipeService = new RecipeService();
    const userRecipe = await recipeService.findRecipeById(parsedRecipeId);

    if (!userRecipe) {
      throw new Response(null, { status: 404, statusText: "recipe not found" });
    }

    return json({ data: { recipe: userRecipe } });
  } catch (err) {
    console.error("err in loader home/recipes/$recipeId");
    if (err instanceof Response) throw err;

    throw new Response(null, { status: 500, statusText: "server error" });
  }
}

export default function ViewRecipe() {
  const data = useLoaderData<typeof loader>();

  // question: possible to refetch data after submitting data? aka revalidate recipe data after updating it?
  // answer: apparently all loaders matching the route load after an action so revalidation taken care of?

  // question: how would I toggle the editing state back to false after submitting the form? If I redirected to the same route, would that
  // reset the state?
  // answer: redirecting back to same route does not reset state

  // question: if I go the route of trying to render a home/recipes/$recipeId/edit route with a conditional <Outlet />, is it
  // hacky to do something like read last part of url and check if it is the string "edit"? Then conditionally render the
  // <Outlet />, and if we're not editing then simply render the recipe details?
  // answer: can use useSearchParams to read and write search params, and use an "edit" param to determine if we are editing
  // NOTE: not sure that this is ideal overall bc when we call setSearchParams() it performs a navigation and reloads all routes
  // and in this instance doesn't seem necessary to do so since we already have all required recipeData. I noticed that clicking
  // the "Edit" button takes a little to display the edit form seemingly bc we have to run all the loaders for the current route

  // using isEditing react state might be the better option here bc it doesn't call loaders at least, not sure if can run into issues with
  // data staleness from not calling loaders?

  // 5/4/2025 - referencing above comments, i opted to make separate route at "/home/recipes/edit/$recipeId"
  // so that don't have to worry about rendering an outlet or maintaining react state here just to render and edit page

  // recipeData realistically should only ever be null when we get a 404 aka no data found for given recipe id
  // and we return a 404 response in case of a null recipe, so some error boundary (default or one I defined) should catch
  // and handle the case of null recipeData
  const recipeData = data.data.recipe;

  return (
    <Stack className="w-full md:max-w-screen-sm px-4 py-8 shadow-lg rounded-md">
      <Link to="/home/recipes">Back to Recipes</Link>
      <Stack className="gap-4">
        <Typography variant="h4" component="h4">
          {recipeData.recipeName}
        </Typography>
        <HorizontalDivider />
        <div>
          <Typography variant="h5" component="h5">
            Ingredients
          </Typography>
          <ol className="list-decimal list-inside">
            {recipeData.ingredientList.map((ingItem) => {
              return (
                <li key={ingItem}>
                  <Typography className="inline">{ingItem}</Typography>
                </li>
              );
            })}
          </ol>
        </div>
        <HorizontalDivider />
        <div>
          <Typography variant="h5" component="h5">
            Steps
          </Typography>
          <ol className="list-decimal list-inside">
            {recipeData.recipeSteps.map((stepItem) => {
              return <li key={stepItem}>{stepItem}</li>;
            })}
          </ol>
        </div>
        <Row className="gap-4 justify-end">
          <LinkButton
            toHref={`/home/recipes/edit/${recipeData.id}`}
            type="text"
          >
            Edit
          </LinkButton>
          <ButtonBase className="text-destructive">Delete</ButtonBase>
        </Row>
      </Stack>
    </Stack>
  );
}
