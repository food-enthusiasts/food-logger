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

  addNewRecipe({
    userId,
    recipeName,
    ingredientsList,
    recipeSteps,
  }: {
    userId: number;
    recipeName: string;
    ingredientsList: Array<string>;
    recipeSteps: Array<string>;
  }) {
    try {
      const formattedIngredients =
        this.formatSubmittedIngredients(ingredientsList);
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
  formatSubmittedIngredients(ingredientsList: Array<string>) {
    // want to transform an array of strings into a string where each array element is separated by a new line
    // safe to assume we're getting well formatted input here? Probably, but can't hurt to do it again
    // one thing to look out for is empty or white space only strings

    const mappedIngredients = ingredientsList.map(
      (ingredient, idx) =>
        this.validateIngredientString(ingredient) +
        (idx < ingredientsList.length - 1 ? "\n" : "") // don't add new line to last ingredient
    );

    return mappedIngredients.join("\n");
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
