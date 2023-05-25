// import "dotenv/config.js";
declare global {
  namespace Express {
    interface User {
      username: string;
      id: number;
    }
  }
}

import { Request, Response, NextFunction } from "express";
import passport = require("passport");
const LocalStrategy = require("passport-local");
import { PrismaClient, Prisma, User } from "@prisma/client";
import bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function verify(username: string, password: string, done: Function) {
  try {
    const user = (await prisma.user.findUnique({
      where: {
        username: username,
      },
    })) as User;

    if (!user) {
      console.log("User does not exist");
      return done(null, false, {
        message: "Incorrect username or password",
      });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      console.log("Incorrect credentials");
      return done(null, false, {
        message: "Incorrect username or password.",
      });
    }
    return done(null, user, { message: "Logged in Successfully" });
  } catch (err) {
    return done(err);
  }
}

passport.use(new LocalStrategy(verify));

/* Configure session management.
 *
 * When a login session is established, information about the user will be
 * stored in the session.  This information is supplied by the `serializeUser`
 * function, which is yielding the user ID and username.
 *
 * As the user interacts with the app, subsequent requests will be authenticated
 * by verifying the session.  The same user information that was serialized at
 * session establishment will be restored when the session is authenticated by
 * the `deserializeUser` function.
 *
 * Since every request to the app needs the user ID and username, in order to
 * fetch todo records and render the user element in the navigation bar, that
 * information is stored in the session.
 */

passport.serializeUser(function (user, callback: Function) {
  callback(null, { id: user.id, username: user.username });
});

passport.deserializeUser(function (user, callback: Function) {
  callback(null, user);
});

const jwt = require("jsonwebtoken");

// export async function loginUser(
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) {
//   passport.authenticate("login", {
//     successReturnToOrRedirect: "/",
//     failureRedirect: "/login",
//     failureMessage: true,
//   })(req, res, next);
// }

export async function logoutUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
}

export async function registerUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: "Bad request" });

  const salt = await bcrypt.genSalt(10);
  const hashed_password = await bcrypt.hash(req.body.password, salt);

  const userCreateInput: Prisma.UserCreateInput = {
    username: req.body.username,
    password: hashed_password,
  };

  try {
    const { password, ...user } = await prisma.user.create({
      data: userCreateInput,
    });

    req.login(user, { session: false }, async (error) => {
      if (error) return next(error);

      const body = {
        id: user.id,
        email: user.email,
        username: user.username,
      };
      const access_token = jwt.sign({ user: body }, "TOP_SECRET");

      return res.json({ user: body, access_token });
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error creating user");
  }
}

export async function loginUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  passport.authenticate("local", async (err: any, user: User, info: any) => {
    try {
      if (err || !user) {
        const error = new Error("An error occurred.");

        return res.json({"error": "error while signing in"});
      }

      req.login(user, { session: false }, async (error) => {
        if (error) return next(error);

        const body = {
          id: user.id,
          email: user.email,
          username: user.username,
        };
        const access_token = jwt.sign({ user: body }, "TOP_SECRET");

        return res.json({ user: body, access_token });
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
}

const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

passport.use(
  'jwt',
  new JWTstrategy(
    {
      secretOrKey: 'TOP_SECRET',
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      session: false
    },
    async (token: any, done: Function) => {
      try {
        return done(null, token.user);
      } catch (error) {
        done(error);
      }
    }
  )
);
