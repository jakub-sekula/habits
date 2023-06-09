import auth from "@/firebase-config";
import { Request, Response, NextFunction } from "express";
import { FirebaseError } from "firebase-admin";

export const VerifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.headers.authorization)
    return res.status(400).json("Missing authorization header");
  const token = req.headers?.authorization.split(" ")[1] as string;
  if (!token || token == "undefined") return res.status(400).json("Invalid or missing token");

  try {
    const decodeValue = await auth.verifyIdToken(token);
    if (decodeValue) {
      req.user = decodeValue;
      return next();
    }
  } catch (e) {
    const error = e as FirebaseError
    if (
      error?.code === "auth/id-token-expired" 
     ) {
      return res.status(401).json("Unauthorized");
    }
    console.log("Error in verifyFirebaseToken: ", e);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
