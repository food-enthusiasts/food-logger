import { Router } from "express";

import { db } from "../db/index.js";
import { users } from "../db/schema.js";

export const userRouter = Router();

userRouter.get("/", async (req, res) => {
  const allUsers = await db.select().from(users);

  console.log("all users?");
  console.log(allUsers);

  res.json({
    data: { users: allUsers },
  });
});
