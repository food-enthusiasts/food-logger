import { RecipeRepository } from "~/repositories/recipe.server";

export class RecipeService {
  private repo: RecipeRepository;
  constructor(repo: RecipeRepository = new RecipeRepository()) {
    this.repo = repo;
  }

  findRecipesByUserId(userId: number) {
    try {
      const maybeUserRecipes = this.repo.findRecipesByUserId(userId);

      return maybeUserRecipes;
    } catch (err) {
      console.error("Error in recipe repo: findRecipesByUserId", err);
      throw err;
    }
  }
}
