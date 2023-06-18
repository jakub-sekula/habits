import { Request, Response } from "express";
import { default as logServices } from "./services";
import { pick } from "@utils";
import { DecodedIdToken } from "firebase-admin/auth";
import { Log, PrismaClient } from "@prisma/client";

import { default as habitUtils } from "@/api/habits/utils";
const prisma = new PrismaClient();

async function getLogs(req: Request, res: Response) {
  // await new Promise((resolve)=>setTimeout(resolve,2000))

  let filter = pick(req.query, ["habitId", "createdAt"]);
  if (Object.keys(filter).length === 0) {
    filter = { userId: (req.user as DecodedIdToken).uid };
  }
  const options = pick(req.query, ["sortBy", "sortType", "limit", "page"]);
  const result = await logServices.queryLogs(filter, options);
  res.send(result);
}

function getLast28DaysArray() {
  const today = new Date(); // Current date
  const last28Days = [];

  for (let i = 27; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    last28Days.push(date.toISOString().split("T")[0]);
  }

  return last28Days;
}

function countEntriesByDay(entries: Log[], last28Days: string[]) {
  const counts: { [day: string]: { [event: string]: number } } = {}; // Add type annotation
  // Initialize counts for each day to 0
  for (const day of last28Days) {
    counts[day] = { done: 0, skipped: 0 };
  }

  // Count entries for each day
  for (const entry of entries) {
    const createdAt = new Date(entry.createdAt);
    const createdAtDay = createdAt.toISOString().split("T")[0];

    if (counts.hasOwnProperty(createdAtDay)) {
      if (entry.event === "done") counts[createdAtDay].done++;
      if (entry.event === "skipped") counts[createdAtDay].skipped++
    }
  }

  return counts;
}

async function getLast28Days(req: Request, res: Response) {
  let filter = {
    habitId: (req.query.habitId as string) || undefined,
    userId: (req.user as DecodedIdToken).uid,
  };

  const options = pick(req.query, ["sortBy", "sortType", "limit", "page"]);
  const result = await logServices.queryLogs(filter, options);

  const clustered = countEntriesByDay(result.logs, getLast28DaysArray());
  res.send(clustered);
}

async function logHabit(req: Request, res: Response) {
  const { habitId } = req.query as { habitId: string };
  try {
    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
    });
    if (!habit) return res.sendStatus(404);

    const initialHabit = await habitUtils.getHabitDetails(habit);

    let log = await prisma.log.create({
      data: {
        event: req.body.event,
        habit: {
          connect: { id: habitId },
        },
        user: {
          connect: { uid: (req.user as DecodedIdToken).uid },
        },
      },
    });

    const updatedHabit = await habitUtils.getHabitDetails(initialHabit);

    await prisma.habit.update({
      where: { id: updatedHabit.id },
      data: {
        score: updatedHabit.score,
      },
    });

    const pointsAdded = updatedHabit.score - initialHabit.score;

    const totalScore = await prisma.habit.aggregate({
      _sum: { score: true },
      where: { userId: (req.user as DecodedIdToken).uid },
    });

    log = await prisma.log.update({
      where: { id: log.id },
      data: {
        habit_score: updatedHabit.score,
        total_score: totalScore._sum.score as number,
        points_added: pointsAdded,
      },
    });

    return res.status(201).json({
      ...log,
      habit: await habitUtils.getHabitDetails(habit),
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
}

export default { logHabit, getLogs, getLast28Days };
