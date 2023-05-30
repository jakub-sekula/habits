import auth from "@/firebase-config";
import { Request, Response, NextFunction } from "express";

export const VerifyToken = async (req: Request, res: Response, next: NextFunction) => {
  if(!req.headers.authorization) return res.status(401).json("Unauthorized - missing token")
  const token = req.headers?.authorization.split(" ")[1] as string

  try {
    const decodeValue = await auth.verifyIdToken(token);
    if (decodeValue) {
      req.user = decodeValue
      return next();
    }
  } catch (e) {
    return res.json({ message: "Internal Error" });
  }
};