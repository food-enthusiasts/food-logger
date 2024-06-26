// following docs for better-sqlite3 for this setup
// https://github.com/WiseLibs/better-sqlite3
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

const sqlite = new Database("foodlogger-dev.db");
sqlite.pragma("journal_mode = WAL");

// following drizzle docs for setup
// https://orm.drizzle.team/docs/get-started-sqlite#better-sqlite3
export const db = drizzle(sqlite);
