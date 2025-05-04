import { eq, sql } from "drizzle-orm";

import { db } from "../db/index.server";
import { recipes } from "~/db/schema.server";
import type { Recipe } from "~/db/schema.server";
export class RecipeRepoValidationError extends Error {}
export class RecipeRepoGenericError extends Error {}

interface UpdateType {
  id: number;
  userId: number;
  recipeName?: string | undefined;
  ingredientList?: string | undefined;
  recipeSteps?: string | undefined;
}

export class RecipeRepository {
  private client: typeof db;
  constructor(connection: typeof db = db) {
    this.client = connection;
  }

  async createRecipe({
    userId,
    recipeName,
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

  // update recipe - patch or put? going with patch as of 3/22/2025
  // get passed object with recipeId and userId present, rest of values optional
  // could iterate over keys and grab all non-null/undefined vals?
  // drizzle api for updating (db#update) takes an object so we can pass this repository method
  // a plain object from the recipe service, and apparently keys with null values are skipped when updating
  // does it make sense to define the zod schema here that I originally defined to type the form submission coming in
  // from the front end?
  // there is a little mimatch between types here though. The form is sending the ingredient list and recipe steps
  // as Array<string>, but when we persist to the db those get saved as a text string separated by new lines
  async updateRecipe(recipeData: UpdateType) {
    try {
      // do we need logic for
      const { id, ...rest } = recipeData;
      console.log("recipe repo update method");
      await this.client
        .update(recipes)
        // need to add more here
        // potentially just exclude the userId and id so there's no way to accidentally
        // update those vals. The id should never change, and I'm not giving option to reassign user of a recipe
        // through the UI at the moment
        .set({ ...rest, updatedAt: sql`NOW()` })
        .where(eq(recipes.id, id));

      // if above was successful as in no errors, return a success message or indication somehow. Simply return true?
      // believe ActiveRecord from rails has db update methods that simply return true or false depending on if the update
      // -- actually, think ActiveRecord#update method might raise an error, but the #save method returns a boolean? I honestly don't know anymore
      // --- so #update simply returns a boolean, true if validations succeed, false if not, and #update! (bang) raises an exception if validation fails, still return true if they pass?
      // was successful. In that case though, can we actually surface information about why it failed?
      // -- could instead return an object typed as descriminated union with a "status" enum? or a "success" field that is true or false?
      // -- if true, then it won't have any additional fields
      // -- if false, it will have a "reason" field explaining the issue?

      // if not successful, assume an error gets thrown, then we catch it and process it somehow by type of error?
      // not sure if mysql2 driver will be throwing errors or if drizzle client will be doing that
      return true;
    } catch (err: unknown) {
      console.log("error in recipe repo update method");
      // assume error would pop up if we try to update a recipe that doesn't exist?
      // do stuff here. What kind of errors can happen?
      // db constraint errors probably, such as trying to insert non-unique val with a unique index on the table
      // others like that
      console.error("Error in recipe repo: updateRecipe", err);
      // if we do end up catching an error, what should we do?
      const recipeRepoErr = new RecipeRepoGenericError();

      // if err is an Error instance, we can try to grab the message off err and attach it to our recipeRepoErr
      // if err is not an Error instance, honestly idk what to do, guess just throw plain recipeRepoErr and
      // the message will be an empty string. Honestly not sure if I can determine issue based on the error from drizzle
      // so at route/action handler level, probably going to display a generic something went wrong error anyway
      if (err instanceof Error) {
        recipeRepoErr.message = err.message;
      }

      throw recipeRepoErr;
    }
  }

  // delete recipe - cascade deletes of meals?
  async deleteRecipe(recipeId: number) {
    recipeId;
  }
}
