import express, { json, Request, Response, NextFunction } from "express";
import passport = require("passport");
import cors from "cors";

import authRouter from "./api/auth/routes";
import usersRouter from "./api/users/routes";
import habitsRouter from "./api/habits/routes";
import { User } from "@prisma/client";

const app = express();

app.use(json());
app.use(
  cors({
    origin: ["http://localhost:3001"],
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  })
);


app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the homepage",
    user: req?.user,
  });
});

app.use("/auth", authRouter);
app.use("/users", ensureAuthenticated, usersRouter);
app.use("/habits", ensureAuthenticated, habitsRouter);

app.use((req, res, next) => {
  res.status(404).send();
});

export default app;

function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  passport.authenticate("jwt", { session: false }, (err: any, user: User) => {
    if (err) {
      return next(err);
    }
    req.user = user; // Set req.user with the authenticated user or null
    next();
  })(req, res, next);
}
