import "dotenv/config.js";
import { Request, Response, NextFunction } from "express";
import { DecodedIdToken } from "firebase-admin/auth";
import { PrismaClient, User } from "@prisma/client";
import { seed } from "@/../prisma/seed";

declare global {
  namespace Express {
    interface Request {
      user?: DecodedIdToken;
    }
  }
}

const prisma = new PrismaClient();

export async function registerUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user) return res.status(401).json("Unauthorizred");

  const user = await prisma.user.findUnique({
    where: {
      uid: req.user.uid,
    },
  });

  if (user) return next();
  try {
    const user = await prisma.user.create({
      data: {
        uid: req.user.uid,
        username: req.user?.username,
        email: req.user?.email,
        image: req.user?.image,
      },
    });

    res.json({ message: "User created successfully", user: user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error creating user" });
  }
}

export async function loginUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user) return res.status(401).json("Unauthorizred");

  const user = await prisma.user.findUnique({
    where: {
      uid: req.user.uid,
    },
  });

  console.log("User found in local db: ", user);

  if (!user) {
    try {
      const user = await prisma.user.create({
        data: {
          uid: req.user.uid,
          username: req.user?.username,
          email: req.user?.email,
          image: req.user?.image,
        },
      });

      res.json({ message: "User created successfully", user: user });
    } catch (error) {
      console.log(error);
      res.status(500).send("Error creating user");
    }
  } else {
    return res.status(200).json("Success");
  }
}
