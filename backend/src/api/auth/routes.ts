import express from "express";
import {
  logoutUser,
  registerUser,
  loginUser
} from "./controllers";

import { VerifyToken } from "@/middlewares/verifyFirebaseToken";

const router = express.Router();

router.post("/logout", logoutUser);

router.post("/login", loginUser)

router.post("/register", registerUser);

export default router;
