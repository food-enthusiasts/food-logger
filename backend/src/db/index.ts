// following docs for better-sqlite3 for this setup
// https://github.com/WiseLibs/better-sqlite3
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

// reference for replicating __dirname functionality in esm (at least I think it's because we're using esm)
// https://iamwebwiz.medium.com/how-to-fix-dirname-is-not-defined-in-es-module-scope-34d94a86694d
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlite = new Database(path.resolve(__dirname, "./foodlogger-dev.db"));
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

// following drizzle docs for setup
// https://orm.drizzle.team/docs/get-started-sqlite#better-sqlite3
export const db = drizzle(sqlite, { logger: true });
