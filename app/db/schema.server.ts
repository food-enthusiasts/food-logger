// drizzle docs for schema declaration
// https://orm.drizzle.team/docs/sql-schema-declaration
// drizzle docs for using drizzle-kit to handle schema migrations
// https://orm.drizzle.team/docs/migrations
import {
  mysqlTable,
  int,
  text,
  varchar,
  timestamp,
  unique,
  mysqlEnum,
  date,
  primaryKey,
} from "drizzle-orm/mysql-core";

// TODO: add a column for type to indicate admin user or regular user
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 256 }).notNull().unique(),
  email: varchar("email", { length: 256 }).notNull().unique(),
  // seems like bcrypt can output hashes that are 60 characters long
  // so using varchar of length 80 just in case it's actually a slightly
  // larger length
  password: varchar("password", { length: 80 }).notNull(),
  // for mysql timestamps with drizzle, referencing this thread from a site that aggregrates messages in the drizzle discord:
  // https://www.answeroverflow.com/m/1113986761606037575
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export type User = typeof users.$inferSelect; // return type when queried
export type InsertUser = typeof users.$inferInsert; // insert type

export const recipes = mysqlTable(
  "recipes",
  {
    id: int("id").autoincrement().primaryKey(),
    recipeName: varchar("recipe_name", { length: 256 }).notNull(),
    userId: int("user_id")
      .references(() => users.id)
      .notNull(),
    // setting ingredient-list and recipe-steps columns as text fields for now and try
    // to ensure ingredients/steps are separated by new-lines during input validations
    ingredientList: text("ingredient_list").notNull(),
    recipeSteps: text("recipe_steps").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (recipesTable) => ({
    uniq: unique("unique_recipe_name_user_id").on(
      recipesTable.userId,
      recipesTable.recipeName
    ),
  })
);

export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = typeof recipes.$inferInsert;

export const meals = mysqlTable("meals", {
  mealId: int("meal_id").autoincrement().primaryKey(),
  status: mysqlEnum("status", [
    "initial",
    "todo",
    "cooked",
    "overdue",
    "skipped",
  ]).notNull(),
  userId: int("user_id")
    .references(() => users.id)
    .notNull(),
  plannedDate: date("planned_date"),
  cookedDate: date("cooked_date"),
  mealNotes: text("meal_notes").default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

// drizzle docs for making a many-to-many table
// https://orm.drizzle.team/docs/relations#many-to-many
// the "dishes" table will act as a join table between "meals" and "recipes"
// and will have a composite primary key formed by the combination of
// meal_id and recipe_id (aka not going to give it a single primary key). This assumes a user cannot make the same recipe twice
// for the same meal which I think is a reasonable assumption to make and also
// follows my idea for what a "recipe" represents in context - it's a blueprint for a dish
// if a user needs to indicate that they did something such as doubled the portion
// of a recipe, they can write a note somewhere (in meal or dish notes)
// NOTE: debating on whether I should associate a "user" directly to a "dish" by adding a "user_id" foreign
// key to the "dishes" table, instead of indirectly through a "meal" entry. I am tempted to say I can leave
// out the direct association between "user" and "dish" because I can't think a case where I would want to
// query a user to get all their dishes without also getting data related to the "recipe" the dish was made from
// or the "meal" that the dish was part of. Maybe if we wanted to query the total number of "dishes" a user made
// it could be useful, but I can't imagine that's a query that will come up all that often, and even if it does it's
// probably not terrible to do a join between "users", "dishes", and/or "recipes"/"meals" (or both), especially with
// proper indexing (big assumption that I'll get the indexing right lmao)
export const dishes = mysqlTable(
  "dishes",
  {
    mealId: int("meal_id")
      .references(() => meals.mealId)
      .notNull(),
    recipeId: int("recipe_id")
      .references(() => recipes.id)
      .notNull(),
    dishNotes: text("dish_notes").default(""),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  // opting to use mealId as first part of composite key since I think queries will probably
  // reference mealIds more often. Actually not sure of mechanics here
  // potentially relevant SO thread, though not sure I currently understand it
  (table) => ({ pk: primaryKey({ columns: [table.mealId, table.recipeId] }) })
);
