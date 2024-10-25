import { eq } from "drizzle-orm";

import { db } from "../db/index.server";
import { recipes } from "~/db/schema.server";
import type { Recipe } from "~/db/schema.server";
export class RecipeRepoValidationError extends Error {}

export class RecipeRepository {
  private client: typeof db;
  constructor(connection: typeof db = db) {
    this.client = connection;
  }

  async createRecipe({
    recipeName,
    userId,
    ingredientList,
    recipeSteps,
  }: Pick<Recipe, "recipeName" | "userId" | "ingredientList" | "recipeSteps">) {
    try {
      const newRecipeCreationResponse = await this.client
        .insert(recipes)
        .values({ recipeName, userId, ingredientList, recipeSteps })
        .$returningId();

      if (newRecipeCreationResponse.length !== 1)
        throw new RecipeRepoValidationError(
          "Created recipe response either returned 0 entries or more than 1 entry"
        );

      return newRecipeCreationResponse[0].id;
    } catch (err) {
      console.error("Error in recipe repo: createRecipe", err);
      throw err;
    }
  }

  // find all recipes for a user
  async findRecipesByUserId(userId: number) {
    try {
      const maybeRecipes = await this.client
        .select()
        .from(recipes)
        .where(eq(recipes.userId, userId));

      // not opting to keep same convention as user repo here, at least in the methods for finding a user by their id
      // if we don't find a user based on their id, means that user doesn't exist and we need to take some action like
      // redirect them to the /login page if they're trying to navigate to a page that requires a signed in user
      // here though, if we get zero entries back it probably means the query is wrong (that's a bug) or that the user either
      // has not created any recipes or deleted all their recipes. In either case, it's effectively the same thing when we
      // display this data on the front end (we can display an empty table or a message saying there are no recipes)
      // i am also choosing to return a new empty array to make it explicitly clear that the result is empty
      if (maybeRecipes.length === 0) return [];

      return maybeRecipes;
    } catch (err) {
      console.error("Error in recipe repo: findRecipesByUserId", err);
      throw err;
    }
  }
  // find recipe by its id
  async findRecipeById(recipeId: number) {
    try {
      const maybeRecipe = await this.client
        .select()
        .from(recipes)
        .where(eq(recipes.id, recipeId));

      // since we're not expecting a collection of recipes, choosing to return null if none are
      // found instead of an empty array
      if (maybeRecipe.length === 0) return null;
      if (maybeRecipe.length > 1)
        throw new RecipeRepoValidationError(
          `Found more than one recipe for given recipeId: ${recipeId}`
        );

      return maybeRecipe[0];
    } catch (err) {
      console.error("Error in recipe repo: findRecipeById", err);
      throw err;
    }
  }

  // find recipe(s) based on ingredient | cuisine | category etc - probably could implement naive version of this
  // where I write some sql with LIKE or ILIKE. Most complicated solution would probably involve full text search with something like
  // elasticsearch
  async findRecipeByIngredientName(ingredientName: string) {
    ingredientName;
  }
  // ...findRecipeByX() {}

  // find recipe by meal id? not sure this would be very useful or even necessary

  // update recipe - patch or put?
  async updateRecipe(recipeId: number) {
    recipeId;
  }

  // delete recipe - cascade deletes of meals?
  async deleteRecipe(recipeId: number) {
    recipeId;
  }
}
