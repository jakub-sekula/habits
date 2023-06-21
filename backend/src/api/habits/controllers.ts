import { Request, Response } from "express";
import { default as habitServices } from "./services";
import { pick } from "@utils";
import { PrismaClient, Habit } from "@prisma/client";
import { default as habitUtils } from "./utils";

import { DecodedIdToken } from "firebase-admin/auth";

const prisma = new PrismaClient();

async function getAllHabits(req: Request, res: Response) {
  // await new Promise((resolve) => setTimeout(resolve, 50));
  const filter = {
    user: { uid: (req.user as DecodedIdToken).uid },
    ...pick(req.query, ["period"]),
  }; //pick(req.query, ['period']);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await habitServices.queryHabits(filter, options);

  const date = req.query.date ? new Date(req.query.date as string) : undefined;

  const habitsWithDetails = await Promise.all(
    result.habits.map(async (habit) => {
      return await habitUtils.getHabitDetails(habit, date);
    })
  );

  result.habits = habitsWithDetails;
  res.send(result);
}

/**
 * Fetches a specific habit by its ID from the database and calculates streak information.
 *
 * @function
 * @async
 * @param {Request} req - The request object from Express.
 * @param {Response} res - The response object from Express.
 * @returns {Promise<void>} - A Promise that resolves to a JSON response with habit data and calculated streak information, or an error status.
 */
async function getHabit(req: Request, res: Response) {
  if (!req.user) return res.status(401).send();
  const { id } = req.params;
  try {
    // get habit
    const habit = await prisma.habit.findUnique({ where: { id: id } });
    if (!habit) return res.sendStatus(404);
    if (habit.userId != req.user?.uid) return res.sendStatus(403);

    const date = req.query.date
      ? new Date(req.query.date as string)
      : undefined;

    return res.status(200).json(await habitUtils.getHabitDetails(habit, date));
  } catch (err) {
    console.log(err);
    return res.status(500).send(`Error getting habit`);
  }
}

async function createHabit(req: Request, res: Response) {
  // if (!req.user) return res.status(401).send();

  const user = await prisma.user.findUnique({
    where: { uid: (req.user as DecodedIdToken).uid },
  });

  if (!user) return res.sendStatus(400);

  try {
    const habit = await prisma.habit.create({
      data: {
        ...req.body,
        weekdays:
          req.body.weekdays && req.body.weekdays.length
            ? req.body.weekdays.join(",")
            : null,
        user: {
          connect: { uid: user.uid },
        },
      },
    });
    return res.status(201).json(await habitUtils.getHabitDetails(habit));
  } catch (error: any) {
    console.log(error);
    return res.status(400).json({ errors: { ...error.errors } });
  }
}

async function updateHabit(req: Request, res: Response) {
  try {
    const data = await prisma.habit.update({
      where: { id: req.params.id },
      data: req.body,
    });
    if (!data) return res.sendStatus(404);
    return res.status(200).json(data);
  } catch (err) {
    console.log(err);
    return res.status(500).send("Error while updating habit!");
  }
}

async function deleteHabit(req: Request, res: Response) {
  try {
    const data = await prisma.habit.delete({ where: { id: req.params.id } });
    if (!data) return res.sendStatus(404);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).send("Error while deleting habit!");
  }
}

export default {
  getAllHabits,
  getHabit,
  createHabit,
  updateHabit,
  deleteHabit,
};


