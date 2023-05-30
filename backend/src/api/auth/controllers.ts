import "dotenv/config.js";
import { Request, Response, NextFunction } from "express";
import passport = require("passport");
import { PrismaClient, Prisma, User, Account } from "@prisma/client";
import bcrypt = require("bcrypt");

declare global {
  namespace Express {
    interface User {
      username: string;
      id: number;
    }
  }
}

const prisma = new PrismaClient();

// Google login functions

const GoogleStrategy = require("passport-google-oauth20").Strategy;

async function verifyGoogle(
  accessToken: string,
  refreshToken: string,
  profile: any,
  done: Function
) {
  try {
    const user = (await prisma.user.findUnique({
      where: {
        email: profile._json.email,
      },
    })) as User;

    if (!user) {
      console.log("User does not exist");
      return done(null, false, {
        message: "Incorrect username or password",
      });
    }

    return done(null, user, { message: "Logged in Successfully" });
  } catch (err) {
    return done(err);
  }
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    verifyGoogle
  )
);

export async function loginGoogle(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log("logging in innit");
  passport.authenticate("google", {
    session: false,
    scope: ["profile", "email"],
  })(req, res, next);
}

export async function loginGoogleCallback(
  req: Request,
  res: Response,
  next: NextFunction
) {
  passport.authenticate(
    "google",
    {
      session: false,
      failureRedirect: "/login",
    },
    async (err: any, user: User, info: any) => {
      console.log("google user", user);
      try {
        if (err) {
          return res.json({ error: "error while signing in" });
        }

        if (!user) {
          const user = await prisma.user.create({
            data: {
              username: "sranńsko",
              password: "gówno",
            },
          });
          req.login(user, { session: false }, async (error) => {
            if (error) return next(error);
  
            const body = {
              id: user.id,
              email: user.email,
              username: user.username,
            };
            const access_token = jwt.sign({ user: body }, process.env.JWT_SECRET);
  
            return res.json({ user: body, access_token });
          });
        } else {

          req.login(user, { session: false }, async (error) => {
            if (error) return next(error);
  
            const body = {
              id: user.id,
              email: user.email,
              username: user.username,
            };
            const access_token = jwt.sign({ user: body }, process.env.JWT_SECRET);
  
            return res.json({ user: body, access_token });
          });
        }

      } catch (error) {
        console.log(error);
        return next(error);
      }
    }
  )(req, res, next);
}

// Github login functions

let GithubStrategy = require("passport-github2");

async function verifyGithub(
  accessToken: string,
  refreshToken: string,
  profile: any,
  done: Function
) {
  console.log({ accessToken, refreshToken });
  return done(null, profile._json);
}

passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/github/callback",
    },
    verifyGithub
  )
);

export async function loginGithub(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log("logging in innit");
  passport.authenticate("github", { session: false, scope: ["user:email"] })(
    req,
    res
  );
}

export async function loginGithubCallback(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log("what do we have here");

  passport.authenticate("github", {
    session: false,
    failureRedirect: "/login",
  })(req, res, next),
    function (req: Request, res: Response) {
      // Successful authentication, redirect home.
      console.log("sranie");
      next();
    };
}

// Local registration and login functions

const LocalStrategy = require("passport-local");

async function verifyLocal(username: string, password: string, done: Function) {
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

passport.use(
  new LocalStrategy(verifyLocal, {
    session: false,
  })
);

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
      const access_token = jwt.sign({ user: body }, process.env.JWT_SECRET);

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

        return res.json({ error: "error while signing in" });
      }

      req.login(user, { session: false }, async (error) => {
        if (error) return next(error);

        const body = {
          id: user.id,
          email: user.email,
          username: user.username,
        };
        const access_token = jwt.sign({ user: body }, process.env.JWT_SECRET);

        return res.json({ user: body, access_token });
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
}

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

// Configure JWT strategy

const jwt = require("jsonwebtoken");
const JWTstrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;

passport.use(
  "jwt",
  new JWTstrategy(
    {
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      session: false,
    },
    async (token: any, done: Function) => {
      try {
        if (token.user) {
          return done(null, token.user);
        } else {
          return done(null, false);
        }
      } catch (error) {
        done(error);
      }
    }
  )
);
