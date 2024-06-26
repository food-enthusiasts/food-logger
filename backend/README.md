# FoodLogger Back End

This is the back end repo for the project utilizing TypeScript and Express

## Migrations

We are using Drizzle and drizzle-kit

Process to generate and run a migration based on Drizzle docs [here](https://orm.drizzle.team/docs/migrations)

1. We define our schema in `/db/schema.ts`, refer to the Drizzle docs [here](https://orm.drizzle.team/docs/sql-schema-declaration)
2. After creating a Drizzle config file `drizzle.config.ts`, we can generate a migration file with `drizzle-kit generate` (we aliased it to an npm script, `db-generate`) which outputs migration files. Since we defined the `out` field in our config to be `./drizzle`, the migration file will be created in the root of our project in a directory called `drizzle`. Our migration file will be a plain sql file based on our schema changes, as well as some other files related to the migration
3. The Drizzle docs state that the migration files that we generate can be run by Drizzle with `drizzle-kit`, using `Drizzle ORM` by writing a `migrate.ts` file that we can run, or by any tool that can run sql migrations. We opt to use `drizzle-kit` to run our migrations for now, and created an npm script called `db-migrate` which calls `drizzle-kit migrate`
4. After running the migration, Drizzle should have applied our schema changes to our sqlite database file
