import express from "express";
import { signupSchema } from "../validators/auth.js";
import { prisma } from "../config/db.js";
import bcrypt from "bcrypt";
import { createAuthSession } from "../services/auth.services.js";

export const signupRoute = express();

signupRoute.post("/signup", async (req, res) => {
  const { data, success, error } = signupSchema.safeParse(req.body);
  if (!success)
    return res
      .status(400)
      .json({
        message: "invlaid credential",
        error: error.flatten().fieldErrors,
      });
  const { username, password } = data;

  const userExist = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  if (userExist)
    return res.status(409).json({ message: "User already exists" });

  const hashpassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      username,
      password: hashpassword,
    },
  });

  await createAuthSession(newUser.id, res);

  return res.status(201).json({
    message: "Account Successfully created",
  });
});
