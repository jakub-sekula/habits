import {
  calculateCounts,
  calculateStreaks,
  generateProgressString,
} from "@/lib/streaks";
import { PrismaClient, Habit } from "@prisma/client";
const prisma = new PrismaClient();

async function getHabitDetails(habit: Habit, date: Date = new Date()) {
  const progressString = await generateProgressString(habit, date);
  const streaks = await calculateStreaks(habit);

  const { loggedCount, requiredCount } = await calculateCounts(habit, date);

  const completed_for_period = loggedCount >= requiredCount;

  const logsCount = await prisma.log.count({
    where: { habitId: habit.id },
  });
  return {
    ...habit,
    ...streaks,
    completed_for_period,
    progressString,
    logsCount,
  };
}

export default {
  getHabitDetails,
};
