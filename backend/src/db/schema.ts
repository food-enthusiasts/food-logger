// drizzle docs for schema declaration
// https://orm.drizzle.team/docs/sql-schema-declaration
// drizzle docs for using drizzle-kit to handle schema migrations
// https://orm.drizzle.team/docs/migrations
import { mysqlTable, int, text, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable(
  "users",
  {
    id: int("id").primaryKey(),
    username: varchar("username", { length: 256 }).notNull().unique(),
    email: varchar("email", { length: 256 }).notNull().unique(),
    // createdAt: text("created_at").notNull().default(""),
    // // updatedAt declaration taken from this thread: https://github.com/drizzle-team/drizzle-orm/discussions/2271#discussioncomment-9390473
    // // not sure of trade offs or pitfalls with this approach but hopefully it at least works
    // updatedAt: text("updated_at")
    //   .notNull()
    //   .default("")
    //   .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
  }
  // (users) => ({
  //   usernameIdx: uniqueIndex("username_idx").on(users.username),
  // })
);

export type User = typeof users.$inferSelect; // return type when queried
export type InsertUser = typeof users.$inferInsert; // insert type

export const recipes = mysqlTable("recipes", {
  id: int("id").primaryKey(),
  recipeName: varchar("recipe_name", { length: 256 }).notNull(),
  userId: int("user_id")
    .references(() => users.id)
    .notNull(),
  // setting ingredient-list and recipe-steps columns as text fields for now and try
  // to ensure ingredients/steps are separated by new-lines during input validations
  // 8/1/2024 setting default values here because sqlite complains about altering a
  // table to add non-null columns without setting default values for the new columns
  // seemingly bc we would be setting a null value
  ingredientList: text("ingredient_list").notNull(),
  recipeSteps: text("recipe_steps").notNull(),
  // createdAt: text("created_at").notNull().default(""),
  // updatedAt: text("updated_at")
  //   .notNull()
  //   .default("")
  //   .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
});

export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = typeof recipes.$inferInsert;
