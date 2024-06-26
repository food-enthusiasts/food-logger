// create drizzle-kit config based on https://orm.drizzle.team/docs/migrations#quick-start
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "./src/db/foodlogger-dev.db",
  },
});
