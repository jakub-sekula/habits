import { PrismaClient, Log, Habit } from "@prisma/client";

const prisma = new PrismaClient();

export async function calculateStreaks(habit: Habit): Promise<{
  streakActive: boolean;
  currentStreak: number;
  longestStreak: number;
}> {
  const { frequency, period } = habit;
  const logs = await prisma.log.findMany({
    where: {
      habitId: habit.id,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const entriesPerPeriod = calculateEntriesPerPeriod(logs, period);

  // For new habits that don't have any logs yet
  if (Object.keys(entriesPerPeriod).length === 0) {
    return {
      streakActive: false,
      currentStreak: 0,
      longestStreak: 0,
    };
  }

  const consecutivePeriods = findConsecutivePeriods(
    entriesPerPeriod,
    period,
    frequency
  );

  const longestStreak = consecutivePeriods.reduce(
    (maxDuration, { duration }) => {
      return duration > maxDuration ? duration : maxDuration;
    },
    0
  );

  const { streakActive, currentStreak } = isStreakActive(
    consecutivePeriods,
    period
  );

  return {
    streakActive,
    currentStreak,
    longestStreak,
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

// Function to calculate logged count and total count for a habit in a given period
export async function calculateCounts(habit: Habit) {
  if (!habit) {
    throw new Error("Habit not found");
  }

  const today = new Date();
  const totalCount = habit.frequency;

  let startDate, endDate;

  switch (habit.period) {
    case "day":
      startDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      endDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1
      );
      break;
    case "week":
      const firstDayOfWeek = today.getDate() - today.getDay();
      startDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        firstDayOfWeek
      );
      endDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        firstDayOfWeek + 7
      );
      break;
    case "month":
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      break;
    case "year":
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = new Date(today.getFullYear() + 1, 0, 1);
      break;
    default:
      throw new Error("Invalid period");
  }

  const loggedCount = await prisma.log.count({
    where: {
      event: "done",
      habitId: habit.id,
      createdAt: {
        gte: startDate,
        lt: endDate,
      },
    },
  });

  // Total number of logs required in a period for a streak to count
  const countsForStreak = loggedCount >= habit.frequency;

  return {
    loggedCount,
    totalCount,
    countsForStreak,
  };
}

export function generateProgressString(
  loggedCount: number,
  totalCount: number,
  period: string
) {
  const countString = `${loggedCount} of ${totalCount}`;

  if (period === "day") {
    return `${countString} today`;
  } else if (period === "week") {
    return `${countString} this week`;
  } else if (period === "month") {
    return `${countString} this month`;
  } else if (period === "year") {
    return `${countString} this year`;
  } else {
    return countString;
  }
}

function findConsecutivePeriods(
  entriesByPeriod: { [period: string]: number },
  period: string,
  frequency: number
): Array<{ periodStart: string; periodEnd: string; duration: number }> {
  const consecutivePeriods: Array<{
    periodStart: string;
    periodEnd: string;
    duration: number;
  }> = [];
  let periodStart: string = "";
  let periodEnd: string = "";

  Object.keys(entriesByPeriod).forEach((key, index) => {
    const value = entriesByPeriod[key];

    if (value >= frequency) {
      if (periodStart === "") {
        periodStart = key;
      }
      periodEnd = key;
    } else {
      if (periodStart !== "" && periodEnd !== "") {
        consecutivePeriods.push({
          periodStart,
          periodEnd,
          duration: calculateDuration(periodStart, periodEnd, period),
        });
        periodStart = "";
        periodEnd = "";
      }
    }

    if (
      index === Object.keys(entriesByPeriod).length - 1 &&
      periodStart !== "" &&
      periodEnd !== ""
    ) {
      consecutivePeriods.push({
        periodStart,
        periodEnd,
        duration: calculateDuration(periodStart, periodEnd, period),
      });
    }
  });

  return consecutivePeriods;
}

function calculateDuration(
  periodStart: string,
  periodEnd: string,
  period: string
): number {
  let start: number;
  let end: number;

  switch (period) {
    case "day":
      start = new Date(periodStart).getTime();
      end = new Date(periodEnd).getTime();
      return Math.floor((end - start) / (1000 * 3600 * 24)) + 1;

    case "week":
      start = parseInt(periodStart.slice(periodStart.indexOf("Wk") + 2));
      end = parseInt(periodEnd.slice(periodEnd.indexOf("Wk") + 2));
      return Math.abs(end - start) + 1;

    case "month":
      const startYear = parseInt(
        periodStart.slice(0, periodStart.indexOf("-"))
      );
      const startMonth = parseInt(
        periodStart.slice(periodStart.indexOf("-") + 1)
      );
      const endYear = parseInt(periodEnd.slice(0, periodEnd.indexOf("-")));
      const endMonth = parseInt(periodEnd.slice(periodEnd.indexOf("-") + 1));
      const monthsPerYear = 12;
      const yearDiff = endYear - startYear;
      const monthDiff = endMonth - startMonth;
      return monthsPerYear * yearDiff + monthDiff + 1;

    case "year":
      start = parseInt(periodStart);
      end = parseInt(periodEnd);
      return Math.abs(end - start) + 1;

    default:
      return 0;
  }
}

function calculateEntriesPerPeriod(
  logs: Log[],
  period: string
): { [period: string]: number } {
  const entriesPerPeriod: { [period: string]: number } = {};

  if (logs.length === 0) return entriesPerPeriod;

  logs.forEach((log) => {
    const date = log.createdAt.toISOString().split("T")[0];
    const periodKey = getPeriodFromDate(date, period);

    if (entriesPerPeriod[periodKey]) {
      entriesPerPeriod[periodKey]++;
    } else {
      entriesPerPeriod[periodKey] = 1;
    }
  });

  return entriesPerPeriod;
}

function getPeriodFromDate(date: string, period: string): string {
  switch (period) {
    case "day":
      const adjustedDate = new Date(date);
      adjustedDate.setDate(adjustedDate.getDate() + 1);
      return date;
    // return adjustedDate.toISOString().split("T")[0];;
    case "week":
      const weekNumber = getWeekNumber(new Date(date));
      return `${new Date(date).getFullYear()}-Wk${weekNumber + 1}`;
    case "month":
      const [year, month] = date.split("-");
      return `${year}-${month + 1}`;
    case "year":
      return date.split("-")[0];
    default:
      return "";
  }
}

function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const daysOffset = firstDayOfYear.getDay() - 1;
  const firstMondayOfYear = new Date(
    date.getFullYear(),
    0,
    1 + (daysOffset <= 0 ? 7 : 0) - daysOffset
  );
  const diff = date.getTime() - firstMondayOfYear.getTime();
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
}

function isStreakActive(
  consecutivesArray: {
    periodStart: string;
    periodEnd: string;
    duration: number;
  }[],
  period: string
): { streakActive: boolean; currentStreak: number } {
  let streakActive = false,
    currentStreak = 0;

  try {
    const length = consecutivesArray.length;
    const date = new Date().toISOString().split("T")[0];

    const duration = calculateDuration(
      consecutivesArray[length - 1].periodEnd,
      date,
      period
    );

    if (
      consecutivesArray[length - 1].periodEnd ===
        getPeriodFromDate(date, period) ||
      duration === 2
    ) {
      streakActive = true;
      currentStreak = consecutivesArray[length - 1].duration;
    }
    return { streakActive, currentStreak };
  } catch (err) {
    console.log(err);
    return { streakActive: false, currentStreak: 0 };
  }
}
