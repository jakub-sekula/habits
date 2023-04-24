import { Request, Response } from "express";
import { PrismaClient, Prisma, Log, Habit } from "@prisma/client";
import { calculateStreak, calculateStreakInterval } from "./streaks";

declare global {
  namespace Express {
    interface User {
      username: string;
      id: number;
    }
  }
}

const prisma = new PrismaClient();

/**
 * Fetches all habits from the database.
 *
 * @function
 * @async
 * @param {Request} req - The request object from Express.
 * @param {Response} res - The response object from Express.
 * @returns {Promise<void>} - A Promise that resolves to a JSON response with habit data or an error status.
 */
async function getAllHabits(req: Request, res: Response) {
  if (!req.user) return res.sendStatus(401);

  try {
    const habits = await prisma.habit.findMany({
      where: { user: { id: req.user.id } },
    });
    if (!habits) return res.sendStatus(404);
    return res.status(200).json(habits);
  } catch (err) {
    return res.status(500).send(`Error getting habit`);
  }
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
  const { id } = req.params;
  try {
    // get habit
    const habit = await prisma.habit.findUnique({ where: { id: Number(id) } });
    if (!habit) return res.sendStatus(404);
    if (habit.userId != req.user?.id) return res.sendStatus(401);

    const streak = await calculateStreak(habit);

    return res.status(200).json({ ...habit, ...streak });
  } catch (err) {
    return res.status(500).send(`Error getting habit`);
  }
}

async function createHabit(req: Request, res: Response) {
  const user = await prisma.user.findUnique({
    where: { username: req.user?.username },
  });

  if (!user) return res.sendStatus(400);

  let { name, frequency, period, weekdays, reminder, image, color } = req.body;

  const streakInterval =
    !!frequency && !!period
      ? calculateStreakInterval(Number(frequency), period)
      : undefined;

  const habitInput: Prisma.HabitCreateInput = {
    name,
    period,
    weekdays,
    reminder,
    color,
    image,
    streakInterval,
    frequency,
    user: {
      connect: { id: user.id },
    },
  };

  try {
    const data = await prisma.habit.create({ data: habitInput });
    return res.status(201).json(data);
  } catch (err) {
    return res.status(500).json(`error creating habit`);
  }
}

async function updateHabit(req: Request, res: Response) {
  const { id } = req.params;
  const { name, frequency, period, weekdays, reminder } = req.body;

  const habit = {
    name,
    frequency,
    period,
    weekdays,
    reminder,
  };

  try {
    const data = await prisma.habit.update({
      where: { id: Number(id) },
      data: habit,
    });
    if (!data) return res.sendStatus(404);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).send("Error while updating habit!");
  }
}

async function deleteHabit(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const data = await prisma.habit.delete({ where: { id: Number(id) } });
    if (!data) return res.sendStatus(404);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).send("Error while deleting habit!");
  }
}

async function logHabit(req: Request, res: Response) {
  const { id } = req.params;

  const { event } = req.body;

  try {
    const habit = await prisma.habit.findUnique({ where: { id: Number(id) } });
    if (!habit) return res.sendStatus(404);

    // Find last non-duplicate log
    const previousLog = await prisma.log.findFirst({
      where: { habit: { id: habit.id }, event: "done" },
      orderBy: { createdAt: "desc" },
    });

    const previousLogTime = previousLog?.createdAt;

    const isDuplicated = previousLogTime
      ? (new Date().getTime() - previousLog?.createdAt.getTime()) / 1000 <
        habit.streakInterval * 0.9
      : false;

    const logInput: Prisma.LogCreateInput = {
      event: !isDuplicated ? event : `${event} - duplicated`,
      habit: {
        connect: { id: habit.id },
      },
    };

    const log = await prisma.log.create({ data: logInput });

    return res.status(201).json(log);
  } catch (err) {
    return res.status(500).send(`Error getting habit`);
  }
}

export {
  getAllHabits,
  getHabit,
  createHabit,
  updateHabit,
  deleteHabit,
  logHabit,
};
