import express, { json, Request, Response, NextFunction } from "express";
import expressSession from "express-session";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { PrismaClient } from "@prisma/client";
import passport = require("passport");
import cors from "cors";

import authRouter from "./api/auth/routes";
import usersRouter from "./api/users/routes";
import habitsRouter from "./api/habits/routes";

const prisma = new PrismaClient();
const app = express();

app.use(json());
app.use(
  cors({
    origin: ["http://localhost:3001"],
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  })
);
// app.use(
//   expressSession({
//     cookie: {
//       maxAge: 7 * 24 * 60 * 60 * 1000, // ms
//     },
//     secret: "a santa at nasa",
//     resave: true,
//     saveUninitialized: true,
//     store: new PrismaSessionStore(prisma, {
//       checkPeriod: 1000, //ms
//       dbRecordIdIsSessionId: true,
//       dbRecordIdFunction: undefined,
//     }),
//   })
// );
// app.use(passport.authenticate("session"));
app.use(passport.authenticate("jwt", {session: false}));

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the homepage",
    auth: req.isAuthenticated(),
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
  // if (req.isAuthenticated()) return next();
  /*else */passport.authenticate('jwt', { session: false })(req,res,next);
}
