// following docs for better-sqlite3 for this setup
// https://github.com/WiseLibs/better-sqlite3
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

export const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// following drizzle docs for setup
// https://orm.drizzle.team/docs/get-started-mysql#mysql2
export const db = drizzle(connection);
