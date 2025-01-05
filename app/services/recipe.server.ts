import { RecipeRepository } from "~/repositories/recipe.server";

export class RecipeIngredientFormatError extends Error {}
export class RecipeStepFormatError extends Error {}

export class RecipeService {
  private repo: RecipeRepository;
  constructor(repo: RecipeRepository = new RecipeRepository()) {
    this.repo = repo;
  }

  async findRecipesByUserId(userId: number) {
    try {
      const maybeUserRecipes = await this.repo.findRecipesByUserId(userId);

      // take returned recipes and convert the ingredients and steps strings to lists of strings
      const parsedRecipes = maybeUserRecipes.map((recipe) => {
        return {
          ...recipe,
          ingredientList: this.convertIngredientsStringToList(
            recipe.ingredientList
          ),
          recipeSteps: this.convertStepsStringToList(recipe.recipeSteps),
        };
      });

      return parsedRecipes;
    } catch (err) {
      console.error("Error in recipe repo: findRecipesByUserId", err);
      throw err;
    }
  }

  async findRecipeById(recipeId: number) {
    try {
      const maybeRecipe = await this.repo.findRecipeById(recipeId);

      // returning null if we don't find a recipe instead of just throwing an error. It's expected that the query might
      // not return a recipe. However, encountering an error while the query is happening would be unexpected and we would
      // want to catch that error and handle it somewhere (not here, maybe in a route handler/remix loader)
      if (!maybeRecipe) return null;

      const parsedRecipe = {
        ...maybeRecipe,
        ingredientList: this.convertIngredientsStringToList(
          maybeRecipe.ingredientList
        ),
        recipeSteps: this.convertStepsStringToList(maybeRecipe.recipeSteps),
      };

      return parsedRecipe;
    } catch (err) {
      console.error("Error in recipe service: findRecipeById", err);

      throw err;
    }
  }

  addNewRecipe({
    userId,
    recipeName,
    ingredientList,
    recipeSteps,
  }: {
    userId: number;
    recipeName: string;
    ingredientList: Array<string>;
    recipeSteps: Array<string>;
  }) {
    try {
      const formattedIngredients =
        this.formatSubmittedIngredients(ingredientList);
      const formattedSteps = this.formatSubmittedSteps(recipeSteps);

      const createdRecipeId = this.repo.createRecipe({
        recipeName,
        userId,
        ingredientList: formattedIngredients,
        recipeSteps: formattedSteps,
      });

      return createdRecipeId;
    } catch (err) {
      console.error("asd", err);
      throw err;
    }
  }

  // note on errors: in case an individual ingredient is not formatted correctly, I prefer to throw an error instead
  // of trying to guess at what the user's intention was, and bubble that error up to the front end
  formatSubmittedIngredients(ingredientList: Array<string>) {
    // want to transform an array of strings into a string where each array element is separated by a new line
    // safe to assume we're getting well formatted input here? Probably, but can't hurt to do it again
    // one thing to look out for is empty or white space only strings

    const mappedIngredients = ingredientList.map(
      (ingredient, idx) =>
        this.validateIngredientString(ingredient) +
        (idx < ingredientList.length - 1 ? "\n" : "") // don't add new line to last ingredient
    );

    return mappedIngredients.join("");
  }

  formatSubmittedSteps(recipeStepsList: Array<string>) {
    // want to transform an array of strings into a string where each array element is separated by a new line
    // safe to assume we're getting well formatted input here? Probably, but can't hurt to do it again
    // one thing to look out for is empty or white space only strings
    const mappedSteps = recipeStepsList.map(
      (step, idx) =>
        this.validateStepString(step) +
        (idx < recipeStepsList.length - 1 ? "\n" : "") // don't add new line to last step
    );

    return mappedSteps.join("");
  }

  validateIngredientString(ingredient: string) {
    const trimmed = ingredient.trim();

    if (trimmed.length === 0)
      throw new RecipeIngredientFormatError("ingredient cannot be empty");

    return trimmed;
  }

  validateStepString(step: string) {
    const trimmed = step.trim();

    if (trimmed.length === 0)
      throw new RecipeStepFormatError("recipe step cannot be empty");

    return trimmed;
  }

  convertIngredientsStringToList(ingredientsString: string) {
    // expected format is strings separated by new lines. Hopefully we can prevent strings which have new lines consecutively
    return ingredientsString.split("\n");
  }

  convertStepsStringToList(stepsString: string) {
    return stepsString.split("\n");
  }
}
