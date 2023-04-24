import { PrismaClient, Log, Habit } from "@prisma/client";
import { getRelativeTimeString } from "@utils";
const prisma = new PrismaClient();

/**
 * Calculate the streak information for a given habit
 * @param habit - The habit object for which the streak is to be calculated
 * @returns - An object containing the current streak count, longest streak count, streak status, and streak expiration timestamp
 */
export async function calculateStreak(habit: Habit): Promise<{
  currentStreak: number;
  longestStreak: number;
  streakActive: boolean;
  streakExpiresTimestamp: number | null;
  streakExpires: string | null;
}> {
  //get all logs for the habit
  const entries = await prisma.log.findMany({
    where: {
      event: "done",
      habit: {
        id: habit.id,
      },
    },
  });

  // Sort the entries by createdAt property in ascending order
  entries.sort((a: Log, b: Log) => {
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  let longestStreak = 0;
  let currentStreak = 0;
  let previousTime: number | null = null;
  let streakActive = false;
  let streakExpiresTimestamp = null;
  let streakExpires = null;

  entries.forEach((entry: Log) => {
    if (!previousTime) {
      previousTime = new Date(entry.createdAt).getTime();
      currentStreak = 1;
    } else {
      const currentTime = new Date(entry.createdAt).getTime();
      const timeDifferenceSeconds = (currentTime - previousTime) / 1000; // in seconds

      // Increment streak if the difference between entries is less than 24 hours
      if (timeDifferenceSeconds < habit.streakInterval) {
        currentStreak++;
      } else {
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 1;
      }

      // Only show streak as active if it's active for more than 2 periods and
      // the current time is within the streak interval of the last entry
      if (
        currentStreak > 2 &&
        new Date().getTime() - currentTime < habit.streakInterval * 1000
      ) {
        streakActive = true;
      }

      streakExpiresTimestamp = currentTime + habit.streakInterval * 1000;
      streakExpires = getRelativeTimeString(streakExpiresTimestamp);
      previousTime = currentTime;
    }
  });

  // Check if the current Streak is longer than the longest Streak
  longestStreak = Math.max(longestStreak, currentStreak);

  if(!streakActive && currentStreak >= 2) currentStreak = 0

  return {
    currentStreak,
    longestStreak,
    streakActive,
    streakExpires,
    streakExpiresTimestamp,
  };
}

/**
 * Calculate the streak interval in seconds based on the frequency and period
 * @param frequency - The frequency of habit completion
 * @param period - The period of habit completion (second, minute, hour, day, week, fortnight, month, year)
 * @returns - The calculated streak interval in seconds
 */
export function calculateStreakInterval(
  frequency: number,
  period: string
): number {
  let periodNumeric = 24 * 60 * 60;

  switch (period) {
    case "second":
      periodNumeric = 1;
      break;
    case "minute":
      periodNumeric = 60;
      break;
    case "hour":
      periodNumeric = 60 * 60;
      break;
    case "day":
      periodNumeric = 24 * 60 * 60;
      break;
    case "week":
      periodNumeric = 7 * 24 * 60 * 60;
      break;
    case "fortnight":
      periodNumeric = 14 * 24 * 60 * 60;
      break;
    case "month":
      periodNumeric = 30 * 24 * 60 * 60;
      break;
    case "year":
      periodNumeric = 365 * 24 * 60 * 60;
      break;
    default:
      break;
  }

  const intervalSeconds = periodNumeric * frequency;

  return intervalSeconds;
}
