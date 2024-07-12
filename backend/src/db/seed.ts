import { db } from "./index.js";
import { users, recipes } from "./schema.js";
import type { InsertUser, InsertRecipe } from "./schema.js";

function insertUser(user: InsertUser) {
  return db.insert(users).values(user).run();
}

function insertRecipe(recipe: InsertRecipe) {
  return db.insert(recipes).values(recipe).run();
}

async function seed() {
  const allUsers = await db.select().from(users).all();
  const allRecipes = await db.select().from(recipes).all();
  console.log("all the users?", allUsers);
  console.log("all the recipes?", allRecipes);

  // insertUser({ username: "user2", email: "testuser2@example.com" });
  // insertRecipe({ recipeName: "recipe1", userId: 52 });
}

seed();
