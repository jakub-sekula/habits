import auth from "@/firebase-config";
import { Request, Response, NextFunction } from "express";

export const VerifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.headers.authorization)
    return res.status(400).json("Missing authorization header");
  const token = req.headers?.authorization.split(" ")[1] as string;
  if (!token) return res.status(400).json("Invalid or missing token");

  try {
    const decodeValue = await auth.verifyIdToken(token);
    if (decodeValue) {
      req.user = decodeValue;
      return next();
    }
  } catch (e) {
    console.log("Error in verifyFirebaseToken: ", e);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
