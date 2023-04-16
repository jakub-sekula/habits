// import "dotenv/config.js";
import { Request, Response, NextFunction } from "express";
import passport = require("passport");
const LocalStrategy = require("passport-local");
import { PrismaClient, Prisma, User } from "@prisma/client";
import bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function verify(username: string, password: string, callback: Function) {
  const user = (await prisma.user.findUnique({
    where: {
      username: username,
    },
  })) as User;

  if (!user) {
    console.log("User does not exist");
    return callback(null, false, { message: "Incorrect username or password" });
  }

  const valid = await bcrypt.compare(password, user.hashed_password);

  if (!valid) {
    console.log("Incorrect credentials");
    return callback(null, false, {
      message: "Incorrect username or password.",
    });
  }

  return callback(null, user);
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


declare global {
	namespace Express {
	  interface User {
		username: string;
		id: number;
	  }
	}
  }

passport.serializeUser(function (user, callback: Function) {
  callback(null, { id: user.id, username: user.username });
});

passport.deserializeUser(function (user, callback: Function) {
  callback(null, user);
});

export async function loginUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  passport.authenticate("local", {
    successReturnToOrRedirect: "/",
    failureRedirect: "/login",
    failureMessage: true,
  })(req,res,next);

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
    salt: salt,
    hashed_password: hashed_password,
  };

  try {
    const user = await prisma.user.create({
      data: userCreateInput,
    });

    req.login(user, function (err) {
      if (err) {
        return next(err);
      }
      return res.status(201).json(user);
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error creating user");
  }
}


