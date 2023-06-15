import express, { json } from "express";
import { VerifyToken } from "@/middlewares/verifyFirebaseToken";
import { errorHandler, errorConverter } from "./middlewares/error";

import cors from "cors";

import authRouter from "./api/auth/routes";
import usersRouter from "./api/users/routes";
import habitsRouter from "./api/habits/routes";

const app = express();

app.use(json());
app.use(
  cors({
    origin: ["http://localhost:3001"],
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  })
);

app.use("/auth", VerifyToken, authRouter);
app.use("/users", VerifyToken, usersRouter);
app.use("/habits", VerifyToken, habitsRouter);

app.get("/", VerifyToken, async (req, res) => {
  res.json({
    token: req.headers?.authorization,
    user: req.user,
  });
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

app.use((req, res, next) => {
  res.status(404).send();
});

export default app;
