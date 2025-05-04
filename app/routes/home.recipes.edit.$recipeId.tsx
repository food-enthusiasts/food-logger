import { redirect, json } from "@remix-run/node";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import { useState } from "react";
import { z } from "zod";

import { requireUserId } from "~/session.server";
import {
  RecipeService,
  updateRecipeSchema,
  RecipeServiceValidationError,
} from "~/services/recipe.server";

import { Button } from "~/components/Button";
import { Input } from "~/components/Input";
import { Stack, StackedInputs } from "~/components/Stack";
import { ButtonBase } from "~/components/ButtonBase";
import { Row } from "~/components/Row";
import { Typography } from "~/components/Typography";
import { LinkButton } from "~/components/LinkButton";

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

export async function action({ request, params }: ActionFunctionArgs) {
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

    // check that submitted userId and userId from session match
    // if not, redirect somewhere?
    if (userId !== parsedRecipe.userId) {
      // or maybe send down some error (403?)
      return redirect("/home");
    }

    // return redirect("..");

    // probably do db update here - can throw
    const recipeService = new RecipeService();
    await recipeService.updateRecipe({ ...parsedRecipe });

    // do I need to do redirect here? Can I reload page with the new data?
    return redirect("/home/recipes" + "/" + recipeId);
  } catch (e) {
    console.error("error in action home/recipes/$recipeId", e);
    // do something different here? return some errors for the form?

    // probably do something different in case e is instanceof ZodError
    if (e instanceof z.ZodError) {
      console.log("issues on the zod error", e.issues);
    }
    if (e instanceof RecipeServiceValidationError) {
      console.log("service validation error", e.message);
      // RecipeServiceValidationError intended use is for errors that happen at service level, mostly business logic
      // I will try to stay consistent and ensure that these errors always have a non-empty message field on the object
      // then present that error message to user
      // e.g. in case recipe isn't found at service level, will get service validation error, then show an error message
      // in front end? don't do a redirect for validation errors?
      // might also create a general RecipeServiceGenericError that is meant to come from repo level? with these, not
      // sure what issue might be, just that there was some back end error I didn't handle. In this case, still show
      // an error message and stay on edit page?
      // only redirect if update is successful, or user doesn't have permission to access given recipe?
    }
    console.log("recipe update err action");
    throw redirect("/home/recipes");
  }
}

export default function RecipeEdit() {
  const data = useLoaderData<typeof loader>();
  const recipe = data.data.recipe;
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
        <LinkButton toHref={`/home/recipes/${recipe.id}`} type="text">
          Go to recipe
        </LinkButton>
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
          <LinkButton
            toHref={`/home/recipes/${recipe.id}`}
            className="text-center"
            type="text"
          >
            Back to recipe
          </LinkButton>
          <Button className="bg-buttonPrimary" type="submit">
            Submit
          </Button>
        </Stack>
      </Stack>
    </Form>
  );
}
