import jwt from "jsonwebtoken";
import { randomBytes, createHash } from "node:crypto";
import type { Response } from "express";
import { prisma } from "../config/db.js";

export async function createAuthSession(userId: number, res: Response) {
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  const accessToken = jwt.sign({ sub: userId }, JWT_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = randomBytes(64).toString("hex");

  const tokenHash = createHash("sha256").update(refreshToken).digest("hex");

  const expireAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      expireAt,
    },
  });

  const isProd = process.env.NODE_ENV === "production";

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 15 * 60 * 1000,
    path: "/",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}
