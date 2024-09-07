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
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").primaryKey(),
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

export const recipes = mysqlTable("recipes", {
  id: int("id").primaryKey(),
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
});

export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = typeof recipes.$inferInsert;
