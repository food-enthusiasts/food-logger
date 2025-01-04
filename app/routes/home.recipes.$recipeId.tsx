import { redirect, json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";

import { requireUserId } from "~/session.server";

import { useLoaderData, Link } from "@remix-run/react";

import { RecipeService } from "~/services/recipe.server";

import { ButtonBase } from "~/components/ButtonBase";
import { LinkButton } from "~/components/LinkButton";
import { Row } from "~/components/Row";
import { Stack } from "~/components/Stack";
import { Typography } from "~/components/Typography";
import { HorizontalDivider } from "~/components/HorizontalDivider";

// error boundary remix docs - https://remix.run/docs/ja/main/guides/errors
// export function ErrorBoundary() {
//   const error = useRouteError() as { message: string };

//   return <div>{error.message}</div>;
// }

export async function loader({ request, params }: LoaderFunctionArgs) {
  try {
    // requireUserId() returns a userId as a number, but we don't need it here
    // simply calling it to make sure a logged in user is visiting this page
    await requireUserId(request);

    // need to call function to get user session from request?
    const recipeId = params.recipeId;

    // can Number() throw?
    // need to try parsing recipeId from url
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

// probably don't need this action here, might create another route where user can edit recipe, in which case action will be useful
// maybe home.recipes.$recipeIdx.edit route
// export async function action({ request }: LoaderFunctionArgs) {
//   const newRecipeSchema = z
//     .object({
//       userId: z.number(),
//       recipeName: z.string().min(1),
//       ingredientsList: z.array(z.string().min(1)),
//       recipeSteps: z.array(z.string().min(1)).nonempty(),
//     })
//     .strict();

//   const userId = await getUserIdFromSession(request);

//   const formData = await request.formData();

//   const recipeName = formData.get("recipeName");
//   const ingredientsList = formData.getAll("ingredients");
//   const stepsList = formData.getAll("steps");

//   // zod parsing can throw
//   const parsedRecipe = newRecipeSchema.parse({
//     userId,
//     recipeName,
//     ingredientsList,
//     recipeSteps: stepsList,
//   });

//   // probably do db update here - can throw
//   const recipeService = new RecipeService();
//   recipeService.addNewRecipe({
//     ...parsedRecipe,
//   });

//   return redirect("/home/recipes");
// }

export default function ViewRecipe() {
  const data = useLoaderData<typeof loader>();

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
          <Typography variant="h5">Ingredients</Typography>
          <ul>
            {recipeData.ingredientList.map((ingItem) => {
              return <Typography key={ingItem}>{ingItem}</Typography>;
            })}
          </ul>
        </div>
        <HorizontalDivider />
        <div>
          <Typography variant="h5">Steps</Typography>
          <ol className="list-decimal list-inside">
            {recipeData.recipeSteps.map((stepItem) => {
              return <li key={stepItem}>{stepItem}</li>;
            })}
          </ol>
        </div>
        <Row className="gap-4 justify-end">
          <LinkButton toHref="./edit" type="text">
            Edit
          </LinkButton>
          <ButtonBase className="text-destructive">Delete</ButtonBase>
        </Row>
      </Stack>
    </Stack>
  );
}
