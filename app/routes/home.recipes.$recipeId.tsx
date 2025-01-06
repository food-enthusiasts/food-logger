import { redirect, json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, Form } from "@remix-run/react";
import { useState } from "react";

import { z } from "zod";

import { requireUserId } from "~/session.server";

import { RecipeService } from "~/services/recipe.server";

import { Button } from "~/components/Button";
import { Input } from "~/components/Input";
import { Stack, StackedInputs } from "~/components/Stack";
import { ButtonBase } from "~/components/ButtonBase";
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

const updateRecipeSchema = z
  .object({
    userId: z.number(),
    recipeId: z.preprocess((id) => {
      return parseInt(z.string().parse(id), 10);
    }, z.number()),
    recipeName: z.string().min(1).optional(),
    // 1/6/2024 - by applying .nonempty() zod method to z.array(), results in an output type of
    // [string, ...string[]] whereas providing my own .refine() callback to reject non-empty arrays can give me the type string[]
    // the [string, ...string[]] type is more accurate to my needs, i.e. I want to know I'm working with a non-empty array type
    // but I'm not sure what validations I can do on the data I'm getting back from the db to indicate that I'm getting a non-empty
    // based on this SO thread (https://stackoverflow.com/questions/56006111/is-it-possible-to-define-a-non-empty-array-type-in-typescript)
    // seems like working with the non-empty array type might not be worth the trouble, and I'm tempted to just keep the type as a
    // string[] while doing runtime checks to make sure that the array is non-empty
    ingredientList: z
      .array(z.string().min(1))
      .refine((arrVal) => arrVal.length > 0, {
        message: "Passed in empty string array for ingredientList",
      })
      .optional(),
    recipeSteps: z
      .array(z.string().min(1))
      .refine((arrVal) => arrVal.length > 0, {
        message: "Passed in empty string array for ingredientList",
      })
      .optional(),
  })
  .strict();

// probably don't need this action here, might create another route where user can edit recipe, in which case action will be useful
// maybe home.recipes.$recipeIdx.edit route
export async function action({ request, params }: LoaderFunctionArgs) {
  try {
    const userId = await requireUserId(request);

    const formData = await request.formData();

    const recipeName = formData.get("recipeName");
    const ingredientList = formData.getAll("ingredients");
    const stepsList = formData.getAll("steps");
    const recipeId = params.recipeId;

    // zod parsing can throw
    const parsedRecipe = updateRecipeSchema.parse({
      userId,
      recipeId,
      recipeName,
      ingredientList,
      recipeSteps: stepsList,
    });

    return redirect("..");

    // probably do db update here - can throw
    const recipeService = new RecipeService();
    recipeService.updateRecipe(parsedRecipe.recipeId, {
      ...parsedRecipe,
    });

    return redirect("/home/recipes");
  } catch (e) {
    console.error("error in action home/recipes/$recipeId", e);
    // do something different here? return some errors for the form?

    // probably do something different in case e is instanceof ZodError
    if (e instanceof z.ZodError) {
      console.log("issues on the zod error", e.issues);
    }

    throw redirect("/home/recipes");
  }
}

export default function ViewRecipe() {
  const data = useLoaderData<typeof loader>();
  const [isEditing, setIsEditing] = useState(false);

  function toggleEditState() {
    setIsEditing(!isEditing);
  }

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

  // recipeData realistically should only ever be null when we get a 404 aka no data found for given recipe id
  // and we return a 404 response in case of a null recipe, so some error boundary (default or one I defined) should catch
  // and handle the case of null recipeData
  const recipeData = data.data.recipe;

  // function toggleEdit() {
  //   if (isEditing) {
  //     setSearchParams();
  //   } else {
  //     const editParams = new URLSearchParams();
  //     editParams.set("edit", "true");
  //     setSearchParams(editParams);
  //   }
  // }

  return (
    <Stack className="w-full md:max-w-screen-sm px-4 py-8 shadow-lg rounded-md">
      <Link to="/home/recipes">Back to Recipes</Link>
      {isEditing ? (
        // github discussion here? - https://github.com/colinhacks/zod/issues/3035
        // might be able to use refine() and transform() to type as string[] per https://github.com/colinhacks/zod/issues/3035#issuecomment-1849115748
        <RecipeUpdateForm recipe={recipeData} />
      ) : (
        <Stack className="gap-4">
          <Typography variant="h4" component="h4">
            {recipeData.recipeName}
          </Typography>
          <HorizontalDivider />
          <div>
            <Typography variant="h5" component="h5">
              Ingredients
            </Typography>
            <ul>
              {recipeData.ingredientList.map((ingItem) => {
                return <Typography key={ingItem}>{ingItem}</Typography>;
              })}
            </ul>
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
            <ButtonBase onClick={toggleEditState}>
              {isEditing ? "Cancel" : "Edit"}
            </ButtonBase>
            <ButtonBase className="text-destructive">Delete</ButtonBase>
          </Row>
        </Stack>
      )}
    </Stack>
  );
}

// require all fields from zod recipe schema, but exclude recipeId bc we can read
// that from url route params (not search params)
interface RecipeFormProps {
  recipe: Omit<Required<z.infer<typeof updateRecipeSchema>>, "recipeId">;
}

function RecipeUpdateForm({ recipe }: RecipeFormProps) {
  // have to somehow relate the ingredientsCountList and stepsCountList state with ingredientList and recipeSteps coming from
  // the existing recipe

  // what if init state with recipe.ingredientList to have Array<{id: number; val: string;}>
  // where we generate the id on item creation with crypto.randomUUID(), or for existing items, when we create state from props
  const [ingredientFieldList, setIngredientFieldList] = useState(
    recipe.ingredientList.map((ingVal) => {
      return { id: crypto.randomUUID(), val: ingVal };
    })
  );
  const [stepsFieldList, setStepsCountList] = useState(
    recipe.recipeSteps.map((stepVal) => {
      return { id: crypto.randomUUID(), val: stepVal };
    })
  );

  function addIngredientField() {
    setIngredientFieldList([
      ...ingredientFieldList,
      { id: crypto.randomUUID(), val: "" },
    ]);
  }

  function deleteIngredientField(ingFieldId: string) {
    // if ingredientsCount is an array that is offset by 1, aka value
    // at idx 0 is 1 all the way to idx + 1, if we filter the array to remove say
    // idx 3 aka step 4, what does this look like?
    setIngredientFieldList(
      ingredientFieldList.filter((ingObj) => ingObj.id !== ingFieldId)
    );
  }

  function addStepField() {
    setStepsCountList([
      ...stepsFieldList,
      { id: crypto.randomUUID(), val: "" },
    ]);
  }

  function deleteStepField(stepId: string) {
    setStepsCountList(stepsFieldList.filter((step) => step.id !== stepId));
  }

  return (
    <Form method="PATCH" className="sm:px-4">
      <Stack className="gap-y-6">
        <Stack>
          <label htmlFor="recipeName">
            <Typography variant="h4" component="h4">
              Recipe Name
            </Typography>
          </label>
          <Input
            name="recipeName"
            type="text"
            id="recipeName"
            defaultValue={recipe.recipeName}
            required
            onBlur={(event) => {
              const input = event.target;

              if (input.value.trim().length < 5)
                input.setCustomValidity(
                  "Recipe name must be longer than 5 characters"
                );
            }}
            onChange={(event) => {
              const input = event.target;

              if (input.value.trim().length >= 5) input.setCustomValidity("");
            }}
          ></Input>
        </Stack>
        <Stack>
          <Stack>
            <Typography variant="h5" component="h5">
              Ingredients
            </Typography>
          </Stack>
          <StackedInputs>
            {ingredientFieldList.map((ingredientField, ingredientIdx) => {
              return (
                <Row
                  key={`ingredient-${ingredientField.id}`}
                  className="justify-between"
                >
                  <label
                    htmlFor={`ingredients-${ingredientField.id}`}
                    className="sr-only"
                  >
                    {`ingredient ${ingredientIdx + 1}`}
                  </label>
                  <Input
                    name="ingredients"
                    type="text"
                    id={`ingredients-${ingredientField.id}`}
                    className="flex-1"
                    required
                    defaultValue={ingredientField.val}
                  ></Input>
                  {ingredientIdx > 0 ? (
                    <ButtonBase
                      className="px-4"
                      onClick={() => deleteIngredientField(ingredientField.id)}
                    >
                      X
                    </ButtonBase>
                  ) : (
                    <div aria-hidden className="px-4 invisible">
                      X
                    </div>
                  )}
                </Row>
              );
            })}
            <Button className="sm:w-1/2" onClick={addIngredientField}>
              Add Ingredient
            </Button>
          </StackedInputs>
        </Stack>
        <Stack>
          <Stack>
            <Typography variant="h5" component="h5">
              Steps
            </Typography>
          </Stack>
          <StackedInputs>
            {stepsFieldList.map((stepCountField, stepCountIdx) => {
              return (
                <Row
                  key={`step-${stepCountField.id}`}
                  className="justify-between"
                >
                  <label
                    htmlFor={`steps-${stepCountField.id}`}
                    className="sr-only"
                  >
                    {`step ${stepCountIdx + 1}`}
                  </label>
                  <Input
                    name="steps"
                    type="text"
                    id={`steps-${stepCountField.id}`}
                    className="flex-1"
                    required
                    defaultValue={stepCountField.val}
                  ></Input>
                  {stepCountIdx > 0 ? (
                    <ButtonBase
                      className="px-4"
                      onClick={() => deleteStepField(stepCountField.id)}
                    >
                      X
                    </ButtonBase>
                  ) : (
                    <div aria-hidden className="px-4 invisible">
                      X
                    </div>
                  )}
                </Row>
              );
            })}
            <Button className="sm:w-1/2" onClick={addStepField}>
              Add Step
            </Button>
          </StackedInputs>
        </Stack>
        <Stack className="pt-4">
          <Button className="bg-buttonPrimary" type="submit">
            Submit
          </Button>
        </Stack>
      </Stack>
    </Form>
  );
}
