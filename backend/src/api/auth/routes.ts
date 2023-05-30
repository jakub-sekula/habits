import express from "express";
import {
  loginUser,
  loginGithub,
  loginGithubCallback,
  logoutUser,
  registerUser,
  loginGoogle,
  loginGoogleCallback,
} from "./controllers";

const router = express.Router();

router.post("/login", loginUser);

router.get("/github", loginGithub);

router.get("/github/callback", loginGithubCallback, (req, res) => {
  res.json(req.user);
});

router.get("/google", loginGoogle);

router.get("/google/callback", loginGoogleCallback);

router.post("/logout", logoutUser);

router.post("/register", registerUser);

export default router;
