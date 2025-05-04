import { z } from "zod";

import { RecipeRepository } from "~/repositories/recipe.server";

export const updateRecipeSchema = z
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
type UpdateRecipeData = z.infer<typeof updateRecipeSchema>;

export class RecipeIngredientFormatError extends Error {}
export class RecipeStepFormatError extends Error {}
export class RecipeServiceValidationError extends Error {}

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
      // TODO: differentiate by type of error, and maybe throw a custom error type if I know type of error
      // aka zod throws? throw a RecipeServiceValidationError or something
      console.error("Error in recipe service: findRecipesByUserId", err);
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
      console.error("Error in recipe service: addNewRecipe", err);
      throw err;
    }
  }

  // note 3/21/2025 - this is performing an http PATCH. This should mean that all recipe fields passed in are optional
  // if a field is present, means we are replacing that piece of recipe data. If a field is not present, implies
  // that the field is not being updated
  // only the recipeId (simply listed as "id" in recipe schema) is required, while everything
  // else can be left out
  // hopefully the above is a correct assumption
  async updateRecipe(newRecipeData: UpdateRecipeData) {
    try {
      // do I need to check for existence of a record before trying to update it?
      // - seems like more of a concern at repository layer? bc db should error if you try to update record that doesn't exist?
      // if I try updating a recipe that doesn't exist does it raise an error or fail silently?
      // I imagine it will raise an error - test this out 4/17/2025, atm don't even have db update logic in place
      // beyond checking for existence of the recipe, not sure what other validations I'd need to do
      // -- one case maybe - query existing recipe and compare userId to make sure only the recipe author can update a recipe
      // -- but could also handle this at the action handler level by comparing userId of updated recipe and userId from session
      // --- 4/17/2025 - thinking it seems ok for action handler to make the check (session userId matches submited recipe userId)
      // --- already have access to both pieces of info in action, whereas in service would need to call a function to get the session?
      // --- could alternatively pass in userId or session object into this update method or when we instantiate recipe service object?
      // --- just checking at action handler level seems simpler for the time being at least, maybe a little leaky as far as logic goes though?
      // -- yea, prob handle in action handler instead of making another query to verify for now?
      // -- if a user tried submitting an update for a recipeId that they don't own in the db, then we'll redirect them somewhere
      // -- e.g. if someone used curl and just submitted to a random recipeId, they hopefully can't also somehow spoof their userId to match
      // -- the correct user
      // also, prob don't even need to query db to ensure existence, can just catch the error and rethrow it?
      // or catch a specific error for that case and throw a custom error?
      const { recipeId, ...rest } = newRecipeData;

      const maybeRecipe = await this.findRecipeById(recipeId);

      if (!maybeRecipe) {
        throw new RecipeServiceValidationError(
          `No recipe found for given id: ${recipeId}`
        );
      }

      // don't know what fields we're getting besides userId and recipeId
      const stringIngredientList =
        rest.ingredientList &&
        this.formatSubmittedIngredients(rest.ingredientList);
      const stringRecipeSteps =
        rest.recipeSteps && this.formatSubmittedSteps(rest.recipeSteps);

      const updateObj = {
        ...rest,
        id: recipeId,
        recipeSteps: stringRecipeSteps,
        ingredientList: stringIngredientList,
      };
      await this.repo.updateRecipe(updateObj);
    } catch (err: unknown) {
      console.error("Error in recipe service: updateRecipe error", err);

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
