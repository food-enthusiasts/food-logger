import { Router } from "express";

import { userRouter } from "./user-router.js";

export const rootRouter = Router();

rootRouter.use("/users", userRouter);
