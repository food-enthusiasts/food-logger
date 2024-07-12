// drizzle docs for schema declaration
// https://orm.drizzle.team/docs/sql-schema-declaration
// drizzle docs for using drizzle-kit to handle schema migrations
// https://orm.drizzle.team/docs/migrations
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "users",
  {
    id: integer("id").primaryKey(),
    username: text("username").notNull().unique(),
    email: text("email").notNull().unique(),
  }
  // (users) => ({
  //   usernameIdx: uniqueIndex("username_idx").on(users.username),
  // })
);

export type User = typeof users.$inferSelect; // return type when queried
export type InsertUser = typeof users.$inferInsert; // insert type

export const recipes = sqliteTable("recipes", {
  id: integer("id").primaryKey(),
  recipeName: text("recipe_name").notNull(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
});

export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = typeof recipes.$inferInsert;
