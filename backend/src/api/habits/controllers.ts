import { Request, Response } from "express";
import { PrismaClient, Prisma, Log, Habit } from "@prisma/client";
import {
  calculateStreaks,
  calculateStreakInterval,
  calculateCounts,
  generateProgressString,
} from "./streaks";

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
      where: { user: { uid: req.user.uid } },
    });
    if (!habits) return res.sendStatus(404);

    const habitsWithStreaks = await Promise.all(
      habits.map(async (habit) => {
        const { loggedCount, totalCount } = await calculateCounts(habit);
        const progressString = generateProgressString(
          loggedCount,
          totalCount,
          habit.period
        );
        const streak = await calculateStreaks(habit);

        const logsCount = await prisma.log.count({
          where: { habitId: habit.id },
        });
        return { ...habit, ...streak, progressString, logsCount };
      })
    );

    return res.status(200).json(habitsWithStreaks);
  } catch (err) {
    console.log(err);

    return res.status(500).send(`Error getting habits`);
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
  if (!req.user) return res.status(401).send();
  const { id } = req.params;
  try {
    // get habit
    const habit = await prisma.habit.findUnique({ where: { id: id } });
    if (!habit) return res.sendStatus(404);
    if (habit.userId != req.user?.uid) return res.sendStatus(403);

    const { loggedCount, totalCount } = await calculateCounts(habit);
    const progressString = generateProgressString(
      loggedCount,
      totalCount,
      habit.period
    );
    const streak = await calculateStreaks(habit);

    return res.status(200).json({ ...habit, ...streak, progressString });
  } catch (err) {
    console.log(err);
    return res.status(500).send(`Error getting habit`);
  }
}

async function createHabit(req: Request, res: Response) {
  if (!req.user) return res.status(401).send();
  const user = await prisma.user.findUnique({
    where: { uid: req.user.uid },
  });

  if (!user) return res.sendStatus(400);

  let { name, frequency, period, weekdays, reminder, image, color } = req.body;

  // const streakInterval =
  //   !!frequency && !!period
  //     ? calculateStreakInterval(Number(frequency), period)
  //     : undefined;

  const habitInput: Prisma.HabitCreateInput = {
    name,
    period,
    weekdays: weekdays.length ? weekdays.join(",") : null,
    reminder,
    color,
    image,
    // streakInterval,
    frequency: Number(frequency),
    user: {
      connect: { uid: user.uid },
    },
  };

  try {
    const data = await prisma.habit.create({ data: habitInput });
    return res.status(201).json(data);
  } catch (err) {
    console.log(err);
    return res.status(500).json(`error creating habit`);
  }
}

async function updateHabit(req: Request, res: Response) {
  if (!req.user) return res.status(401).send();
  const allowedParams = [
    "name",
    "frequency",
    "period",
    "weekdays",
    "color",
    "image",
    "reminder",
  ];

  const receivedParams = Object.keys(req.body);
  const disallowedParams = receivedParams.filter(
    (param) => !allowedParams.includes(param)
  );

  if (disallowedParams.length > 0) {
    return res
      .status(400)
      .json({ message: "Bad request: Invalid parameters.", disallowedParams });
  }

  const { id } = req.params;
  const { name, frequency, period, weekdays, color, image, reminder } =
    req.body;

  const habit = {
    name,
    frequency,
    period,
    weekdays,
    reminder,
    color,
    image,
  };

  try {
    const data = await prisma.habit.update({
      where: { id: id },
      data: habit,
    });
    if (!data) return res.sendStatus(404);
    return res.status(200).json(data);
  } catch (err) {
    console.log(err);
    return res.status(500).send("Error while updating habit!");
  }
}

async function deleteHabit(req: Request, res: Response) {
  if (!req.user) return res.status(401).send();
  const { id } = req.params;
  try {
    const data = await prisma.habit.delete({ where: { id: id } });
    if (!data) return res.sendStatus(404);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).send("Error while deleting habit!");
  }
}

async function logHabit(req: Request, res: Response) {
  if (!req.user) return res.status(401).send();

  const { id } = req.params;
  const { event } = req.body;

  try {
    const habit = await prisma.habit.findUnique({ where: { id: id } });
    if (!habit) return res.sendStatus(404);

    const logInput: Prisma.LogCreateInput = {
      event: event,
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

async function getHabitLogs(req: Request, res: Response) {
  if (!req.user) return res.status(401).send();

  const { id } = req.params;

  try {
    const logs = await prisma.log.findMany({
      where: { habitId: id },
      orderBy: { createdAt: "desc" }, // Sort by createdAt in descending order
    });
    if (!logs.length) return res.sendStatus(404);
    return res.status(200).json(logs);
  } catch (err) {
    return res.status(500).send(`Error getting logs`);
  }
}

export {
  getAllHabits,
  getHabit,
  createHabit,
  updateHabit,
  deleteHabit,
  logHabit,
  getHabitLogs,
};
