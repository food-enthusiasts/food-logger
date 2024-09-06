// create drizzle-kit config based on https://orm.drizzle.team/docs/migrations#quick-start
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./app/db/schema.server.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    host: process.env.DB_HOST || "",
    database: process.env.DB_NAME || "",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT) || 3306,
  },
});
