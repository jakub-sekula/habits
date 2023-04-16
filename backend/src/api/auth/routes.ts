import express from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
} from "./controllers";

const router = express.Router();

router.post("/login", loginUser);

router.post("/logout", logoutUser);

router.post("/register", registerUser);

export default router;
