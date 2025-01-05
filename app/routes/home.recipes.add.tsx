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
import { Stack, StackedInputs } from "~/components/Stack";
import { Typography } from "~/components/Typography";

export async function action({ request }: ActionFunctionArgs) {
  const newRecipeSchema = z
    .object({
      userId: z.number(),
      recipeName: z.string().min(1),
      ingredientList: z.array(z.string().min(1)).nonempty(),
      recipeSteps: z.array(z.string().min(1)).nonempty(),
    })
    .strict();

  const userId = await getUserIdFromSession(request);

  const formData = await request.formData();

  const recipeName = formData.get("recipeName");
  const ingredientList = formData.getAll("ingredients");
  const stepsList = formData.getAll("steps");

  // probably do zod parsing here - can throw
  const parsedRecipe = newRecipeSchema.parse({
    userId,
    recipeName,
    ingredientList,
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
  const [ingredientsCountList, setIngredientsCountList] = useState([1]);
  const [stepsCountList, setStepsCountList] = useState([1]);

  function addIngredientField() {
    const nextNumber =
      ingredientsCountList[ingredientsCountList.length - 1] + 1;
    setIngredientsCountList([...ingredientsCountList, nextNumber]);
  }

  function deleteIngredientField(ingredientNum: number) {
    // if ingredientsCount is an array that is offset by 1, aka value
    // at idx 0 is 1 all the way to idx + 1, if we filter the array to remove say
    // idx 3 aka step 4, what does this look like?
    setIngredientsCountList(
      ingredientsCountList.filter((ingNum) => ingNum !== ingredientNum)
    );
  }

  function addStepField() {
    const nextNumber = stepsCountList[stepsCountList.length - 1] + 1;
    setStepsCountList([...stepsCountList, nextNumber]);
  }

  function deleteStepField(stepNum: number) {
    setStepsCountList(stepsCountList.filter((step) => step !== stepNum));
  }

  // say we have ingredientsCountList initialized as [1]
  // when we map over ingredientCountList, we have access to a number (var name of ingField) (1 indexed) and the index, ingIdx, (0 indexed)
  // key = "ingredient-" + ingredientField
  // input field - name="ingredients", id={`ingredients-${ingredientField}`}
  // input label - htmlFor={`ingredients-${ingredientField}`}, labelChildText=`ingredient ${ingIdx + 1}`
  // even if we delete or rearrange the fields, the label is based off the index so will always label fields as 1 through n

  // potential for bugs around duplicate entries possible though?
  // 1. add 3 more ingredients, have ingredientsCountList = [1, 2, 3, 4]
  // 2. delete the second ingredient, ingredientsCountList = [1, 3, 4]
  // 3. add another ingredient, ingredientsCountList = [1, 3, 4, 5]

  return (
    <Stack className="w-full md:max-w-screen-sm px-4 py-8 shadow-lg rounded-md">
      <Link to="/home/recipes">Back to Recipes</Link>
      <Form method="POST" className="sm:px-4">
        <Stack className="gap-y-6">
          <Stack>
            <label htmlFor="recipeName">
              <Typography variant="paragraph">Recipe Name</Typography>
            </label>
            <Input
              name="recipeName"
              type="text"
              id="recipeName"
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
              <Typography variant="paragraph">Ingredients</Typography>
            </Stack>
            <StackedInputs>
              {ingredientsCountList.map((ingredientField, ingredientIdx) => {
                return (
                  <Row
                    key={`ingredient-${ingredientField}`}
                    className="justify-between"
                  >
                    <label
                      htmlFor={`ingredients-${ingredientField}`}
                      className="sr-only"
                    >
                      {`ingredient ${ingredientIdx + 1}`}
                    </label>
                    <Input
                      name="ingredients"
                      type="text"
                      id={`ingredients-${ingredientField}`}
                      className="flex-1"
                      required
                    ></Input>
                    {ingredientIdx > 0 ? (
                      <ButtonBase
                        className="px-4"
                        onClick={() => deleteIngredientField(ingredientField)}
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
              <Typography variant="paragraph">Steps</Typography>
            </Stack>
            <StackedInputs>
              {stepsCountList.map((stepCountField, stepCountIdx) => {
                return (
                  <Row
                    key={`step-${stepCountField}`}
                    className="justify-between"
                  >
                    <label
                      htmlFor={`steps-${stepCountField}`}
                      className="sr-only"
                    >
                      {`step ${stepCountIdx + 1}`}
                    </label>
                    <Input
                      name="steps"
                      type="text"
                      id={`steps-${stepCountField}`}
                      className="flex-1"
                      required
                    ></Input>
                    {stepCountIdx > 0 ? (
                      <ButtonBase
                        className="px-4"
                        onClick={() => deleteStepField(stepCountField)}
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
    </Stack>
  );
}
