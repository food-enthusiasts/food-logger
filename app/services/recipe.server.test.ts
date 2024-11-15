// mocking RecipeRepository per vitest docs here - https://vitest.dev/guide/mocking#classes

// ignore unused import, only importing it to mock it for RecipeRepository
/* eslint-disable  @typescript-eslint/no-unused-vars */
import { RecipeRepository } from "~/repositories/recipe.server";
vi.mock(import("../repositories/recipe.server"), () => {
  const RecipeRepository = vi.fn();

  return { RecipeRepository };
});

import { RecipeService } from "./recipe.server";

describe("Testing recipe service", () => {
  test("should format a string array into a new-line separated string", () => {
    // for now, don't test crud methods bc I haven't mocked out db client
    const unformattedIngredients = [
      "1 tsp sugar",
      "2 tbsp butter",
      "1 tsp cinnamon",
    ];
    const unformattedSteps = [
      "combine sugar, butter and cinnamon",
      "mix thoroughly until airy",
    ];

    const recipeService = new RecipeService();
    const ingredientsString = recipeService.formatSubmittedIngredients(
      unformattedIngredients
    );
    const stepsString = recipeService.formatSubmittedSteps(unformattedSteps);

    expect(ingredientsString).toEqual(
      "1 tsp sugar\n2 tbsp butter\n1 tsp cinnamon"
    );
    expect(stepsString).toEqual(
      "combine sugar, butter and cinnamon\nmix thoroughly until airy"
    );
  });
});
