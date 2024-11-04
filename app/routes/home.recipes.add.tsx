import { redirect } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";

import { getUserIdFromSession } from "~/session.server";

import { Form, Link } from "@remix-run/react";

import { useState } from "react";

import { RecipeService } from "~/services/recipe.server";
import { z } from "zod";

import { Input } from "~/components/Input";
import { Button } from "~/components/Button";
import { ButtonBase } from "~/components/ButtonBase";
import { Row } from "~/components/Row";
import { Stack } from "~/components/Stack";

export async function action({ request }: ActionFunctionArgs) {
  const newRecipeSchema = z
    .object({
      userId: z.number(),
      recipeName: z.string().min(1),
      ingredientsList: z.array(z.string().min(1)),
      recipeSteps: z.array(z.string().min(1)).nonempty(),
    })
    .strict();

  const userId = await getUserIdFromSession(request);

  const formData = await request.formData();

  const recipeName = formData.get("recipeName");
  const ingredientsList = formData.getAll("ingredients");
  const stepsList = formData.getAll("steps");

  // probably do zod parsing here - can throw
  const parsedRecipe = newRecipeSchema.parse({
    userId,
    recipeName,
    ingredientsList,
    recipeSteps: stepsList,
  });

  console.log("parsed recipe", parsedRecipe);

  // probably do db update here - can throw
  const recipeService = new RecipeService();
  recipeService.addNewRecipe({
    ...parsedRecipe,
  });

  return redirect("/home/recipes");
}

export default function AddRecipe() {
  const [ingredientsCount, setIngredientsCount] = useState(1);
  const [stepsCount, setStepsCount] = useState(1);

  function addIngredientField() {
    setIngredientsCount(ingredientsCount + 1);
  }

  function deleteIngredientField(ingredientIdx) {
    // if ingredientsCount is an array that is offset by 1, aka value
    // at idx 0 is 1 all the way to idx + 1, if we filter the array to remove say
    // idx 3 aka step 4, what does this look like?
  }

  function addStepField() {
    setStepsCount(stepsCount + 1);
  }

  function deleteStepField(stepIdx) {}

  return (
    <Stack>
      <Link to="/home/recipes">Back to Recipes</Link>
      <Form method="POST" className="md:max-w-md">
        <Stack>
          <label htmlFor="recipeName">Recipe Name</label>
          <Input name="recipeName" type="text" id="recipeName"></Input>
        </Stack>
        <h1>Ingredients</h1>
        <Stack>
          {/* ingredients container div */}
          <div>
            {Array.from({ length: ingredientsCount }).map((_, ingIdx) => {
              return (
                <Row key={`ingredient-${ingIdx}`} className="justify-between">
                  <label
                    htmlFor={`ingredients-${ingIdx + 1}`}
                    className="sr-only"
                  >
                    {`ingredient ${ingIdx + 1}`}
                  </label>
                  <Input
                    name="ingredients"
                    type="text"
                    id={`ingredients-${ingIdx + 1}`}
                  ></Input>
                  {ingIdx > 0 ? (
                    <ButtonBase className="px-4">X</ButtonBase>
                  ) : null}
                </Row>
              );
            })}
            {/* ingredients container div */}
          </div>
          <Button onClick={addIngredientField}>Add Another Ingredient</Button>
        </Stack>
        <h1>Steps</h1>
        <Stack>
          {/* steps container div */}
          <div>
            {Array.from({ length: stepsCount }).map((_, stepIdx) => {
              return (
                <Row key={`step-${stepIdx}`} className="justify-between">
                  <label htmlFor={`steps-${stepIdx + 1}`} className="sr-only">
                    {`step ${stepIdx + 1}`}
                  </label>
                  <Input
                    name="steps"
                    type="text"
                    id={`steps-${stepIdx + 1}`}
                  ></Input>
                  {stepIdx > 0 ? (
                    <ButtonBase className="px-4">X</ButtonBase>
                  ) : null}
                </Row>
              );
            })}
            {/* steps container div */}
          </div>
          <Button onClick={addStepField}>Add Another Step</Button>
        </Stack>
        <Stack className="pt-4">
          <Button className="bg-primary-300" type="submit">
            Submit
          </Button>
        </Stack>
      </Form>
    </Stack>
  );
}
