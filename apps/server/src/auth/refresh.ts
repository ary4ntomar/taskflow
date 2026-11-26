import express from "express";
import { prisma } from "../config/db.js";
import { randomBytes, createHash } from "node:crypto";
import jwt from "jsonwebtoken";

export const refreshRoute = express();

refreshRoute.post("/refresh", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken)
    return res.status(401).json({ message: "Token is missing" });

  const hashToken = createHash("sha256").update(refreshToken).digest("hex");

  const tokenExist = await prisma.refreshToken.findUnique({
    where: {
      tokenHash: hashToken,
    },
  });

  if (
    !tokenExist ||
    tokenExist.expireAt <= new Date() ||
    tokenExist.revokedAt !== null
  )
    return res.status(401).json({ message: "Unauthorized request" });

  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  const accessToken = jwt.sign({ sub: tokenExist.userId }, JWT_SECRET, {
    expiresIn: "15m",
  });

  const newRefreshToken = randomBytes(64).toString("hex");

  const newTokenHash = createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");

  const newExpireAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const rotated = await prisma.$transaction(async (tx) => {
    const oldToken = await tx.refreshToken.updateMany({
      where: {
        id: tokenExist.id,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    if (oldToken.count !== 1) {
      return false;
    }

    await tx.refreshToken.create({
      data: {
        userId: tokenExist.userId,
        tokenHash: newTokenHash,
        expireAt: newExpireAt,
      },
    });

    return true;
  });
  if (!rotated) {
    return res.status(401).json({
      message: "Refresh token already used",
    });
  }

  const isProd = process.env.NODE_ENV === "production";

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    message: "Tokens refreshed successfully",
  });
});
