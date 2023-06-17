import { Request, Response } from "express";
import { default as logServices } from "./services";
import { pick } from "@utils";
import { DecodedIdToken } from "firebase-admin/auth";
import { PrismaClient } from "@prisma/client";

import { default as habitUtils } from "@/api/habits/utils";
const prisma = new PrismaClient();

async function getLogs(req: Request, res: Response) {
  let filter = pick(req.query, ["habitId"]);
  if (Object.keys(filter).length === 0) {
    filter = {userId: (req.user as DecodedIdToken).uid}
  }
  const options = pick(req.query, ["sortBy", "sortType", "limit", "page"]);
  const result = await logServices.queryLogs(filter, options);
  res.send(result);
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

export default { logHabit, getLogs };
