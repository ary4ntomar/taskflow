import express from "express";
import { createHash } from "node:crypto";
import { prisma } from "../config/db.js";

export const logoutRoute = express();

logoutRoute.post("/logout", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    const tokenHash = createHash("sha256").update(refreshToken).digest("hex");

    await prisma.refreshToken.updateMany({
      where: {
        tokenHash,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  const isProd = process.env.NODE_ENV === "production";

  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: (isProd ? "none" : "lax") as "none" | "lax",
    path: "/",
  };

  res.clearCookie("refreshToken", cookieOptions);
  res.clearCookie("accessToken", cookieOptions);

  return res.status(200).json({
    message: "Logout Successfull",
  });
});
