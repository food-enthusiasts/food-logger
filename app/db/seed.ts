import "dotenv/config";
import { db } from "./index.server";
import { sql } from "drizzle-orm";

import { users, recipes, meals, dishes } from "./schema.server";
import { UserRepository } from "../repositories/user.server";

// 12/20/2024 - got below error when trying to run my seed npm script - maybe env vars aren't being loaded properly? need to explicitly call dotenv?

// Error: Access denied for user ''@'localhost' (using password: YES)
//     at Object.createConnection (/Users/alex/projects/food-logger/node_modules/mysql2/promise.js:253:31)
//     at <anonymous> (/Users/alex/projects/food-logger/app/db/index.server.ts:6:32)
//     at ModuleJob.run (node:internal/modules/esm/module_job:222:25)
//     at async ModuleLoader.import (node:internal/modules/esm/loader:316:24)
//     at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:123:5) {
//   code: 'ER_ACCESS_DENIED_ERROR',
//   errno: 1045,
//   sqlState: '28000'
// }

// to test this, I added the following lines near the top of my file where I'm creating the mysql connection "app/db/index.server.ts":

// import * as dotenv from "dotenv";
// dotenv.config(); // load the environment variables

// this let me run the seed file successfully. How can I rewrite code to allow db initialization to read env vars in seed file?
// later on, created another file that just imports dotenv and calls dotenv.configure(), then imported into seed file. This seems to work
// and the seed script runs without error. Seems that this works because imports are ran first in order that they are imported, then
// code inside the file runs after. So order of execution here is:
// 1. loadEnvVars.ts file is imported and its code is run
// 2. db from db/index.server.ts is imported and its code is run
// 3. code in this seed.ts file runs after imports run
// later later on, realized I can write `import "dotenv/config"` and this also does what I need - calls dotenv.config() as an import
// so that it runs before the "db" import runs

async function seed() {
  console.log("disabling foreign key constraints");
  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0;`);

  // truncate all tables - users, recipes, meals, dishes

  console.log("re-enabling foreign key constraints");
  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1;`);

  // const asd = db
  //   .select()
  //   .from(users)
  //   .then((data) => console.log(data));

  const userRepo = new UserRepository();
  console.log("creating users");
  // is insertion order guaranteed? That is, will the returned ids returned from inserting users always match order that user data
  // is provided? I am operating under the assumption that this is the case for now
  const seedUserIds = await userRepo.bulkCreateUsers([
    {
      username: "garfield",
      email: "garfield@example.com",
      password: "asd123456",
    },
    {
      username: "john_arbuckle",
      email: "john_arbuckle@example.com",
      password: "asd123456",
    },
    {
      username: "odie",
      email: "odiee@example.com",
      password: "asd123456",
    },
  ]);

  console.log("creating recipes");

  const recipeIdsList = (
    await db
      .insert(recipes)
      .values([
        {
          // garfield
          userId: seedUserIds[0],
          recipeName: "famous lasagna",
          ingredientList:
            "1 lbs ground beef\n1 16 oz can tomato sauce\nlasagna noodles\n salt\npepper",
          recipeSteps:
            "brown beef for 10 minutes\nadd tomato sauce to pot\nadd salt and pepper to mixture\nlayer mixture with noodles\nbake at 350F until done",
        },
        {
          // john
          userId: seedUserIds[1],
          recipeName: "huge sandwich",
          ingredientList:
            "1 lbs deli ham\n1 lbs swiss cheese slices\n2 slices bread",
          recipeSteps:
            "put bread down\nput on cheese slices\nput on deli ham slices\ncover with rest of bread",
        },
        {
          // odie
          userId: seedUserIds[2],
          recipeName: "boiled water",
          ingredientList: "2 lbs water\nsalt to taste",
          recipeSteps:
            "put water in pan\nadd salt until flavorful\nheat water until boiling",
        },
        {
          // garfield
          userId: seedUserIds[0],
          recipeName: "spaghetti with meatballs",
          ingredientList:
            "1 lbs ground beef\n1 lbs dry spaghetti\n1 15 oz can crushed tomatoes",
          recipeSteps:
            "brown beef\ncook spaghetti until al dente\nmix cooked beef and spaghetti with crushed tomatoes and simmer for 10 minutes",
        },
      ])
      .$returningId()
  ).map((recipeObj) => recipeObj.id);

  console.log("creating meals and associating recipes and users to them");
  // meal has FK for user_id while dish has FKs for meal and recipe, so need to insert meals, then insert dishes
  const mealIdsList = (
    await db
      .insert(meals)
      .values([
        {
          // garfield made lasagna this meal
          userId: seedUserIds[0],
          status: "initial",
          mealNotes: "oven might run a little cold based on something?",
        },
        {
          // garfield made a sandwich this meal
          userId: seedUserIds[0],
          status: "initial",
        },
        {
          // garfield made boiled water and meatball pasta this meal
          userId: seedUserIds[0],
          status: "initial",
          mealNotes: "the water was a little undercooked",
        },
      ])
      .$returningId()
  ).map((mealObj) => mealObj.mealId);

  await db.insert(dishes).values([
    // garfield made recipe lasagna for this meal
    { mealId: mealIdsList[0], recipeId: recipeIdsList[0] },
    // garfield made recipe sandwich for this meal
    { mealId: mealIdsList[1], recipeId: recipeIdsList[1] },
    // garfield made recipes pasta with meatballs, boiled water for this meal
    { mealId: mealIdsList[2], recipeId: recipeIdsList[2] },
    { mealId: mealIdsList[2], recipeId: recipeIdsList[3] },
  ]);

  console.log("finished seeding database");
}

seed();
