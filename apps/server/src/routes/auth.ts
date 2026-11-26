import { Router } from "express";
import { signupRoute } from "../auth/signup.js";
import { signinRoute } from "../auth/signin.js";
import { refreshRoute } from "../auth/refresh.js";
import { logoutRoute } from "../auth/logout.js";

export const authRouter = Router();

authRouter.use(signupRoute);
authRouter.use(signinRoute);
authRouter.use(refreshRoute);
authRouter.use(logoutRoute);
